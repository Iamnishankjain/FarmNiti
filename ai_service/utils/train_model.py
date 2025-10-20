"""
Enhanced model training script for crop disease detection using PyTorch
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader
import os
import json

class CropDiseaseModel:
    """
    Crop disease detection model using transfer learning (PyTorch)
    """
    def __init__(self, num_classes, model_type='mobilenet', device=None):
        self.num_classes = num_classes
        self.model_type = model_type
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.class_names = []

        # Use GradScaler only if GPU is available
        self.use_amp = torch.cuda.is_available()
        if self.use_amp:
            from torch.cuda.amp import GradScaler
            self.scaler = GradScaler()
        else:
            self.scaler = None

    def create_model(self):
        """
        Create model using transfer learning
        """
        if self.model_type == 'mobilenet':
            base_model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
            in_features = base_model.classifier[1].in_features
            base_model.classifier = nn.Sequential(
                nn.Dropout(0.3),
                nn.Linear(in_features, 256),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(256, self.num_classes)
            )
        elif self.model_type == 'resnet':
            base_model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
            in_features = base_model.fc.in_features
            base_model.fc = nn.Sequential(
                nn.Dropout(0.3),
                nn.Linear(in_features, 256),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(256, self.num_classes)
            )
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")

        self.model = base_model.to(self.device)
        print(f"Model created on {self.device}")
        return self.model

    def compile_model(self, learning_rate=0.001):
        """
        Define loss function and optimizer
        """
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)

    def train(self, train_loader, val_loader, epochs=50):
        """
        Train the model
        """
        best_acc = 0.0
        for epoch in range(epochs):
            self.model.train()
            running_loss = 0.0
            running_corrects = 0
            total = 0

            for inputs, labels in train_loader:
                inputs, labels = inputs.to(self.device), labels.to(self.device)

                self.optimizer.zero_grad()
                if self.use_amp:
                    from torch.cuda.amp import autocast
                    with autocast():
                        outputs = self.model(inputs)
                        loss = self.criterion(outputs, labels)
                    self.scaler.scale(loss).backward()
                    self.scaler.step(self.optimizer)
                    self.scaler.update()
                else:
                    outputs = self.model(inputs)
                    loss = self.criterion(outputs, labels)
                    loss.backward()
                    self.optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                _, preds = torch.max(outputs, 1)
                running_corrects += torch.sum(preds == labels.data)
                total += labels.size(0)

            epoch_loss = running_loss / total
            epoch_acc = running_corrects.double() / total
            val_acc = self.evaluate(val_loader, print_results=False)

            print(f"Epoch {epoch+1}/{epochs}: "
                  f"Train Loss: {epoch_loss:.4f} "
                  f"Train Acc: {epoch_acc:.4f} "
                  f"Val Acc: {val_acc:.4f}")

            if val_acc > best_acc:
                best_acc = val_acc
                self.save_model('model/best_model.pth')

        print("Training complete.")

    def evaluate(self, data_loader, print_results=True):
        """
        Evaluate model
        """
        self.model.eval()
        running_corrects = 0
        total = 0

        with torch.no_grad():
            for inputs, labels in data_loader:
                inputs, labels = inputs.to(self.device), labels.to(self.device)
                outputs = self.model(inputs)
                _, preds = torch.max(outputs, 1)
                running_corrects += torch.sum(preds == labels.data)
                total += labels.size(0)

        acc = running_corrects.double() / total
        if print_results:
            print(f"Accuracy: {acc:.4f}")
        return acc

    def predict(self, image_tensor):
        """
        Predict single image
        """
        self.model.eval()
        image_tensor = image_tensor.to(self.device)
        with torch.no_grad():
            outputs = self.model(image_tensor)
            _, preds = torch.max(outputs, 1)
            confidence = torch.softmax(outputs, dim=1)[0, preds].item()
        return preds.item(), confidence

    def save_model(self, path='model/crop_disease_model.pth'):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save(self.model.state_dict(), path)
        print(f"Model saved to {path}")

    def load_model(self, path='model/crop_disease_model.pth'):
        if self.model is None:
            self.create_model()
        self.model.load_state_dict(torch.load(path, map_location=self.device))
        self.model.to(self.device)
        print(f"Model loaded from {path}")


def prepare_dataset(data_dir, batch_size=32, img_size=224):
    """
    Prepare dataset using torchvision
    """
    transform = transforms.Compose([
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(20),
        transforms.RandomResizedCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    dataset = datasets.ImageFolder(data_dir, transform=transform)
    num_classes = len(dataset.classes)

    val_size = int(0.2 * len(dataset))
    train_size = len(dataset) - val_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])

    pin_memory = torch.cuda.is_available()
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2, pin_memory=pin_memory)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=pin_memory)

    return train_loader, val_loader, dataset.classes


def main():
    DATA_DIR = 'data/'  # Put your dataset folder here
    EPOCHS = 50
    BATCH_SIZE = 32

    if not os.path.exists(DATA_DIR):
        print(f"❌ Data directory not found: {DATA_DIR}")
        return

    print("📊 Preparing datasets...")
    train_loader, val_loader, class_names = prepare_dataset(DATA_DIR, batch_size=BATCH_SIZE)
    NUM_CLASSES = len(class_names)
    print(f"✅ Found {NUM_CLASSES} classes: {class_names}")

    print("🔧 Creating model...")
    model = CropDiseaseModel(num_classes=NUM_CLASSES, model_type='mobilenet')
    model.create_model()
    model.compile_model()
    model.class_names = class_names

    print("🚀 Starting training...")
    model.train(train_loader, val_loader, epochs=EPOCHS)

    print("💾 Saving class labels...")
    os.makedirs('model', exist_ok=True)
    with open('model/class_labels.json', 'w') as f:
        json.dump({'classes': class_names}, f)

    print("✅ Training complete!")


if __name__ == '__main__':
    main()
