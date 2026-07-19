import api from './api';

export const fetchCategories = async (all = true) => {
  const { data } = await api.get('/categories', { params: { all } });
  return data;
};

export const createCategory = async (formData) => {
  const { data } = await api.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateCategory = async (id, formData) => {
  const { data } = await api.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};
