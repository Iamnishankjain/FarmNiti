# 🌾 FarmNiti - Sustainable Farming Gamified Learning Platform

A bilingual (English-Hindi) MERN stack platform that gamifies sustainable farming education through missions, AI crop advisory, and community engagement.

## 🚀 Features

- 🌐 **Bilingual Support**: Full English ↔ Hindi language toggle
- 🎮 **Gamification**: Missions, XP, badges, and leaderboards
- 🤖 **AI Crop Doctor**: Disease detection and organic solutions
- 🎤 **Voice Assistant**: Local language speech for accessibility
- 📊 **Analytics Dashboard**: Authority insights and reports
- 💚 **Green Coins**: Reward system for sustainable practices
- 🌦️ **Weather Integration**: Dynamic missions based on local conditions
- 👥 **Community Features**: Social wall, challenges, and discussions

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (v5+)
- Python (v3.8+)
- npm or yarn

## 🛠️ Installation

### 1. Clone Repository
git clone <repository-url>
cd FarmNiti

text

### 2. Backend Setup
cd server
npm install
cp .env.example .env

Edit .env with your credentials
npm run dev

text

### 3. Frontend Setup
cd client
npm install
cp .env.example .env

Edit .env with API URL
npm start

text

### 4. AI Service Setup
cd ai-service
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

text

## 🔧 Environment Variables

### Server (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmniti
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENWEATHER_API_KEY=your_openweather_key

text

### Client (.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_AI_SERVICE_URL=http://localhost:8000

text

## 📦 Tech Stack

**Frontend**: React.js, Tailwind CSS, i18next, Axios, Recharts
**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
**AI Service**: Python, Flask, TensorFlow, OpenCV
**Voice**: Vosk, Coqui TTS

## 🎯 User Roles

- **👨‍🌾 Farmer**: Complete missions, earn rewards, access AI advisory
- **🧑‍💼 Authority**: Manage missions, view analytics, assign rewards

## 📱 Mobile Responsive

Fully responsive design optimized for mobile devices and low-bandwidth areas.

## 📄 License

MIT License

## 👨‍💻 Developer

Built with ❤️ for sustainable farming