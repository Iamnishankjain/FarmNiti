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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// Enable CORS only for /api routes
app.use('/api', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('🚀 FarmNiti API is live! Use /api routes.');
});

// Health check route
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

// Start server only if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export app for serverless deployment (Vercel)
module.exports = app;
