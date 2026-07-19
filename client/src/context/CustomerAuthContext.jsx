import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import {
  getCustomerProfile,
  sendOtp,
  verifyOtp,
  completeSignup,
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

  const requestOtp = async ({ channel, email, phone }) => {
    setLoading(true);
    try {
      return await sendOtp({ channel, email, phone });
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async ({ channel, email, phone, otp }) => {
    setLoading(true);
    try {
      const data = await verifyOtp({ channel, email, phone, otp });
      if (!data.isNewUser && data.token) {
        persistSession(data.token, data.customer, setCustomer);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const finishSignup = async ({ signupToken, name, email, phone }) => {
    setLoading(true);
    try {
      const data = await completeSignup({ signupToken, name, email, phone });
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
        requestOtp,
        loginWithOtp,
        finishSignup,
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
