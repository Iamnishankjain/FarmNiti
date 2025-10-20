import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const MissionCard = ({ mission }) => {
  const { language } = useLanguage();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      soil: '🌱',
      water: '💧',
      crops: '🌾',
      organic: '🍃',
      community: '👥',
      weather: '🌦️'
    };
    return icons[category] || '🎯';
  };

  return (
    <Link
      to={`/farmer/missions/${mission._id}`}
      className="mission-card block"
    >
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
        <span className="text-6xl">{getCategoryIcon(mission.category)}</span>
        <div className="absolute top-4 right-4">
          <span className={`badge ${getDifficultyColor(mission.difficulty)}`}>
            {mission.difficulty}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {mission.title[language]}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {mission.description[language]}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              ⭐ {mission.rewards.xp} XP
            </span>
            <span className="text-sm text-gray-500">
              💚 {mission.rewards.greenCoins}
            </span>
          </div>
          <span className="text-xs text-gray-400 capitalize">
            {mission.season}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            👥 {mission.participants?.length || 0} joined
          </span>
          <span className="text-primary-600 font-medium">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MissionCard;
