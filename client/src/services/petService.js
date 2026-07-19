import api from './api';

export const fetchPets = async (params = {}) => {
  const { data } = await api.get('/pets', { params });
  return data;
};

export const fetchFeaturedPets = async () => {
  const { data } = await api.get('/pets/featured');
  return data;
};

export const fetchLatestPets = async () => {
  const { data } = await api.get('/pets/latest');
  return data;
};

export const fetchPetById = async (id) => {
  const { data } = await api.get(`/pets/${id}`);
  return data;
};
