const API_BASE_URL = 'http://localhost:5000';

export const api = {
  auth: {
    signup: async (data) => {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    login: async (data) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  rides: {
    getAll: async (token) => {
      const response = await fetch(`${API_BASE_URL}/rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
    create: async (data, token) => {
      const response = await fetch(`${API_BASE_URL}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  // Add more as needed
};
