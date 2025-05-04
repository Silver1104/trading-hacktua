// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const userService = {
  // Create or update user in MongoDB
  createOrUpdateUser: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  },

  // Get user by Firebase UID
  getUserByFirebaseUID: async (firebaseUID) => {
    try {
      const response = await axios.get(`${API_URL}/users/${firebaseUID}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user data
  updateUserData: async (firebaseUID, userData) => {
    try {
      const response = await axios.put(`${API_URL}/users/${firebaseUID}`, { userData });
      return response.data;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }
};