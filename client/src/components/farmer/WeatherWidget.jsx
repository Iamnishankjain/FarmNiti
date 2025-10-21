import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { weatherAPI } from '../../services/api';

const WeatherWidget = ({ location }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location) {
      fetchWeather();
    }
  }, [location]);

  const fetchWeather = async () => {
    try {
      const response = await weatherAPI.getCurrent(location);
      setWeather(response.data.weather);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  // Translate weather descriptions
  const getWeatherDescription = (description) => {
    const weatherTranslations = {
      'clear sky': {
        en: 'Clear Sky',
        hi: 'साफ आसमान'
      },
      'few clouds': {
        en: 'Few Clouds',
        hi: 'कुछ बादल'
      },
      'scattered clouds': {
        en: 'Scattered Clouds',
        hi: 'बिखरे बादल'
      },
      'broken clouds': {
        en: 'Broken Clouds',
        hi: 'टूटे बादल'
      },
      'overcast clouds': {
        en: 'Overcast Clouds',
        hi: 'घने बादल'
      },
      'shower rain': {
        en: 'Shower Rain',
        hi: 'बौछार'
      },
      'rain': {
        en: 'Rain',
        hi: 'बारिश'
      },
      'light rain': {
        en: 'Light Rain',
        hi: 'हल्की बारिश'
      },
      'moderate rain': {
        en: 'Moderate Rain',
        hi: 'मध्यम बारिश'
      },
      'heavy rain': {
        en: 'Heavy Rain',
        hi: 'भारी बारिश'
      },
      'thunderstorm': {
        en: 'Thunderstorm',
        hi: 'आंधी-तूफान'
      },
      'snow': {
        en: 'Snow',
        hi: 'बर्फबारी'
      },
      'mist': {
        en: 'Mist',
        hi: 'धुंध'
      },
      'fog': {
        en: 'Fog',
        hi: 'कोहरा'
      },
      'haze': {
        en: 'Haze',
        hi: 'धुंधलापन'
      },
      'dust': {
        en: 'Dust',
        hi: 'धूल'
      },
      'smoke': {
        en: 'Smoke',
        hi: 'धुआं'
      }
    };

    const lowerDesc = description?.toLowerCase() || '';
    
    // Try to find exact match
    if (weatherTranslations[lowerDesc]) {
      return weatherTranslations[lowerDesc][language];
    }

    // Try partial match
    for (const key in weatherTranslations) {
      if (lowerDesc.includes(key)) {
        return weatherTranslations[key][language];
      }
    }

    // Default: return original description
    return description;
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="card bg-gray-100 text-center py-8">
        <p className="text-gray-500">
          {language === 'hi' ? 'मौसम की जानकारी उपलब्ध नहीं है' : 'Weather information unavailable'}
        </p>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-blue-400 to-blue-600 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-blue-100 text-sm mb-1">
            {language === 'hi' ? 'मौसम' : 'Weather'} - {weather.location}
          </p>
          <p className="text-4xl font-bold mt-1">{Math.round(weather.temperature)}°C</p>
          <p className="text-blue-100 text-sm capitalize mt-2">
            {getWeatherDescription(weather.description)}
          </p>
          
          {/* Additional Weather Info */}
          <div className="mt-3 space-y-1">
            <p className="text-sm text-blue-100">
              <span className="font-medium">
                {language === 'hi' ? 'महसूस होता है:' : 'Feels like:'}
              </span>{' '}
              {Math.round(weather.feelsLike)}°C
            </p>
            <p className="text-sm text-blue-100">
              <span className="font-medium">
                {language === 'hi' ? 'आर्द्रता:' : 'Humidity:'}
              </span>{' '}
              {weather.humidity}%
            </p>
            <p className="text-sm text-blue-100">
              <span className="font-medium">
                {language === 'hi' ? 'हवा की गति:' : 'Wind Speed:'}
              </span>{' '}
              {weather.windSpeed} {language === 'hi' ? 'मी/से' : 'm/s'}
            </p>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-6xl mb-3">
            {getWeatherIcon(weather.description)}
          </div>
          <p className="text-xs text-blue-100">
            {language === 'hi' ? 'अभी अपडेट किया' : 'Just now'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get weather icon based on description
const getWeatherIcon = (description) => {
  const lowerDesc = description?.toLowerCase() || '';
  
  if (lowerDesc.includes('clear')) return '☀️';
  if (lowerDesc.includes('cloud')) return '☁️';
  if (lowerDesc.includes('rain') || lowerDesc.includes('drizzle')) return '🌧️';
  if (lowerDesc.includes('thunder') || lowerDesc.includes('storm')) return '⛈️';
  if (lowerDesc.includes('snow')) return '❄️';
  if (lowerDesc.includes('mist') || lowerDesc.includes('fog')) return '🌫️';
  if (lowerDesc.includes('dust') || lowerDesc.includes('sand')) return '🌪️';
  if (lowerDesc.includes('smoke') || lowerDesc.includes('haze')) return '😶‍🌫️';
  
  return '🌤️'; // Default
};

export default WeatherWidget;
