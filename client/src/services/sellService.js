import api from './api';

export const submitSellRequest = async (formData) => {
  const { data } = await api.post('/sell', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data;
};
