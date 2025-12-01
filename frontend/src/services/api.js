import axios from 'axios';

const API_BASE_URL = '/api';

export const api = {
  // Get available exercises
  getAvailableExercises: async () => {
    const response = await axios.get(`${API_BASE_URL}/available_exercises`);
    return response.data;
  },

  // Start an exercise
  startExercise: async (exerciseId, options = {}) => {
    const response = await axios.post(`${API_BASE_URL}/start_exercise`, {
      exercise: exerciseId,
      ...options
    });
    return response.data;
  },

  // Stop current exercise
  stopExercise: async () => {
    const response = await axios.post(`${API_BASE_URL}/stop_exercise`);
    return response.data;
  },

  // Get current stats
  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  },

  // Upload video
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await axios.post(`${API_BASE_URL}/upload_video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get video feed URL
  getVideoFeedUrl: () => `${API_BASE_URL}/video_feed`,
};

export default api;
