import cv2
import numpy as np
from PIL import Image
import torch
from torchvision import transforms

class ImageProcessor:

    @staticmethod
    def validate_image(image):
        """
        Validate image size and brightness.
        Works with PIL.Image or NumPy array.
        """
        # Convert PIL Image to numpy
        if isinstance(image, Image.Image):
            image = np.array(image)

        if len(image.shape) < 2:
            return False, "Invalid image format."

        height, width = image.shape[:2]

        if height < 100 or width < 100:
            return False, "Image is too small. Please upload a larger image."
        if height > 5000 or width > 5000:
            return False, "Image is too large. Please upload a smaller image."

        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        mean_brightness = np.mean(gray)
        if mean_brightness < 20:
            return False, "Image is too dark. Please take photo in better lighting."
        if mean_brightness > 235:
            return False, "Image is too bright. Please reduce exposure."

        return True, "Image is valid"

    @staticmethod
    def preprocess_image(image, target_size=(224, 224), device=None):
        """
        Convert image to tensor
        """
        if isinstance(image, Image.Image):
            image = np.array(image)

        image = cv2.resize(image, target_size)
        image = image.astype('float32') / 255.0

        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])
        image_tensor = transform(image)
        image_tensor = image_tensor.unsqueeze(0)
        device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        return image_tensor.to(device)

    @staticmethod
    def enhance_image(image):
        if isinstance(image, Image.Image):
            image = np.array(image)
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
        return enhanced

    @staticmethod
    def detect_crop_region(image):
        if isinstance(image, Image.Image):
            image = np.array(image)
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            padding = 20
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(image.shape[1] - x, w + 2 * padding)
            h = min(image.shape[0] - y, h + 2 * padding)
            return image[y:y+h, x:x+w]

        return image
