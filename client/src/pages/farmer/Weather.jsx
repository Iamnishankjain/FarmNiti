import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { weatherAPI } from '../../services/api';
import WeatherWidget from '../../components/farmer/WeatherWidget';
import Loader from '../../components/common/Loader';

const Weather = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [forecast, setForecast] = useState([]);
  const [weatherMissions, setWeatherMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const location = user?.district || user?.state || 'Mumbai';
      
      const [forecastRes, missionsRes] = await Promise.all([
        weatherAPI.getForecast(location),
        weatherAPI.getWeatherMissions()
      ]);

      setForecast(forecastRes.data.forecast);
      setWeatherMissions(missionsRes.data.missions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('weather.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          Current weather and farming recommendations
        </p>
      </div>

      {/* Current Weather */}
      <div className="mb-8">
        <WeatherWidget location={user?.district || user?.state || 'Mumbai'} />
      </div>

      {/* 5-Day Forecast */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('weather.forecast')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center"
            >
              <p className="text-sm text-gray-600 mb-2">{day.date}</p>
              <div className="text-3xl mb-2">☁️</div>
              <p className="text-2xl font-bold text-blue-700 mb-1">
                {Math.round(day.temperature.temp)}°C
              </p>
              <p className="text-xs text-gray-600 capitalize">{day.description}</p>
              <p className="text-xs text-gray-500 mt-2">💧 {day.humidity}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weather-Based Missions */}
      {weatherMissions.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('weather.weatherBasedMissions')}
          </h2>
          <div className="space-y-4">
            {weatherMissions.map((mission) => (
              <div
                key={mission._id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-all"
              >
                <h3 className="font-semibold text-lg">{mission.title.en}</h3>
                <p className="text-gray-600 text-sm mt-1">{mission.description.en}</p>
                <div className="flex items-center mt-3 space-x-4">
                  <span className="badge badge-primary">{mission.difficulty}</span>
                  <span className="text-sm text-gray-500">⭐ {mission.rewards.xp} XP</span>
                  <span className="text-sm text-gray-500">💚 {mission.rewards.greenCoins}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
