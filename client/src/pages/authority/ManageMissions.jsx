import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { missionsAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const ManageMissions = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [formData, setFormData] = useState({
    title: { en: '', hi: '' },
    description: { en: '', hi: '' },
    category: 'organic',
    difficulty: 'medium',
    season: 'all',
    crop: '',
    duration: { value: 7, unit: 'days' },
    rewards: { xp: 50, greenCoins: 30, badge: '' }
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await missionsAPI.getAll();
      setMissions(response.data.missions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMission) {
        await missionsAPI.update(editingMission._id, formData);
        alert('Mission updated successfully!');
      } else {
        await missionsAPI.create(formData);
        alert('Mission created successfully!');
      }
      
      setShowForm(false);
      setEditingMission(null);
      resetForm();
      fetchMissions();
    } catch (error) {
      console.error('Error saving mission:', error);
      alert('Failed to save mission');
    }
  };

  const handleEdit = (mission) => {
    setEditingMission(mission);
    setFormData({
      title: mission.title,
      description: mission.description,
      category: mission.category,
      difficulty: mission.difficulty,
      season: mission.season,
      crop: mission.crop || '',
      duration: mission.duration,
      rewards: mission.rewards
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mission?')) return;
    
    try {
      await missionsAPI.delete(id);
      alert('Mission deleted successfully!');
      fetchMissions();
    } catch (error) {
      console.error('Error deleting mission:', error);
      alert('Failed to delete mission');
    }
  };

  const resetForm = () => {
    setFormData({
      title: { en: '', hi: '' },
      description: { en: '', hi: '' },
      category: 'organic',
      difficulty: 'medium',
      season: 'all',
      crop: '',
      duration: { value: 7, unit: 'days' },
      rewards: { xp: 50, greenCoins: 30, badge: '' }
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

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('authority.manageMissions')}</h1>
            <p className="mt-2 text-gray-600">Create and manage farming missions</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingMission(null);
              resetForm();
            }}
            className="btn btn-primary"
          >
            + {t('authority.createMission')}
          </button>
        </div>
      </div>

      {/* Mission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingMission ? t('authority.editMission') : t('authority.createMission')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMission(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* English Title & Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    name="title.en"
                    value={formData.title.en}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (English)
                  </label>
                  <textarea
                    name="description.en"
                    value={formData.description.en}
                    onChange={handleChange}
                    className="input h-24"
                    required
                  />
                </div>

                {/* Hindi Title & Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Hindi - हिंदी)
                  </label>
                  <input
                    type="text"
                    name="title.hi"
                    value={formData.title.hi}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Hindi - हिंदी)
                  </label>
                  <textarea
                    name="description.hi"
                    value={formData.description.hi}
                    onChange={handleChange}
                    className="input h-24"
                    required
                  />
                </div>

                {/* Mission Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="soil">Soil</option>
                      <option value="water">Water</option>
                      <option value="crops">Crops</option>
                      <option value="organic">Organic</option>
                      <option value="community">Community</option>
                      <option value="weather">Weather</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Season
                    </label>
                    <select
                      name="season"
                      value={formData.season}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="all">All Seasons</option>
                      <option value="kharif">Kharif</option>
                      <option value="rabi">Rabi</option>
                      <option value="zaid">Zaid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crop (Optional)
                    </label>
                    <input
                      type="text"
                      name="crop"
                      value={formData.crop}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., Rice, Wheat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration Value
                    </label>
                    <input
                      type="number"
                      name="duration.value"
                      value={formData.duration.value}
                      onChange={handleChange}
                      className="input"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration Unit
                    </label>
                    <select
                      name="duration.unit"
                      value={formData.duration.unit}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                </div>

                {/* Rewards */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        XP Reward
                      </label>
                      <input
                        type="number"
                        name="rewards.xp"
                        value={formData.rewards.xp}
                        onChange={handleChange}
                        className="input"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Green Coins
                      </label>
                      <input
                        type="number"
                        name="rewards.greenCoins"
                        value={formData.rewards.greenCoins}
                        onChange={handleChange}
                        className="input"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Badge (Optional)
                      </label>
                      <input
                        type="text"
                        name="rewards.badge"
                        value={formData.rewards.badge}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., Compost Master"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMission(null);
                      resetForm();
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingMission ? 'Update Mission' : 'Create Mission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Missions List */}
      <div className="grid grid-cols-1 gap-6">
        {missions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No missions yet. Create your first mission!</p>
          </div>
        ) : (
          missions.map((mission) => (
            <div key={mission._id} className="card hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {mission.title[language]}
                    </h3>
                    <span className={`badge ${getDifficultyColor(mission.difficulty)}`}>
                      {mission.difficulty}
                    </span>
                    <span className="badge badge-secondary capitalize">
                      {mission.category}
                    </span>
                    {!mission.isActive && (
                      <span className="badge bg-gray-400 text-white">Inactive</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{mission.description[language]}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Season</p>
                      <p className="font-semibold capitalize">{mission.season}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-semibold">
                        {mission.duration.value} {mission.duration.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rewards</p>
                      <p className="font-semibold">
                        {mission.rewards.xp} XP, {mission.rewards.greenCoins} Coins
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Participants</p>
                      <p className="font-semibold">{mission.participants?.length || 0}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleEdit(mission)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(mission._id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageMissions;
