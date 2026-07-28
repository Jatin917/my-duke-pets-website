import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import {
  getCustomerProfile,
  sendOtp,
  verifyOtp,
  verifyMsg91,
  registerCustomer,
  loginCustomer,
} from '../services/customerAuthService';

const CustomerAuthContext = createContext(null);

const TOKEN_KEY = 'petnest_customer_token';
const USER_KEY = 'petnest_customer';

const persistSession = (token, customer, setCustomer) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(customer));
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  setCustomer(customer);
};

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    getCustomerProfile()
      .then((res) => {
        setCustomer(res.customer);
        localStorage.setItem(USER_KEY, JSON.stringify(res.customer));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setCustomer(null);
        delete api.defaults.headers.common.Authorization;
      });
  }, []);

  const requestEmailOtp = async (email) => {
    setLoading(true);
    try {
      return await sendOtp({ email });
    } finally {
      setLoading(false);
    }
  };

  const confirmEmailOtp = async ({ email, otp }) => {
    setLoading(true);
    try {
      return await verifyOtp({ email, otp });
    } finally {
      setLoading(false);
    }
  };

  const confirmPhoneMsg91 = async ({ accessToken, phone }) => {
    setLoading(true);
    try {
      return await verifyMsg91({ accessToken, phone });
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await registerCustomer(payload);
      persistSession(data.token, data.customer, setCustomer);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ identifier, password }) => {
    setLoading(true);
    try {
      const data = await loginCustomer({ identifier, password });
      persistSession(data.token, data.customer, setCustomer);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
    setCustomer(null);
  };

  const isAuthenticated = Boolean(customer && localStorage.getItem(TOKEN_KEY));

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        requestEmailOtp,
        confirmEmailOtp,
        confirmPhoneMsg91,
        register,
        login,
        logout,
        loading,
        isAuthenticated,
        setCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
};
