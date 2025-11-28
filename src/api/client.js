import axios from 'axios';

const getBaseURL = () => {
  return localStorage.getItem('apiServer') || 'http://localhost:5001/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL on each request to support dynamic server selection
apiClient.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  return config;
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (credentials) => apiClient.post('/login', credentials),
  getProfile: () => apiClient.get('/admin/me'),
};

export const users = {
  list: (params) => apiClient.get('/admin/users', { params }),
  get: (id) => apiClient.get(`/admin/users/${id}`),
  create: (data) => apiClient.post('/admin/users', data),
  update: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/users/${id}`),
};

export const stores = {
  list: (params) => apiClient.get('/admin/stores', { params }),
  get: (id) => apiClient.get(`/admin/stores/${id}`),
  create: (data) => apiClient.post('/admin/stores', data),
  update: (id, data) => apiClient.put(`/admin/stores/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/stores/${id}`),
  addMerchant: (storeId, userId) => apiClient.post(`/admin/stores/${storeId}/merchants`, { userId }),
  removeMerchant: (storeId, userId) => apiClient.delete(`/admin/stores/${storeId}/merchants/${userId}`),
  updateFees: (storeId, data) => apiClient.put(`/admin/stores/${storeId}/fees`, data),
};

export const orders = {
  list: (params) => apiClient.get('/admin/orders', { params }),
  get: (id) => apiClient.get(`/admin/orders/${id}`),
  approve: (id) => apiClient.post(`/admin/orders/${id}/approve`),
  reject: (id, data) => apiClient.post(`/admin/orders/${id}/reject`, data),
  updateStatus: (id, status) => apiClient.put(`/admin/orders/${id}/status`, { status }),
  listStoreOrders: (params) => apiClient.get('/admin/orders/store-orders/list', { params }),
};

export const payments = {
  list: (params) => apiClient.get('/admin/payments', { params }),
  get: (id) => apiClient.get(`/admin/payments/${id}`),
  getStats: () => apiClient.get('/admin/payments/stats'),
  refund: (id, data) => apiClient.post(`/admin/payments/${id}/refund`, data),
  listStorePayments: (params) => apiClient.get('/admin/payments/store-payments/list', { params }),
};

export const reports = {
  dashboard: (params) => apiClient.get('/admin/reports/dashboard', { params }),
  sales: (params) => apiClient.get('/admin/reports/sales', { params }),
  orders: (params) => apiClient.get('/admin/reports/orders', { params }),
  users: (params) => apiClient.get('/admin/reports/users', { params }),
  stores: (params) => apiClient.get('/admin/reports/stores', { params }),
};

export const admins = {
  list: (params) => apiClient.get('/admin/admins', { params }),
  assignRole: (data) => apiClient.post('/admin/assign-role', data),
  removeRole: (userId) => apiClient.delete(`/admin/remove-role/${userId}`),
  getRoles: () => apiClient.get('/admin/roles'),
};

export const audit = {
  list: (params) => apiClient.get('/admin/audit', { params }),
  get: (id) => apiClient.get(`/admin/audit/${id}`),
  getStats: (params) => apiClient.get('/admin/audit/stats', { params }),
};

export default apiClient;
