import React, { useState, useEffect } from 'react';
import { weatherAPI } from '../../services/api';

const WeatherWidget = ({ location }) => {
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

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="card bg-gradient-to-br from-blue-400 to-blue-600 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm">Weather in {weather.location}</p>
          <p className="text-4xl font-bold mt-1">{Math.round(weather.temperature)}°C</p>
          <p className="text-blue-100 text-sm capitalize mt-2">{weather.description}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl mb-2">
            {weather.icon ? `☁️` : '☀️'}
          </div>
          <p className="text-sm text-blue-100">💧 {weather.humidity}%</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
