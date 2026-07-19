import api from './api';

export const submitEnquiry = async (payload) => {
  const { data } = await api.post('/enquiry', payload);
  return data;
};
