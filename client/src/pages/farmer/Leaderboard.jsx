import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const Leaderboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('allTime');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getLeaderboard(period);
      setFarmers(response.data.farmers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-gray-100 to-gray-200';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('leaderboard.title')}
        </h1>
        <p className="text-gray-600">Top farmers leading the sustainable revolution</p>
      </div>

      {/* Period Filter */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setPeriod('thisWeek')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              period === 'thisWeek'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('leaderboard.thisWeek')}
          </button>
          <button
            onClick={() => setPeriod('thisMonth')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              period === 'thisMonth'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('leaderboard.thisMonth')}
          </button>
          <button
            onClick={() => setPeriod('allTime')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              period === 'allTime'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('leaderboard.allTime')}
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {farmers.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getRankColor(2)} flex items-center justify-center text-white font-bold text-2xl mb-3`}>
              {farmers[1].name.charAt(0).toUpperCase()}
            </div>
            <span className="text-3xl mb-2">🥈</span>
            <h3 className="font-bold text-gray-900">{farmers[1].name}</h3>
            <p className="text-sm text-gray-600">{farmers[1].village}</p>
            <p className="text-lg font-bold text-gray-700 mt-2">{farmers[1].xp} XP</p>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getRankColor(1)} flex items-center justify-center text-white font-bold text-3xl mb-3 border-4 border-yellow-300`}>
              {farmers[0].name.charAt(0).toUpperCase()}
            </div>
            <span className="text-4xl mb-2">👑</span>
            <h3 className="font-bold text-xl text-gray-900">{farmers[0].name}</h3>
            <p className="text-sm text-gray-600">{farmers[0].village}</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{farmers[0].xp} XP</p>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-16">
            <div className={`w-18 h-18 rounded-full bg-gradient-to-br ${getRankColor(3)} flex items-center justify-center text-white font-bold text-xl mb-3`}>
              {farmers[2].name.charAt(0).toUpperCase()}
            </div>
            <span className="text-3xl mb-2">🥉</span>
            <h3 className="font-bold text-gray-900">{farmers[2].name}</h3>
            <p className="text-sm text-gray-600">{farmers[2].village}</p>
            <p className="text-lg font-bold text-gray-700 mt-2">{farmers[2].xp} XP</p>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  {t('leaderboard.rank')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  {t('leaderboard.farmer')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  {t('leaderboard.location')}
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  {t('leaderboard.level')}
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  {t('leaderboard.xp')}
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Green Coins
                </th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer, index) => {
                const isCurrentUser = farmer._id === user.id;
                return (
                  <tr
                    key={farmer._id}
                    className={`border-b border-gray-100 transition-colors ${
                      isCurrentUser ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-4">
                      <span className="text-2xl font-bold">
                        {getRankBadge(index + 1)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                          {farmer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {farmer.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {farmer.village && farmer.district
                        ? `${farmer.village}, ${farmer.district}`
                        : farmer.state || '-'
                      }
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                        Lv {farmer.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-primary-700">
                      {farmer.xp}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-green-700">
                      {farmer.greenCoins}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Your Position (if not in top ranks) */}
      {!farmers.slice(0, 10).find(f => f._id === user.id) && (
        <div className="card mt-6 bg-primary-50 border-2 border-primary-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Your Position</p>
            <p className="text-3xl font-bold text-primary-700">
              Keep farming to climb the ranks! 🌾
            </p>
            <p className="text-gray-600 mt-2">
              Level {user.level} • {user.xp} XP • {user.greenCoins} Green Coins
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
