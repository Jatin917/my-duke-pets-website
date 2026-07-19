import api from './api';

export const fetchCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const fetchCategory = async (id) => {
  const { data } = await api.get(`/categories/${id}`);
  return data;
};
