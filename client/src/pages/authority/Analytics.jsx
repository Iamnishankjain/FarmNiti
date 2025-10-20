import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [missionStats, setMissionStats] = useState(null);
  const [regionStats, setRegionStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [coinStats, setCoinStats] = useState(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [missionsRes, regionsRes, growthRes, coinsRes] = await Promise.all([
        analyticsAPI.getMissionStats(),
        analyticsAPI.getRegionStats(),
        analyticsAPI.getUserGrowth(period),
        analyticsAPI.getCoinUsage()
      ]);

      setMissionStats(missionsRes.data);
      setRegionStats(regionsRes.data);
      setUserGrowth(growthRes.data.data);
      setCoinStats(coinsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await analyticsAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'farmniti-analytics.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('analytics.title')}</h1>
            <p className="mt-2 text-gray-600">Comprehensive platform analytics and insights</p>
          </div>
          <button onClick={handleExportCSV} className="btn btn-primary">
            📥 {t('analytics.downloadCSV')}
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Time Period:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPeriod(7)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 7
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('analytics.last7Days')}
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 30
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('analytics.last30Days')}
            </button>
            <button
              onClick={() => setPeriod(90)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 90
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('analytics.last90Days')}
            </button>
          </div>
        </div>
      </div>

      {/* Mission Overview */}
      {missionStats && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mission Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Missions</p>
              <p className="text-3xl font-bold text-blue-700">{missionStats.overall.totalMissions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Participations</p>
              <p className="text-3xl font-bold text-green-700">{missionStats.overall.totalParticipations}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Completions</p>
              <p className="text-3xl font-bold text-yellow-700">{missionStats.overall.totalCompletions}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-purple-700">{missionStats.overall.completionRate}%</p>
            </div>
          </div>

          {/* Mission Category Breakdown */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Missions</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Participants</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Completions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(missionStats.categoryBreakdown).map(([category, data]) => (
                  <tr key={category} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">{category}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">{data.count}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">{data.participants}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">{data.completions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Growth Chart */}
      {userGrowth && userGrowth.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('analytics.userGrowth')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" name="New Users" strokeWidth={2} />
              <Line type="monotone" dataKey="totalUsers" stroke="#22c55e" name="Total Users" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Region-wise Statistics */}
      {regionStats && regionStats.byState && regionStats.byState.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('analytics.regionWiseAdoption')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* State-wise Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By State</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionStats.byState.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="farmers" fill="#22c55e" name="Farmers" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* State Statistics Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top States</h3>
              <div className="overflow-y-auto max-h-[300px]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">State</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Farmers</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Total XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {regionStats.byState.map((state) => (
                      <tr key={state._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{state._id || 'Unknown'}</td>
                        <td className="px-4 py-2 text-sm text-center text-gray-700">{state.farmers}</td>
                        <td className="px-4 py-2 text-sm text-center text-gray-700">{state.totalXP}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Green Coin Analytics */}
      {coinStats && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('analytics.greenCoinUsage')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">Total Coins Earned</p>
              <p className="text-4xl font-bold text-green-700">{coinStats.coinStats.totalCoinsEarned}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">Coins in Circulation</p>
              <p className="text-4xl font-bold text-blue-700">{coinStats.coinStats.totalCoinsInCirculation}</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">Coins Spent</p>
              <p className="text-4xl font-bold text-yellow-700">{coinStats.coinStats.totalCoinsSpent}</p>
            </div>
          </div>

          {/* Reward Type Distribution */}
          {coinStats.rewardTypeBreakdown && coinStats.rewardTypeBreakdown.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward Redemption by Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={coinStats.rewardTypeBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, totalRedemptions }) => `${_id}: ${totalRedemptions}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalRedemptions"
                    >
                      {coinStats.rewardTypeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {coinStats.rewardTypeBreakdown.map((reward, index) => (
                    <div key={reward._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium text-gray-900 capitalize">{reward._id}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {reward.totalRedemptions} redemptions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
