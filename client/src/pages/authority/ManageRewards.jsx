import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { rewardsAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const ManageRewards = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    title: { en: '', hi: '' },
    description: { en: '', hi: '' },
    type: 'physical',
    cost: 50,
    stock: 100
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await rewardsAPI.getAll();
      setRewards(response.data.rewards);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rewards:', error);
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
        [name]: name === 'cost' || name === 'stock' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReward) {
        await rewardsAPI.update(editingReward._id, formData);
        alert('Reward updated successfully!');
      } else {
        await rewardsAPI.create(formData);
        alert('Reward created successfully!');
      }
      
      setShowForm(false);
      setEditingReward(null);
      resetForm();
      fetchRewards();
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('Failed to save reward');
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description,
      type: reward.type,
      cost: reward.cost,
      stock: reward.stock
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    
    try {
      await rewardsAPI.delete(id);
      alert('Reward deleted successfully!');
      fetchRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('Failed to delete reward');
    }
  };

  const resetForm = () => {
    setFormData({
      title: { en: '', hi: '' },
      description: { en: '', hi: '' },
      type: 'physical',
      cost: 50,
      stock: 100
    });
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
            <h1 className="text-3xl font-bold text-gray-900">{t('authority.manageRewards')}</h1>
            <p className="mt-2 text-gray-600">Create and manage reward catalog</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingReward(null);
              resetForm();
            }}
            className="btn btn-primary"
          >
            + Create Reward
          </button>
        </div>
      </div>

      {/* Reward Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingReward ? 'Edit Reward' : 'Create Reward'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingReward(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* English Fields */}
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

                {/* Hindi Fields */}
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

                {/* Reward Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="physical">Physical Item</option>
                      <option value="certificate">Certificate</option>
                      <option value="coupon">Coupon</option>
                      <option value="badge">Digital Badge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost (Green Coins)
                    </label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className="input"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock (-1 for unlimited)
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="input"
                      min="-1"
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingReward(null);
                      resetForm();
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingReward ? 'Update Reward' : 'Create Reward'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      {rewards.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No rewards yet. Create your first reward!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div key={reward._id} className="card hover:shadow-xl transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{getRewardIcon(reward.type)}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {reward.title[language]}
                </h3>
                <p className="text-gray-600 text-sm">
                  {reward.description[language]}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="badge badge-primary capitalize">{reward.type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cost:</span>
                  <span className="text-lg font-bold text-green-600">{reward.cost} coins</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className="font-semibold text-gray-900">
                    {reward.stock === -1 ? 'Unlimited' : reward.stock}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Redemptions:</span>
                  <span className="font-semibold text-gray-900">
                    {reward.redemptions?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`badge ${reward.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {reward.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(reward)}
                  className="flex-1 btn btn-outline text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(reward._id)}
                  className="flex-1 btn bg-red-600 text-white hover:bg-red-700 text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRewards;
