// src/lib/api/config.ts

/* -------------------------------------------------------------------------- */
/*                                API CONFIG                                  */
/* -------------------------------------------------------------------------- */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER_P1: '/api/auth/register/phase1',
    REGISTER_P2: '/api/auth/register/phase2',
    PARTIAL_USERS: '/api/auth/incomplete-users',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    REFERRAL_SUMMARY: '/api/auth/referrals/summary',
  },
  DASHBOARD: '/api/dashboard',
  ADMIN_CUSTOMERS: {
    BASE: '/api/admin/customers',
    UPDATE_STATUS: (userId: number | string) =>
      `/api/admin/customers/${userId}/status`,
  },
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
    UPDATE_STATUS: (orderId: number) => `/api/orders/status/${orderId}`,
    CANCEL_MY_ORDER: (orderId: number, userId: number) =>
      `/api/orders/cancel/${orderId}/customer/${userId}`,
    PENDING_ORDERS: '/api/orders/pending',
  },
  PAYMENT: {
    INITIATE: (orderId: number) =>
      `/api/payment/initiate?orderId=${orderId}`,
    SUCCESS: '/api/payment/success',
    FAILURE: '/api/payment/failure',
  },
  OFFER: {
    LIST: '/api/offers/active',
    CREATE: '/api/offers/create',
    APPLY: '/api/offers/apply',
  },
  FEEDBACK: {
    SUBMIT: '/api/feedback/submit',
    GET: '/api/feedback/product/{productId}',
  },
  SAMPLE_REQUESTS: {
  REQUEST_SAMPLE: '/api/sample-requests',
  GET_ALL: '/api/sample-requests',
  GET_BY_USER: (userId: number) => `/api/sample-requests/user/${userId}`,
  CHANGE_STATUS: (id: number) => `/api/sample-requests/${id}/status`,
},
} as const;

/* -------------------------------------------------------------------------- */
/*                                COOKIE UTILS                                 */
/* -------------------------------------------------------------------------- */

const COOKIE_OPTIONS = 'path=/; SameSite=Lax';

function setCookie(name: string, value: string, days = 7): void {
  if (typeof window === 'undefined') return;

  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; ${COOKIE_OPTIONS}`;
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function removeCookie(name: string): void {
  if (typeof window === 'undefined') return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${COOKIE_OPTIONS}`;
}

/* -------------------------------------------------------------------------- */
/*                               AUTH HELPERS                                  */
/* -------------------------------------------------------------------------- */

// Token
export function getAuthToken(): string | null {
  return getCookie('authToken');
}

export function setAuthToken(token: string): void {
  setCookie('authToken', token);
}

export function removeAuthToken(): void {
  removeCookie('authToken');
  removeCookie('user');
  removeCookie('userRole');
}

// User
export function getUser(): any {
  const user = getCookie('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setUser(user: any): void {
  setCookie('user', JSON.stringify(user));
  if (user?.role) {
    setCookie('userRole', user.role);
  }
}

export function getUserId(): number | null {
  const user = getUser();
  return user?.id || user?.userId || null;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function isAdmin(): boolean {
  const role = getCookie('userRole');
  return role === 'Admin';
}

export function setAuthCookie(token: string, role: string) {
  document.cookie = `authToken=${token}; path=/`;
  document.cookie = `userRole=${role}; path=/`;
}

export function clearAuthCookie() {
  document.cookie = "authToken=; path=/; max-age=0";
  document.cookie = "userRole=; path=/; max-age=0";
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
  setAuthCookie,
  clearAuthCookie,
};
