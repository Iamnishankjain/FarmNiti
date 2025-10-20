import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { missionsAPI, uploadAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const MissionDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofDescription, setProofDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const isActive = user?.activeMissions?.some(m => m.mission.toString() === id);
  const isCompleted = user?.completedMissions?.includes(id);

  useEffect(() => {
    fetchMission();
  }, [id]);

  const fetchMission = async () => {
    try {
      const response = await missionsAPI.getById(id);
      setMission(response.data.mission);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mission:', error);
      setLoading(false);
    }
  };

  const handleStartMission = async () => {
    try {
      setIsStarting(true);
      await missionsAPI.startMission(id);
      
      // Update local user state
      const updatedActiveMissions = [
        ...(user.activeMissions || []),
        { mission: id, startedAt: new Date() }
      ];
      updateUser({ activeMissions: updatedActiveMissions });
      
      alert('Mission started successfully! 🎉');
      setIsStarting(false);
    } catch (error) {
      console.error('Error starting mission:', error);
      alert(error.response?.data?.message || 'Failed to start mission');
      setIsStarting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleCompleteMission = async (e) => {
    e.preventDefault();
    
    if (!proofFile) {
      alert('Please upload proof image or video');
      return;
    }

    try {
      setIsCompleting(true);
      
      // Upload proof file
      setUploadProgress(30);
      const fileType = proofFile.type.startsWith('image/') ? 'image' : 'video';
      const uploadResponse = fileType === 'image' 
        ? await uploadAPI.uploadImage(proofFile)
        : await uploadAPI.uploadVideo(proofFile);
      
      setUploadProgress(60);
      
      // Complete mission with proof
      const response = await missionsAPI.completeMission(id, {
        proofUrl: uploadResponse.url,
        proofType: fileType,
        description: proofDescription
      });
      
      setUploadProgress(100);
      
      // Update user data
      updateUser({
        xp: response.data.user.xp,
        level: response.data.user.level,
        greenCoins: response.data.user.greenCoins,
        completedMissions: [...(user.completedMissions || []), id],
        activeMissions: user.activeMissions.filter(m => m.mission.toString() !== id)
      });
      
      alert(`🎉 Mission completed! You earned ${response.data.rewards.xp} XP and ${response.data.rewards.greenCoins} Green Coins!`);
      navigate('/farmer/dashboard');
    } catch (error) {
      console.error('Error completing mission:', error);
      alert(error.response?.data?.message || 'Failed to complete mission');
      setIsCompleting(false);
      setUploadProgress(0);
    }
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
  if (!mission) return <div className="text-center py-12">Mission not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/farmer/missions')}
        className="mb-6 flex items-center text-primary-600 hover:text-primary-700"
      >
        ← Back to Missions
      </button>

      {/* Mission Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mission.title[language]}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${getDifficultyColor(mission.difficulty)}`}>
                {mission.difficulty}
              </span>
              <span className="badge badge-secondary capitalize">
                {mission.category}
              </span>
              <span className="badge bg-blue-100 text-blue-800 capitalize">
                {mission.season}
              </span>
            </div>
          </div>
          <div className="text-5xl ml-4">🎯</div>
        </div>

        <p className="text-gray-700 text-lg leading-relaxed">
          {mission.description[language]}
        </p>
      </div>

      {/* Mission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center">
            <span className="text-3xl mr-3">⭐</span>
            <div>
              <p className="text-sm text-gray-600">XP Reward</p>
              <p className="text-2xl font-bold text-primary-700">{mission.rewards.xp}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center">
            <span className="text-3xl mr-3">💚</span>
            <div>
              <p className="text-sm text-gray-600">Green Coins</p>
              <p className="text-2xl font-bold text-green-700">{mission.rewards.greenCoins}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center">
            <span className="text-3xl mr-3">👥</span>
            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-blue-700">
                {mission.participants?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Steps */}
      {mission.steps && mission.steps.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mission Steps</h2>
          <ol className="space-y-3">
            {mission.steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  {index + 1}
                </span>
                <p className="text-gray-700 pt-1">{step[language]}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Duration & Requirements */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mission.duration && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">⏱️ Duration</h3>
              <p className="text-gray-700">
                {mission.duration.value} {mission.duration.unit}
              </p>
            </div>
          )}
          
          {mission.crop && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🌾 Crop</h3>
              <p className="text-gray-700 capitalize">{mission.crop}</p>
            </div>
          )}
        </div>

        {mission.requirements && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">📋 Requirements</h3>
            <p className="text-gray-700">{mission.requirements}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="card">
        {isCompleted ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Mission Completed!</h3>
            <p className="text-gray-600">You've already completed this mission</p>
          </div>
        ) : isActive ? (
          showCompleteForm ? (
            <form onSubmit={handleCompleteMission} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Complete Mission</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Proof (Image or Video)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="input"
                  required
                />
                {proofFile && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {proofFile.name} selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  placeholder="Describe what you did for this mission..."
                  className="input h-32"
                  required
                />
              </div>

              {uploadProgress > 0 && (
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isCompleting}
                  className="flex-1 btn btn-primary"
                >
                  {isCompleting ? 'Submitting...' : 'Submit & Complete Mission'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompleteForm(false)}
                  className="btn btn-outline"
                  disabled={isCompleting}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-primary-600 mb-2">Mission In Progress</h3>
              <p className="text-gray-600 mb-6">Complete the mission and upload proof</p>
              <button
                onClick={() => setShowCompleteForm(true)}
                className="btn btn-primary"
              >
                Complete Mission
              </button>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
            <p className="text-gray-600 mb-6">
              Join {mission.participants?.length || 0} farmers on this mission
            </p>
            <button
              onClick={handleStartMission}
              disabled={isStarting}
              className="btn btn-primary px-8 py-3 text-lg"
            >
              {isStarting ? 'Starting...' : 'Start Mission'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionDetail;
