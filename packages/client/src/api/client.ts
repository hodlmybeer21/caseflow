import type {
  User,
  Customer,
  Brand,
  Inventory,
  Event,
  PromoStaff,
  AccountAsset,
  Transfer,
  POSRequest,
  Activity,
} from '../types';

const API_BASE = import.meta.env.DEV ? '/api' : '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  getMe: () => request<User>('/auth/me'),

  // Customers
  getCustomers: () => request<Customer[]>('/customers'),
  createCustomer: (data: Omit<Customer, 'id' | 'createdAt'>) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: number, data: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: number) => request<void>(`/customers/${id}`, { method: 'DELETE' }),

  // Brands
  getBrands: () => request<Brand[]>('/brands'),
  createBrand: (data: Omit<Brand, 'id' | 'createdAt'>) =>
    request<Brand>('/brands', { method: 'POST', body: JSON.stringify(data) }),
  updateBrand: (id: number, data: Partial<Brand>) =>
    request<Brand>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBrand: (id: number) => request<void>(`/brands/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request<Inventory[]>('/inventory'),
  addStock: (brandId: number, quantity: number) =>
    request<Inventory>('/inventory', { method: 'POST', body: JSON.stringify({ brandId, quantity }) }),

  // Events
  getEvents: () => request<Event[]>('/events'),
  createEvent: (data: Omit<Event, 'id'>) =>
    request<Event>('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: number, data: Partial<Event>) =>
    request<Event>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id: number) => request<void>(`/events/${id}`, { method: 'DELETE' }),

  // Promo Staff
  getPromoStaff: () => request<PromoStaff[]>('/promo-staff'),
  createPromoStaff: (data: Omit<PromoStaff, 'id'>) =>
    request<PromoStaff>('/promo-staff', { method: 'POST', body: JSON.stringify(data) }),
  updatePromoStaff: (id: number, data: Partial<PromoStaff>) =>
    request<PromoStaff>(`/promo-staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePromoStaff: (id: number) => request<void>(`/promo-staff/${id}`, { method: 'DELETE' }),

  // Account Assets
  getAccountAssets: () => request<AccountAsset[]>('/account-assets'),
  createAccountAsset: (data: Omit<AccountAsset, 'id'>) =>
    request<AccountAsset>('/account-assets', { method: 'POST', body: JSON.stringify(data) }),
  updateAccountAsset: (id: number, data: Partial<AccountAsset>) =>
    request<AccountAsset>(`/account-assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccountAsset: (id: number) => request<void>(`/account-assets/${id}`, { method: 'DELETE' }),

  // Transfers
  getTransfers: () => request<Transfer[]>('/transfers'),
  createTransfer: (data: Omit<Transfer, 'id'>) =>
    request<Transfer>('/transfers', { method: 'POST', body: JSON.stringify(data) }),

  // POS Requests
  getRequests: () => request<POSRequest[]>('/requests'),
  updateRequestStatus: (id: number, status: 'approved' | 'fulfilled') =>
    request<POSRequest>(`/requests/${id}/${status}`, { method: 'POST' }),

  // Dashboard
  getRecentActivity: () => request<Activity[]>('/activity/recent'),
  getStats: () => request<{ totalCustomers: number; activeBrands: number; pendingRequests: number; upcomingEvents: number }>('/stats'),
};
