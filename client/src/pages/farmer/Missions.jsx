import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { missionsAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const Missions = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    season: ''
  });

  useEffect(() => {
    fetchMissions();
  }, [filters]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const response = await missionsAPI.getAll(filters);
      setMissions(response.data.missions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      season: ''
    });
  };

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

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('farmer.missions')}</h1>
        <p className="mt-2 text-gray-600">Browse and start sustainable farming missions</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              className="input"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="soil">Soil</option>
              <option value="water">Water</option>
              <option value="crops">Crops</option>
              <option value="organic">Organic</option>
              <option value="community">Community</option>
              <option value="weather">Weather</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              className="input"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              className="input"
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
            >
              <option value="">All Seasons</option>
              <option value="kharif">Kharif</option>
              <option value="rabi">Rabi</option>
              <option value="zaid">Zaid</option>
              <option value="all">Year Round</option>
            </select>
          </div>

          <div className="pt-7">
            <button
              onClick={clearFilters}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      {missions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No missions found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <Link
              key={mission._id}
              to={`/farmer/missions/${mission._id}`}
              className="mission-card"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Missions;
