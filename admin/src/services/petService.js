import api from './api';

export const fetchPets = async (params = {}) => {
  const { data } = await api.get('/pets', { params });
  return data;
};

export const fetchPetById = async (id) => {
  const { data } = await api.get(`/pets/${id}`);
  return data;
};

export const createPet = async (formData) => {
  const { data } = await api.post('/pets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updatePet = async (id, formData) => {
  const { data } = await api.put(`/pets/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deletePet = async (id) => {
  const { data } = await api.delete(`/pets/${id}`);
  return data;
};
