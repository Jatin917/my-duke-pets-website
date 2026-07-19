import api from './api';

export const fetchDonateSettings = async () => {
  const { data } = await api.get('/donate');
  return data.data;
};

export const acknowledgeDonation = async (payload) => {
  const { data } = await api.post('/donate/acknowledge', payload);
  return data;
};
