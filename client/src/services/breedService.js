import api from './api';

export const fetchBreeds = async ({ category, all = false } = {}) => {
  const { data } = await api.get('/breeds', {
    params: {
      ...(category ? { category } : {}),
      ...(all ? { all: true } : {}),
    },
  });
  return data;
};
