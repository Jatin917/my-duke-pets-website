import api from './api';

export const sendOtp = async ({ email }) => {
  const { data } = await api.post('/customer/auth/send-otp', { email });
  return data;
};

export const verifyOtp = async ({ email, otp }) => {
  const { data } = await api.post('/customer/auth/verify-otp', { email, otp });
  return data;
};

export const verifyMsg91 = async ({ accessToken, phone }) => {
  const { data } = await api.post('/customer/auth/verify-msg91', { accessToken, phone });
  return data;
};

export const registerCustomer = async (payload) => {
  const { data } = await api.post('/customer/auth/register', payload);
  return data;
};

export const loginCustomer = async ({ identifier, password }) => {
  const { data } = await api.post('/customer/auth/login', { identifier, password });
  return data;
};

export const getCustomerProfile = async () => {
  const { data } = await api.get('/customer/auth/me');
  return data;
};

export const updateCustomerProfile = async (payload) => {
  const { data } = await api.put('/customer/auth/profile', payload);
  return data;
};
