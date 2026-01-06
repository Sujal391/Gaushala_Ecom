// src/lib/api/config.ts

// Base API URL - Update this with your actual backend URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },
  DASHBOARD: '/api/dashboard',
  ADMIN_CUSTOMERS: '/api/admin/customers',
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string | number) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: string | number) => `/api/products/${id}`,
    DELETE: (id: string | number) => `/api/products/${id}`,
  },
  CART: {
    ADD: '/api/cart/add',
    GET: (userId: number) => `/api/cart/${userId}`,
    REMOVE: (cartItemId: number) => `/api/cart/remove/${cartItemId}`,
    CLEAR: (userId: number) => `/api/cart/clear/${userId}`,
  },
  ORDERS: {
    CHECKOUT: '/api/orders/checkout',
    MY_ORDERS: (userId: number) => `/api/orders/my/${userId}`,
    ALL_ORDERS: '/api/orders/all',
  },
  PAYMENT: {
    INITIATE: (orderId: number) => `/api/payment/initiate?orderId=${orderId}`,
    SUCCESS: '/api/payment/success',
    FAILURE: '/api/payment/failure',
  },
} as const;

// Get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Set auth token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
}

// Remove auth token from localStorage
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

// Get user data from localStorage
export function getUser(): any {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// Set user data in localStorage
export function setUser(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// Get user ID from stored user data
export function getUserId(): number | null {
  const user = getUser();
  return user?.id || user?.userId || null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Check if user is admin
export function isAdmin(): boolean {
  const user = getUser();
  // Check multiple conditions for admin
  // 1. role field is 'admin'
  // 2. email is admin@example.com (demo admin)
  // 3. isAdmin field is true
  return user?.role === 'Admin' || 
         user?.email === 'admin@example.com' || 
         user?.isAdmin === true;
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUser,
  setUser,
  getUserId,
  isAuthenticated,
  isAdmin,
};