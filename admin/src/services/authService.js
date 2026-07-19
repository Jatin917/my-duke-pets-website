import api from './api';

export const loginAdmin = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/auth/profile', payload);
  return data;
};
