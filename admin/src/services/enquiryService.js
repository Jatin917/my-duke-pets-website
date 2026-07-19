import api from './api';

export const fetchEnquiries = async (params = {}) => {
  const { data } = await api.get('/enquiry', { params });
  return data;
};

export const updateEnquiryStatus = async (id, status) => {
  const { data } = await api.put(`/enquiry/${id}`, { status });
  return data;
};

export const deleteEnquiry = async (id) => {
  const { data } = await api.delete(`/enquiry/${id}`);
  return data;
};

export const exportEnquiriesExcel = async () => {
  const response = await api.get('/enquiry/export/excel', { responseType: 'blob' });
  return response.data;
};

export const fetchGoogleSheetInfo = async () => {
  const { data } = await api.get('/enquiry/google-sheet');
  return data.data;
};

export const fetchDashboardStats = async () => {
  const { data } = await api.get('/enquiry/stats/dashboard');
  return data;
};
