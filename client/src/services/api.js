import axios from 'axios';

// Vite uses import.meta.env for environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';



// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Missions API
export const missionsAPI = {
  getAll: (filters = {}) => api.get('/missions', { params: filters }),
  getById: (id) => api.get(`/missions/${id}`),
  create: (data) => api.post('/missions', data),
  update: (id, data) => api.put(`/missions/${id}`, data),
  delete: (id) => api.delete(`/missions/${id}`),
  startMission: (id) => api.post(`/missions/${id}/start`),
  completeMission: (id, proofData) => api.post(`/missions/${id}/complete`, proofData)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllFarmers: () => api.get('/users/farmers'),
  getLeaderboard: (period = 'allTime') => api.get(`/users/leaderboard?period=${period}`)
};

// Social Wall API
export const socialAPI = {
  getPosts: (page = 1, limit = 10) => api.get(`/social/posts?page=${page}&limit=${limit}`),
  createPost: (data) => api.post('/social/posts', data),
  likePost: (postId) => api.post(`/social/posts/${postId}/like`),
  addComment: (postId, comment) => api.post(`/social/posts/${postId}/comments`, { comment }),
  deletePost: (postId) => api.delete(`/social/posts/${postId}`)
};

// Rewards API
export const rewardsAPI = {
  getAll: () => api.get('/rewards'),
  redeem: (rewardId) => api.post(`/rewards/${rewardId}/redeem`),
  getUserRewards: () => api.get('/rewards/user/redeemed'),
  create: (data) => api.post('/rewards', data),
  update: (id, data) => api.put(`/rewards/${id}`, data),
  delete: (id) => api.delete(`/rewards/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getMissionStats: () => api.get('/analytics/missions'),
  getRegionStats: () => api.get('/analytics/regions'),
  getUserGrowth: (days = 30) => api.get(`/analytics/user-growth?days=${days}`),
  exportCSV: () => api.get('/analytics/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/analytics/export/pdf', { responseType: 'blob' })
};

// Weather API
export const weatherAPI = {
  getCurrent: (location) => api.get(`/weather/current?location=${location}`),
  getForecast: (location) => api.get(`/weather/forecast?location=${location}`),
  getWeatherMissions: () => api.get('/weather/missions')
};

// AI Crop Doctor API
export const aiAPI = {
  analyzeCrop: async (imageFile, lang = 'en') => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        lang // send selected language to backend
      }
    });

    return response.data;
  }
};


// Upload API
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default api;
