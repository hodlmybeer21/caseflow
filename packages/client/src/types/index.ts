export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  displayName: string;
}

export interface Customer {
  id: number;
  name: string;
  repUsername: string;
  active: boolean;
  createdAt: string;
}

export interface Brand {
  id: number;
  name: string;
  category: string;
  createdAt: string;
}

export interface Inventory {
  id: number;
  brandId: number;
  brandName: string;
  currentQuantity: number;
  lastUpdated: string;
}

export interface Event {
  id: number;
  customerId: number;
  customerName: string;
  type: string;
  date: string;
  notes: string;
}

export interface PromoStaff {
  id: number;
  name: string;
  eventAssignment: string | null;
  status: 'available' | 'assigned' | 'off';
}

export interface AccountAsset {
  id: number;
  customerId: number;
  customerName: string;
  brandId: number;
  brandName: string;
  assetType: string;
  serialNumber: string;
  placedDate: string;
}

export interface Transfer {
  id: number;
  fromAccountId: number;
  fromAccountName: string;
  toAccountId: number;
  toAccountName: string;
  brandId: number;
  brandName: string;
  quantity: number;
  date: string;
}

export interface POSRequest {
  id: number;
  customerId: number;
  customerName: string;
  brandId: number;
  brandName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'fulfilled';
  requestedAt: string;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}
