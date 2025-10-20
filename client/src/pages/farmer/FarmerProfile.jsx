import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI } from '../../services/api';

const FarmerProfile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    preferredLanguage: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        preferredLanguage: user.preferredLanguage || 'en'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.user);
      
      // Update language if changed
      if (formData.preferredLanguage !== language) {
        changeLanguage(formData.preferredLanguage);
      }
      
      setIsEditing(false);
      alert('Profile updated successfully! ✓');
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
      setSaving(false);
    }
  };

  const calculateProgress = () => {
    const currentLevelXP = (user?.level - 1) * 100;
    const nextLevelXP = user?.level * 100;
    const progress = ((user?.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('common.profile')}</h1>
        <p className="mt-2 text-gray-600">Manage your account information</p>
      </div>

      {/* Profile Overview */}
      <div className="card mb-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
            <p className="text-primary-100 mb-3">{user?.email}</p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                Level {user?.level}
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {user?.xp} XP
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                💚 {user?.greenCoins} Coins
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-100">Progress to Level {(user?.level || 0) + 1}</span>
            <span className="text-sm text-primary-100">{calculateProgress().toFixed(0)}%</span>
          </div>
          <div className="bg-white/20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-2xl font-bold text-gray-900">
            {user?.completedMissions?.length || 0}
          </p>
          <p className="text-gray-600 text-sm">Missions Completed</p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-2xl font-bold text-gray-900">
            {user?.badges?.length || 0}
          </p>
          <p className="text-gray-600 text-sm">Badges Earned</p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-2xl font-bold text-gray-900">
            {user?.activeMissions?.length || 0}
          </p>
          <p className="text-gray-600 text-sm">Active Missions</p>
        </div>
      </div>

      {/* Badges */}
      {user?.badges && user.badges.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">My Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.badges.map((badge, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-gray-900 text-sm">{badge.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline"
            >
              {t('common.edit')}
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.fullName')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.village')}
                </label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.district')}
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.state')}
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.language')}
                </label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="en">{t('common.english')}</option>
                  <option value="hi">{t('common.hindi')}</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving...' : t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
                disabled={saving}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Village</p>
                <p className="font-medium text-gray-900">{user?.village || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">District</p>
                <p className="font-medium text-gray-900">{user?.district || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="font-medium text-gray-900">{user?.state || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preferred Language</p>
                <p className="font-medium text-gray-900">
                  {user?.preferredLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerProfile;
