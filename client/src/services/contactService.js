import api from './api';

export const submitContactForm = async (payload) => {
  const { data } = await api.post('/contact', payload);
  return data;
};

export const submitHelpEnquiry = async (payload) => {
  const { data } = await api.post('/contact/help', payload);
  return data;
};
