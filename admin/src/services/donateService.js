import api from './api';

export const fetchDonateSettings = async () => {
  const { data } = await api.get('/donate');
  return data.data;
};

export const updateDonateSettings = async (formData) => {
  const { data } = await api.put('/donate', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data.data;
};
