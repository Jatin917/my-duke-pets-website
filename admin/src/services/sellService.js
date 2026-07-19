import api from './api';

export const fetchSellRequests = async (params = {}) => {
  const { data } = await api.get('/sell', { params });
  return data;
};

export const updateSellRequest = async (id, payload) => {
  const { data } = await api.put(`/sell/${id}`, payload);
  return data.data;
};

export const deleteSellRequest = async (id) => {
  const { data } = await api.delete(`/sell/${id}`);
  return data;
};
