const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const Mission = require('../models/Mission');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// @desc    Get current weather
// @route   GET /api/weather/current
// @access  Public
router.get('/current', async (req, res) => {
  try {
    const { location, lat, lon } = req.query;
    
    let url = `${OPENWEATHER_BASE_URL}/weather?appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (location) {
      url += `&q=${location}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide location or coordinates'
      });
    }
    
    const response = await axios.get(url);
    const weatherData = response.data;
    
    // Format weather data
    const formattedWeather = {
      location: weatherData.name,
      country: weatherData.sys.country,
      temperature: weatherData.main.temp,
      feelsLike: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      windSpeed: weatherData.wind.speed,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      clouds: weatherData.clouds.all,
      timestamp: weatherData.dt
    };
    
    res.json({
      success: true,
      weather: formattedWeather
    });
  } catch (error) {
    console.error('Weather API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather data',
      error: error.response?.data?.message || error.message
    });
  }
});

// @desc    Get weather forecast
// @route   GET /api/weather/forecast
// @access  Public
router.get('/forecast', async (req, res) => {
  try {
    const { location, lat, lon, days = 5 } = req.query;
    
    let url = `${OPENWEATHER_BASE_URL}/forecast?appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (location) {
      url += `&q=${location}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide location or coordinates'
      });
    }
    
    const response = await axios.get(url);
    const forecastData = response.data;
    
    // Format forecast data (group by day)
    const dailyForecast = [];
    const processedDays = new Set();
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!processedDays.has(date) && dailyForecast.length < days) {
        dailyForecast.push({
          date: date,
          timestamp: item.dt,
          temperature: {
            temp: item.main.temp,
            min: item.main.temp_min,
            max: item.main.temp_max
          },
          humidity: item.main.humidity,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: item.wind.speed,
          clouds: item.clouds.all,
          pop: item.pop // Probability of precipitation
        });
        
        processedDays.add(date);
      }
    });
    
    res.json({
      success: true,
      location: forecastData.city.name,
      country: forecastData.city.country,
      forecast: dailyForecast
    });
  } catch (error) {
    console.error('Weather Forecast Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching forecast data',
      error: error.response?.data?.message || error.message
    });
  }
});

// @desc    Get weather-based mission recommendations
// @route   GET /api/weather/missions
// @access  Private
router.get('/missions', protect, async (req, res) => {
  try {
    const { lat, lon, location } = req.query;
    
    // Get current weather
    let weatherUrl = `${OPENWEATHER_BASE_URL}/weather?appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    if (lat && lon) {
      weatherUrl += `&lat=${lat}&lon=${lon}`;
    } else if (location) {
      weatherUrl += `&q=${location}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide location or coordinates'
      });
    }
    
    const weatherResponse = await axios.get(weatherUrl);
    const weather = weatherResponse.data;
    
    // Extract weather parameters
    const temperature = weather.main.temp;
    const humidity = weather.main.humidity;
    const rainfall = weather.rain ? weather.rain['1h'] || 0 : 0;
    
    // Find missions matching current weather conditions
    const matchingMissions = await Mission.find({
      isActive: true,
      $or: [
        {
          'weatherCondition.temperature.min': { $lte: temperature },
          'weatherCondition.temperature.max': { $gte: temperature }
        },
        {
          'weatherCondition.humidity.min': { $lte: humidity },
          'weatherCondition.humidity.max': { $gte: humidity }
        },
        {
          weatherCondition: { $exists: false }
        }
      ]
    }).limit(10);
    
    // Generate weather-based recommendations
    const recommendations = [];
    
    if (rainfall > 0) {
      recommendations.push({
        type: 'alert',
        message: {
          en: 'Rainfall detected! Check drainage systems and cover sensitive crops.',
          hi: 'वर्षा का पता चला! जल निकासी प्रणाली की जाँच करें और संवेदनशील फसलों को ढकें।'
        }
      });
    }
    
    if (temperature > 35) {
      recommendations.push({
        type: 'alert',
        message: {
          en: 'High temperature! Ensure adequate irrigation and provide shade to crops.',
          hi: 'उच्च तापमान! पर्याप्त सिंचाई सुनिश्चित करें और फसलों को छाया प्रदान करें।'
        }
      });
    }
    
    if (humidity > 80) {
      recommendations.push({
        type: 'alert',
        message: {
          en: 'High humidity! Monitor for fungal diseases and improve ventilation.',
          hi: 'उच्च आर्द्रता! कवक रोगों की निगरानी करें और वेंटिलेशन में सुधार करें।'
        }
      });
    }
    
    res.json({
      success: true,
      weather: {
        temperature,
        humidity,
        rainfall,
        description: weather.weather[0].description
      },
      missions: matchingMissions,
      recommendations
    });
  } catch (error) {
    console.error('Weather Mission Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating weather-based missions',
      error: error.response?.data?.message || error.message
    });
  }
});

// @desc    Get agricultural weather alerts
// @route   GET /api/weather/alerts
// @access  Public
router.get('/alerts', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const url = `${OPENWEATHER_BASE_URL}/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    const alerts = data.alerts || [];
    
    res.json({
      success: true,
      count: alerts.length,
      alerts: alerts.map(alert => ({
        event: alert.event,
        start: alert.start,
        end: alert.end,
        description: alert.description,
        source: alert.sender_name
      }))
    });
  } catch (error) {
    console.error('Weather Alerts Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather alerts',
      error: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
