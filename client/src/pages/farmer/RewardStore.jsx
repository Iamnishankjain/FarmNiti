import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { rewardsAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const RewardStore = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [myRewards, setMyRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('store');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsRes, myRewardsRes] = await Promise.all([
        rewardsAPI.getAll(),
        rewardsAPI.getUserRewards()
      ]);
      
      setRewards(rewardsRes.data.rewards);
      setMyRewards(myRewardsRes.data.rewards);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId, cost) => {
    if (user.greenCoins < cost) {
      alert(t('rewards.insufficientCoins'));
      return;
    }

    if (!window.confirm(`Redeem this reward for ${cost} Green Coins?`)) {
      return;
    }

    try {
      const response = await rewardsAPI.redeem(rewardId);
      
      // Update user's green coins
      updateUser({ greenCoins: response.data.remainingCoins });
      
      alert(t('rewards.redeemed'));
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert(error.response?.data?.message || 'Failed to redeem reward');
    }
  };

  const getRewardIcon = (type) => {
    const icons = {
      certificate: '📜',
      coupon: '🎟️',
      badge: '🏅',
      physical: '📦'
    };
    return icons[type] || '🎁';
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('rewards.title')}</h1>
            <p className="mt-2 text-gray-600">Redeem your Green Coins for rewards</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('rewards.yourCoins')}</p>
            <p className="text-4xl font-bold text-green-600">{user?.greenCoins || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'store'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('rewards.availableRewards')}
        </button>
        <button
          onClick={() => setActiveTab('my-rewards')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'my-rewards'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('rewards.myRewards')} ({myRewards.length})
        </button>
      </div>

      {/* Store Tab */}
      {activeTab === 'store' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div key={reward._id} className="card hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{getRewardIcon(reward.type)}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {reward.title[language]}
                </h3>
                <p className="text-gray-600 text-sm">
                  {reward.description[language]}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <span className="text-2xl font-bold text-green-600">
                    {reward.cost}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">coins</span>
                </div>
                <button
                  onClick={() => handleRedeem(reward._id, reward.cost)}
                  disabled={user.greenCoins < reward.cost}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('rewards.redeem')}
                </button>
              </div>

              {reward.stock !== -1 && (
                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-500">
                    {reward.stock} left in stock
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* My Rewards Tab */}
      {activeTab === 'my-rewards' && (
        <div>
          {myRewards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <p className="text-gray-500 text-lg">You haven't redeemed any rewards yet</p>
              <button
                onClick={() => setActiveTab('store')}
                className="mt-4 btn btn-primary"
              >
                Browse Rewards
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRewards.map((reward) => (
                reward.redemptions.map((redemption, idx) => (
                  <div key={`${reward._id}-${idx}`} className="card bg-green-50 border border-green-200">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-3">{getRewardIcon(reward.type)}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {reward.title[language]}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {reward.description[language]}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-green-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`badge ${
                          redemption.status === 'delivered' ? 'badge-success' :
                          redemption.status === 'pending' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {redemption.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Redeemed:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(redemption.redeemedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RewardStore;
