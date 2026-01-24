const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const gmailAPI = {
  getAuthUrl: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/gmail/auth`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  getStatus: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/gmail/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  refreshToken: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/gmail/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  disconnect: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/gmail/disconnect`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }
};