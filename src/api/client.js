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

// Notifications
export const notifications = {
  getCount: () => apiClient.get('/admin/notifications/count'),
  list: (params) => apiClient.get('/admin/notifications/list', { params }),
  markAllRead: () => apiClient.get('/admin/notifications/mark-all-read'),
  markRead: (id) => apiClient.put(`/admin/notifications/${id}/read`),
  send: (data) => apiClient.post('/admin/notifications/send', data),
  listTemplates: () => apiClient.get('/admin/notifications/templates'),
  getTemplate: (id) => apiClient.get(`/admin/notifications/templates/${id}`),
  createTemplate: (data) => apiClient.post('/admin/notifications/templates', data),
  updateTemplate: (id, data) => apiClient.put(`/admin/notifications/templates/${id}`, data),
  deleteTemplate: (id) => apiClient.delete(`/admin/notifications/templates/${id}`),
};

// Products (extended)
export const products = {
  list: (params) => apiClient.get('/admin/products', { params }),
  get: (id) => apiClient.get(`/admin/products/${id}`),
  create: (data) => apiClient.post('/admin/products', data),
  update: (id, data) => apiClient.put(`/admin/products/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/products/${id}`),
  bulkUpdateAffiliate: (data) => apiClient.post('/admin/products/bulk-update-affiliate', data),
  getVariant: (variantId) => apiClient.get(`/admin/products/variant/${variantId}`),
  updateStock: (data) => apiClient.post('/admin/products/update-stock', data),
  // Attribute Sets
  listAttributeSets: () => apiClient.get('/admin/products/attribute-sets/list'),
  createAttributeSet: (data) => apiClient.post('/admin/products/attribute-sets', data),
  updateAttributeSet: (id, data) => apiClient.put(`/admin/products/attribute-sets/${id}`, data),
  deleteAttributeSet: (id) => apiClient.delete(`/admin/products/attribute-sets/${id}`),
  // Attributes
  listAttributes: (params) => apiClient.get('/admin/products/attributes/list', { params }),
  createAttribute: (data) => apiClient.post('/admin/products/attributes', data),
  updateAttribute: (id, data) => apiClient.put(`/admin/products/attributes/${id}`, data),
  deleteAttribute: (id) => apiClient.delete(`/admin/products/attributes/${id}`),
  // Attribute Values
  listAttributeValues: (params) => apiClient.get('/admin/products/attribute-values/list', { params }),
  createAttributeValue: (data) => apiClient.post('/admin/products/attribute-values', data),
  updateAttributeValue: (id, data) => apiClient.put(`/admin/products/attribute-values/${id}`, data),
  deleteAttributeValue: (id) => apiClient.delete(`/admin/products/attribute-values/${id}`),
};

// Categories
export const categories = {
  list: (params) => apiClient.get('/admin/categories', { params }),
  get: (id) => apiClient.get(`/admin/categories/get/${id}`),
  create: (data) => apiClient.post('/admin/categories', data),
  update: (id, data) => apiClient.put(`/admin/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/categories/${id}`),
  updateOrder: (categoryId, sortOrder) => apiClient.get('/admin/categories/update-order', { params: { categoryId, sortOrder } }),
};

// Blog Categories
export const blogCategories = {
  list: () => apiClient.get('/admin/categories/blog-categories'),
  create: (data) => apiClient.post('/admin/categories/blog-categories', data),
  update: (id, data) => apiClient.put(`/admin/categories/blog-categories/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/categories/blog-categories/${id}`),
};

// Blogs
export const blogs = {
  list: (params) => apiClient.get('/admin/categories/blogs', { params }),
  get: (id) => apiClient.get(`/admin/categories/blogs/${id}`),
  create: (data) => apiClient.post('/admin/categories/blogs', data),
  update: (id, data) => apiClient.put(`/admin/categories/blogs/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/categories/blogs/${id}`),
};

// Brands
export const brands = {
  list: (params) => apiClient.get('/admin/categories/brands', { params }),
  get: (id) => apiClient.get(`/admin/categories/brands/${id}`),
  create: (data) => apiClient.post('/admin/categories/brands', data),
  update: (id, data) => apiClient.put(`/admin/categories/brands/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/categories/brands/${id}`),
};

// Promo Codes
export const promoCodes = {
  list: (params) => apiClient.get('/admin/marketing/promo-codes', { params }),
  get: (id) => apiClient.get(`/admin/marketing/promo-codes/${id}`),
  create: (data) => apiClient.post('/admin/marketing/promo-codes', data),
  update: (id, data) => apiClient.put(`/admin/marketing/promo-codes/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/marketing/promo-codes/${id}`),
};

// Sliders
export const sliders = {
  list: () => apiClient.get('/admin/marketing/sliders'),
  get: (id) => apiClient.get(`/admin/marketing/sliders/${id}`),
  create: (data) => apiClient.post('/admin/marketing/sliders', data),
  update: (id, data) => apiClient.put(`/admin/marketing/sliders/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/marketing/sliders/${id}`),
};

// Offers
export const offers = {
  list: () => apiClient.get('/admin/marketing/offers'),
  get: (id) => apiClient.get(`/admin/marketing/offers/${id}`),
  create: (data) => apiClient.post('/admin/marketing/offers', data),
  update: (id, data) => apiClient.put(`/admin/marketing/offers/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/marketing/offers/${id}`),
};

// Featured Sections
export const featuredSections = {
  list: () => apiClient.get('/admin/marketing/featured-sections'),
  get: (id) => apiClient.get(`/admin/marketing/featured-sections/${id}`),
  create: (data) => apiClient.post('/admin/marketing/featured-sections', data),
  update: (id, data) => apiClient.put(`/admin/marketing/featured-sections/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/marketing/featured-sections/${id}`),
  updateOrder: (sectionId, sortOrder) => apiClient.get('/admin/marketing/featured-sections-order', { params: { sectionId, sortOrder } }),
};

// Consignments / Logistics
export const logistics = {
  listConsignments: (params) => apiClient.get('/admin/logistics/consignments', { params }),
  getConsignment: (id) => apiClient.get(`/admin/logistics/consignments/${id}`),
  createConsignment: (data) => apiClient.post('/admin/logistics/consignments', data),
  updateConsignment: (id, data) => apiClient.put(`/admin/logistics/consignments/${id}`, data),
  deleteConsignment: (id) => apiClient.delete(`/admin/logistics/consignments/${id}`),
  getTracking: (orderId) => apiClient.get('/admin/logistics/tracking', { params: { orderId } }),
  updateShiprocketStatus: (consignmentId) => apiClient.post('/admin/logistics/shiprocket-status', { consignmentId }),
};

// Return Requests
export const returns = {
  list: (params) => apiClient.get('/admin/support/returns', { params }),
  get: (id) => apiClient.get(`/admin/support/returns/${id}`),
  create: (data) => apiClient.post('/admin/support/returns', data),
  update: (id, data) => apiClient.put(`/admin/support/returns/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/support/returns/${id}`),
};

// Tickets
export const tickets = {
  list: (params) => apiClient.get('/admin/support/tickets', { params }),
  get: (id) => apiClient.get(`/admin/support/tickets/${id}`),
  create: (data) => apiClient.post('/admin/support/tickets', data),
  updateStatus: (id, data) => apiClient.put(`/admin/support/tickets/${id}/status`, data),
  delete: (id) => apiClient.delete(`/admin/support/tickets/${id}`),
  getMessages: (ticketId) => apiClient.get('/admin/support/ticket-messages', { params: { ticketId } }),
  sendMessage: (data) => apiClient.post('/admin/support/ticket-messages', data),
};

// Delivery Boys
export const deliveryBoys = {
  list: (params) => apiClient.get('/admin/delivery/delivery-boys', { params }),
  get: (id) => apiClient.get(`/admin/delivery/delivery-boys/${id}`),
  create: (data) => apiClient.post('/admin/delivery/delivery-boys', data),
  update: (id, data) => apiClient.put(`/admin/delivery/delivery-boys/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/delivery/delivery-boys/${id}`),
  fundTransfer: (data) => apiClient.post('/admin/delivery/delivery-boys/fund-transfer', data),
};

// Cities
export const cities = {
  list: (params) => apiClient.get('/admin/delivery/cities', { params }),
  get: (id) => apiClient.get(`/admin/delivery/cities/${id}`),
  create: (data) => apiClient.post('/admin/delivery/cities', data),
  update: (id, data) => apiClient.put(`/admin/delivery/cities/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/delivery/cities/${id}`),
};

// Zipcodes
export const zipcodes = {
  list: (params) => apiClient.get('/admin/delivery/zipcodes', { params }),
  get: (id) => apiClient.get(`/admin/delivery/zipcodes/${id}`),
  create: (data) => apiClient.post('/admin/delivery/zipcodes', data),
  update: (id, data) => apiClient.put(`/admin/delivery/zipcodes/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/delivery/zipcodes/${id}`),
};

// Pickup Locations
export const pickupLocations = {
  list: (params) => apiClient.get('/admin/delivery/pickup-locations', { params }),
  get: (id) => apiClient.get(`/admin/delivery/pickup-locations/${id}`),
  create: (data) => apiClient.post('/admin/delivery/pickup-locations', data),
  update: (id, data) => apiClient.put(`/admin/delivery/pickup-locations/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/delivery/pickup-locations/${id}`),
};

// Transactions
export const transactions = {
  list: (params) => apiClient.get('/admin/wallet/transactions', { params }),
  get: (id) => apiClient.get(`/admin/wallet/transactions/${id}`),
};

// Wallet
export const wallet = {
  get: (userId) => apiClient.get(`/admin/wallet/wallet/${userId}`),
  manage: (data) => apiClient.post('/admin/wallet/wallet/manage', data),
};

// Payouts
export const payouts = {
  list: (params) => apiClient.get('/admin/wallet/payouts', { params }),
  get: (id) => apiClient.get(`/admin/wallet/payouts/${id}`),
  update: (id, data) => apiClient.put(`/admin/wallet/payouts/${id}`, data),
  getStats: () => apiClient.get('/admin/wallet/payouts/stats'),
};

// Sellers
export const sellers = {
  list: (params) => apiClient.get('/admin/sellers', { params }),
  get: (id) => apiClient.get(`/admin/sellers/${id}`),
  create: (data) => apiClient.post('/admin/sellers', data),
  update: (id, data) => apiClient.put(`/admin/sellers/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/sellers/${id}`),
  getCommissionData: (sellerId) => apiClient.post('/admin/sellers/commission-data', { sellerId }),
  updateCommission: (data) => apiClient.post('/admin/sellers/update-commission', data),
  verify: (id) => apiClient.post(`/admin/sellers/${id}/verify`),
  fundTransfer: (data) => apiClient.post('/admin/sellers/fund-transfer', data),
  getStats: () => apiClient.get('/admin/sellers/stats'),
};

// Affiliates
export const affiliates = {
  list: (params) => apiClient.get('/admin/affiliates', { params }),
  get: (id) => apiClient.get(`/admin/affiliates/${id}`),
  create: (data) => apiClient.post('/admin/affiliates', data),
  update: (id, data) => apiClient.put(`/admin/affiliates/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/affiliates/${id}`),
  verify: (id) => apiClient.post(`/admin/affiliates/${id}/verify`),
  listClicks: (params) => apiClient.get('/admin/affiliates/clicks/list', { params }),
  listCommissions: (params) => apiClient.get('/admin/affiliates/commissions/list', { params }),
  approveCommission: (id) => apiClient.post(`/admin/affiliates/commissions/${id}/approve`),
  settleCommission: (id) => apiClient.post(`/admin/affiliates/commissions/${id}/settle`),
  getStats: () => apiClient.get('/admin/affiliates/stats'),
};

// Settings
export const settings = {
  list: (params) => apiClient.get('/admin/settings', { params }),
  get: (key) => apiClient.get(`/admin/settings/key/${key}`),
  update: (data) => apiClient.post('/admin/settings', data),
  bulkUpdate: (data) => apiClient.post('/admin/settings/bulk', data),
  delete: (key) => apiClient.delete(`/admin/settings/key/${key}`),
  // Languages
  listLanguages: () => apiClient.get('/admin/settings/languages'),
  getLanguage: (id) => apiClient.get(`/admin/settings/languages/${id}`),
  createLanguage: (data) => apiClient.post('/admin/settings/languages', data),
  updateLanguage: (id, data) => apiClient.put(`/admin/settings/languages/${id}`, data),
  deleteLanguage: (id) => apiClient.delete(`/admin/settings/languages/${id}`),
  setDefaultLanguage: (languageId) => apiClient.post('/admin/settings/languages/set-default', { languageId }),
  // SMS Gateways
  listSmsGateways: () => apiClient.get('/admin/settings/sms-gateways'),
  getSmsGateway: (id) => apiClient.get(`/admin/settings/sms-gateways/${id}`),
  createSmsGateway: (data) => apiClient.post('/admin/settings/sms-gateways', data),
  updateSmsGateway: (id, data) => apiClient.put(`/admin/settings/sms-gateways/${id}`, data),
  deleteSmsGateway: (id) => apiClient.delete(`/admin/settings/sms-gateways/${id}`),
  // Themes
  listThemes: () => apiClient.get('/admin/settings/themes'),
  getTheme: (id) => apiClient.get(`/admin/settings/themes/${id}`),
  createTheme: (data) => apiClient.post('/admin/settings/themes', data),
  updateTheme: (id, data) => apiClient.put(`/admin/settings/themes/${id}`, data),
  deleteTheme: (id) => apiClient.delete(`/admin/settings/themes/${id}`),
  switchTheme: (themeId) => apiClient.post('/admin/settings/themes/switch', { themeId }),
};

// Cron Jobs
export const cron = {
  settleCashback: () => apiClient.get('/admin/cron-job/settle-cashback-discount'),
  settleReferralReferred: () => apiClient.get('/admin/cron-job/settle-referral-cashback-discount'),
  settleReferralReferrer: () => apiClient.get('/admin/cron-job/settle-referral-cashback-discount-for-referrer'),
  settleAffiliateCommission: () => apiClient.get('/admin/cron-job/settle-affiliate-commission'),
  settleSellerCommission: () => apiClient.get('/admin/cron-job/settle-seller-commission'),
  runAll: () => apiClient.get('/admin/cron-job/run-all'),
  getStatus: () => apiClient.get('/admin/cron-job/status'),
};

export default apiClient;
