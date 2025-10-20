import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AuthorityDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboardStats();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('common.welcome')}, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600">{t('authority.dashboard')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">{t('authority.totalFarmers')}</p>
              <p className="text-3xl font-bold mt-1">{stats?.stats.totalFarmers || 0}</p>
            </div>
            <div className="text-4xl">👨‍🌾</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">{t('authority.activeMissions')}</p>
              <p className="text-3xl font-bold mt-1">{stats?.stats.activeMissions || 0}</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">{t('authority.completionRate')}</p>
              <p className="text-3xl font-bold mt-1">{stats?.stats.completionRate || 0}%</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Posts</p>
              <p className="text-3xl font-bold mt-1">{stats?.stats.totalPosts || 0}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/authority/missions" className="card hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="text-4xl mr-4">🎯</div>
            <div>
              <h3 className="font-semibold text-lg">{t('authority.manageMissions')}</h3>
              <p className="text-gray-600 text-sm">Create and manage missions</p>
            </div>
          </div>
        </Link>

        <Link to="/authority/users" className="card hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="text-4xl mr-4">👥</div>
            <div>
              <h3 className="font-semibold text-lg">{t('authority.manageUsers')}</h3>
              <p className="text-gray-600 text-sm">View all farmers</p>
            </div>
          </div>
        </Link>

        <Link to="/authority/analytics" className="card hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="flex items-center">
            <div className="text-4xl mr-4">📈</div>
            <div>
              <h3 className="font-semibold text-lg">{t('authority.analytics')}</h3>
              <p className="text-gray-600 text-sm">View detailed reports</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Mission Categories */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Mission Categories Distribution</h3>
          {stats?.missionCategories && stats.missionCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.missionCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.missionCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        {/* Green Coins Stats */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Green Coins Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Coins Earned</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats?.stats.totalCoinsEarned || 0}
                </p>
              </div>
              <div className="text-4xl">💚</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Average per Farmer</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats?.stats.avgCoinsPerFarmer || 0}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Farmers */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Top Performing Farmers</h3>
          <Link to="/authority/users" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        {stats?.topFarmers && stats.topFarmers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Farmer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Level</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">XP</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Green Coins</th>
                </tr>
              </thead>
              <tbody>
                {stats.topFarmers.map((farmer, index) => (
                  <tr key={farmer._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="text-2xl font-bold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                          {farmer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{farmer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {farmer.village || '-'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="badge badge-secondary">Lv {farmer.level}</span>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-primary-700">
                      {farmer.xp}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-green-700">
                      {farmer.greenCoins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No farmers data available</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Community Activity</h3>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((post) => (
              <div key={post._id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {post.user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{post.user.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
