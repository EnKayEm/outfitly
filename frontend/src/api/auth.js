import api from './axiosConfig'; 

export const login = async (username, password) => {
  const response = await api.post('auth/login/', {
    username: username, 
    password: password,
  });
  return response.data;
};

export const register = async (username, password) => {
  const response = await api.post('auth/register/', {
    username: username,
    password: password,
  });
  return response.data;
};

export const resetPassword = async (email) => {
  const response = await api.post('auth/reset-password/', {
    email: email,
  });
  return response.data;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};