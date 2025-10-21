const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const fileUpload = require('express-fileupload');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// CORS only for /api routes
app.use('/api', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Health check route (no CORS needed)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FarmNiti API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export app for Vercel serverless deployment
module.exports = app;
