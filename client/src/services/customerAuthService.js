import api from './api';

export const sendOtp = async ({ channel, email, phone }) => {
  const { data } = await api.post('/customer/auth/send-otp', { channel, email, phone });
  return data;
};

export const verifyOtp = async ({ channel, email, phone, otp }) => {
  const { data } = await api.post('/customer/auth/verify-otp', {
    channel,
    email,
    phone,
    otp,
  });
  return data;
};

export const completeSignup = async ({ signupToken, name, email, phone }) => {
  const { data } = await api.post('/customer/auth/complete-signup', {
    signupToken,
    name,
    email,
    phone,
  });
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
