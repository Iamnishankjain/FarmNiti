import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { missionsAPI, userAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentMissions, setRecentMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [missionsRes] = await Promise.all([
        missionsAPI.getAll({ limit: 3 })
      ]);

      setRecentMissions(missionsRes.data.missions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const currentLevelXP = (user?.level - 1) * 100;
    const nextLevelXP = user?.level * 100;
    const progress = ((user?.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(progress, 100);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('common.welcome')}, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">{t('farmer.dashboard')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* XP Card */}
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">{t('farmer.myXP')}</p>
              <p className="text-3xl font-bold mt-1">{user?.xp || 0}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <p className="text-xs text-primary-100 mt-2">
              {100 - (user?.xp % 100)} XP to Level {(user?.level || 0) + 1}
            </p>
          </div>
        </div>

        {/* Level Card */}
        <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-100 text-sm">{t('farmer.level')}</p>
              <p className="text-3xl font-bold mt-1">{user?.level || 1}</p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>

        {/* Green Coins Card */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">{t('farmer.greenCoins')}</p>
              <p className="text-3xl font-bold mt-1">{user?.greenCoins || 0}</p>
            </div>
            <div className="text-4xl">💚</div>
          </div>
        </div>

        {/* Missions Card */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">{t('farmer.completedMissions')}</p>
              <p className="text-3xl font-bold mt-1">{user?.completedMissions?.length || 0}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/farmer/missions" className="card hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="text-4xl mr-4">🎯</div>
            <div>
              <h3 className="font-semibold text-lg">{t('farmer.missions')}</h3>
              <p className="text-gray-600 text-sm">Browse available missions</p>
            </div>
          </div>
        </Link>

        <Link to="/farmer/ai-doctor" className="card hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="text-4xl mr-4">🤖</div>
            <div>
              <h3 className="font-semibold text-lg">{t('farmer.aiDoctor')}</h3>
              <p className="text-gray-600 text-sm">Diagnose crop diseases</p>
            </div>
          </div>
        </Link>

        <Link to="/farmer/rewards" className="card hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="text-4xl mr-4">🎁</div>
            <div>
              <h3 className="font-semibold text-lg">{t('farmer.rewards')}</h3>
              <p className="text-gray-600 text-sm">Redeem your coins</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Missions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('farmer.availableMissions')}</h2>
          <Link to="/farmer/missions" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        {recentMissions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No missions available</p>
        ) : (
          <div className="space-y-4">
            {recentMissions.map((mission) => (
              <Link
                key={mission._id}
                to={`/farmer/missions/${mission._id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{mission.title.en}</h3>
                    <p className="text-gray-600 text-sm mt-1">{mission.description.en}</p>
                    <div className="flex items-center mt-3 space-x-4">
                      <span className="badge badge-primary">{mission.difficulty}</span>
                      <span className="text-sm text-gray-500">
                        ⭐ {mission.rewards.xp} XP
                      </span>
                      <span className="text-sm text-gray-500">
                        💚 {mission.rewards.greenCoins} Coins
                      </span>
                    </div>
                  </div>
                  <div className="text-4xl ml-4">🎯</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Badges Section */}
      {user?.badges && user.badges.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('farmer.badges')}</h2>
          <div className="flex flex-wrap gap-4">
            {user.badges.map((badge, index) => (
              <div key={index} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-4xl mb-2">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-700">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
