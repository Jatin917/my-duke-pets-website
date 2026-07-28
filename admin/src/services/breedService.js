import api from './api';

export const fetchBreeds = async ({ category, all = true } = {}) => {
  const { data } = await api.get('/breeds', {
    params: {
      ...(category ? { category } : {}),
      ...(all ? { all: true } : {}),
    },
  });
  return data;
};

export const createBreed = async (payload) => {
  const { data } = await api.post('/breeds', payload);
  return data;
};

export const updateBreed = async (id, payload) => {
  const { data } = await api.put(`/breeds/${id}`, payload);
  return data;
};

export const deleteBreed = async (id) => {
  const { data } = await api.delete(`/breeds/${id}`);
  return data;
};
