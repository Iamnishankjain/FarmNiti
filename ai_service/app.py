from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import torch
from PIL import Image
import io
import numpy as np
from utils.train_model import CropDiseaseModel
from utils.image_processor import ImageProcessor
from utils.disease_database import DISEASE_DATABASE
import json

# Load .env variables
load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("PORT", 5000))
DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"
NUM_CLASSES = int(os.getenv("NUM_CLASSES", 15))
MODEL_PATH = os.getenv("MODEL_PATH", "model/best_model.pth")
CLASS_LABELS_PATH = os.getenv("CLASS_LABELS_PATH", "model/class_labels.json")

# Load class labels
with open(CLASS_LABELS_PATH, "r") as f:
    class_labels = json.load(f)["classes"]

# Load PyTorch model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CropDiseaseModel(num_classes=NUM_CLASSES)
model.load_model(MODEL_PATH)
model.model.to(device)
model.model.eval()
print(f"Model loaded from {MODEL_PATH} on {device}")

@app.route('/analyze', methods=['POST'])
def analyze_crop():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image provided'}), 400

        file = request.files['image']
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        img_np = np.array(image)

        # Validate image
        is_valid, msg = ImageProcessor.validate_image(img_np)
        if not is_valid:
            print(f"Warning: image validation failed: {msg}")
            return jsonify({'success': False, 'message': msg}), 400

        # Process image
        img_np = ImageProcessor.enhance_image(img_np)
        img_np = ImageProcessor.detect_crop_region(img_np)
        image_tensor = ImageProcessor.preprocess_image(img_np, device=device)

        # Predict
        with torch.no_grad():
            outputs = model.model(image_tensor)
            if outputs.ndim == 1:
                outputs = outputs.unsqueeze(0)
            
            # Apply softmax only if model outputs logits
            probs = torch.softmax(outputs, dim=1)
            confidence_tensor, pred_idx_tensor = torch.max(probs, dim=1)
            
            pred_idx = pred_idx_tensor.item()
            confidence = round(float(confidence_tensor.item()) * 100, 2)  # 0-100%
            disease_key = class_labels[pred_idx]

        # Get disease info
        language = request.args.get('lang', 'en')
        disease_info = DISEASE_DATABASE.get(disease_key, DISEASE_DATABASE['Tomato_healthy'])

        response = {
            'success': True,
            'disease': disease_info['name'].get(language, disease_info['name']['en']),
            'confidence': confidence,
            'isHealthy': "healthy" in disease_key.lower(),
            'organicSolution': disease_info['solution'].get(language, disease_info['solution']['en']),
            'preventionTips': disease_info['prevention'].get(language, disease_info['prevention']['en'])
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'success': False, 'message': 'Error analyzing image'}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
