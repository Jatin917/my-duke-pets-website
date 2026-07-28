import api from './api';

export const fetchEnquiryPromptSettings = async () => {
  const { data } = await api.get('/enquiry-prompt');
  return data.data;
};

export const updateEnquiryPromptSettings = async (payload) => {
  const { data } = await api.put('/enquiry-prompt', payload);
  return data.data;
};
