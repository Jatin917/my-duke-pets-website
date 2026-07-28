import api from './api';

export const fetchEnquiryPromptSettings = async () => {
  const { data } = await api.get('/enquiry-prompt');
  return data.data;
};

export const submitPromptEnquiry = async (payload) => {
  const { data } = await api.post('/enquiry/prompt', payload);
  return data;
};
