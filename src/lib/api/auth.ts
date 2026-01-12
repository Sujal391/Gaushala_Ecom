// src/lib/api/api.ts

import { 
  API_BASE_URL, 
  API_ENDPOINTS, 
  setAuthToken, 
  setUser,
  getAuthToken,
  getUserId 
} from './config';

import type {
  ApiResponse,
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  Product,
  UpdateProductPayload,
  AddToCartPayload,
  CartResponse,
  DashboardStats,
  CheckoutPayload,
  Order,
  PendingOrder,
  PaymentInitiateResponse,
  Customer,
  Offer,
  ApplyOfferRequest,
  CreateOfferRequest,
  MyProfileResponse,
} from '../../types/index';

// ==================== HELPER FUNCTIONS ====================

// src/lib/api/api.ts

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      // Handle error responses (could be raw error or formatted)
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }

    // Check if response is already in ApiResponse format
    if (data && typeof data === 'object' && 'success' in data) {
      return data as ApiResponse<T>;
    }

    // If response has 'data' property (some APIs wrap data like this)
    if (data && typeof data === 'object' && 'data' in data) {
      return {
        success: true,
        message: 'Request successful',
        data: data.data as T,
      };
    }

    // If response has 'message' property (success with message)
    if (data && typeof data === 'object' && 'message' in data) {
      return {
        success: true,
        message: data.message,
        data: data.data || data, // Try to get data property, fall back to whole object
      };
    }

    // Raw data response (most common case for you)
    return {
      success: true,
      message: 'Request successful',
      data: data as T,
    };
  } catch (error) {
    console.error('handleResponse - Parse error:', error);
    return {
      success: false,
      message: 'Failed to parse response',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function getHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

function getFormDataHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {};
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Don't set Content-Type for FormData - browser will set it with boundary
  return headers;
}

export function extractData<T>(apiResponse: ApiResponse<T> | any): T | null {
  // If it's already ApiResponse format
  if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
    return apiResponse.success ? apiResponse.data : null;
  }
  
  // If it's raw data (most of your APIs)
  return apiResponse as T;
}

export function extractMessage(apiResponse: ApiResponse<any> | any): string | undefined {
  if (apiResponse && typeof apiResponse === 'object' && 'message' in apiResponse) {
    return apiResponse.message;
  }
  
  if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
    return apiResponse.message;
  }
  
  return undefined;
}

// ==================== AUTH APIs ====================

export async function registerUser(payload: RegisterPayload): Promise<ApiResponse> {
  try {
    if (payload.password !== payload.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
        error: 'Passwords do not match',
      };
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const apiResponse = await handleResponse<AuthResponse>(response);
    console.log('Login API Response (full):', JSON.stringify(apiResponse, null, 2));

    // Handle different response formats from backend
    const authData = apiResponse as any;

    // Check if response has token (indicates successful login)
    if (authData.token && authData.userId) {
      console.log('Login successful - token and userId found in response');
      setAuthToken(authData.token);

      const user = {
        userId: authData.userId,
        name: authData.name,
        role: authData.role,
        email: payload.emailOrMobile.includes('@') ? payload.emailOrMobile : undefined,
        mobileNo: !payload.emailOrMobile.includes('@') ? payload.emailOrMobile : undefined,
      };
      setUser(user);
      console.log('User stored:', user);

      // Return success response
      return {
        success: true,
        message: 'Login successful',
        data: authData,
      };
    }

    // Case 2: Response has data property with auth info (wrapped format)
    if (apiResponse.success && apiResponse.data) {
      console.log('Login successful - data property found');
      setAuthToken(apiResponse.data.token);

      const user = {
        userId: apiResponse.data.userId,
        name: apiResponse.data.name,
        role: apiResponse.data.role,
        email: payload.emailOrMobile.includes('@') ? payload.emailOrMobile : undefined,
        mobileNo: !payload.emailOrMobile.includes('@') ? payload.emailOrMobile : undefined,
      };
      setUser(user);
      console.log('User stored:', user);
      return apiResponse;
    }

    // If we get here, login failed
    console.error('Login failed - no token found in response');
    return {
      success: false,
      message: authData.message || 'Login failed',
      error: authData.error || 'Invalid credentials',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getMyProfile(): Promise<ApiResponse<MyProfileResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<MyProfileResponse>(response);
  } catch (error) {
    console.error('Get my profile error:', error);
    return {
      success: false,
      message: 'Failed to fetch my profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== PRODUCT APIs ====================

export async function getAllProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<Product[]>(response);
  } catch (error) {
    console.error('Get products error:', error);
    return {
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getProductById(id: string | number): Promise<ApiResponse<Product>> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.DETAIL(id)}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<Product>(response);
  } catch (error) {
    console.error('Get product error:', error);
    return {
      success: false,
      message: 'Failed to fetch product',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function createProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.CREATE}`,
      {
        method: 'POST',
        body: formData, // ✅ DO NOT TOUCH
      }
    );

    return handleResponse<Product>(response);
  } catch (error) {
    console.error('Create product error:', error);
    return {
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateProduct(
  id: string | number, 
  payload: UpdateProductPayload
): Promise<ApiResponse<Product>> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.UPDATE(id)}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    return handleResponse<Product>(response);
  } catch (error) {
    console.error('Update product error:', error);
    return {
      success: false,
      message: 'Failed to update product',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteProduct(id: string | number): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.DELETE(id)}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Delete product error:', error);
    return {
      success: false,
      message: 'Failed to delete product',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== CART APIs ====================

export async function addToCart(payload: AddToCartPayload): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART.ADD}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Add to cart error:', error);
    return {
      success: false,
      message: 'Failed to add item to cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getUserCart(userId?: number): Promise<ApiResponse<CartResponse>> {
  try {
    const id = userId || getUserId();
    if (!id) {
      return {
        success: false,
        message: 'User not authenticated',
        error: 'No user ID found',
      };
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART.GET(id)}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<CartResponse>(response);
  } catch (error) {
    console.error('Get cart error:', error);
    return {
      success: false,
      message: 'Failed to fetch cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function removeFromCart(cartItemId: number): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART.REMOVE(cartItemId)}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Remove from cart error:', error);
    return {
      success: false,
      message: 'Failed to remove item from cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function clearCart(userId?: number): Promise<ApiResponse> {
  try {
    const id = userId || getUserId();
    if (!id) {
      return {
        success: false,
        message: 'User not authenticated',
        error: 'No user ID found',
      };
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART.CLEAR(id)}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Clear cart error:', error);
    return {
      success: false,
      message: 'Failed to clear cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== DASHBOARD APIs ====================

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  try {
    console.log('Fetching dashboard stats...');
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    console.log('Dashboard API response status:', response.status);
    const apiResponse = await handleResponse<DashboardStats>(response);
    console.log('Dashboard API response:', apiResponse);

    // Check if response is the direct data (not wrapped in ApiResponse)
    const data = apiResponse as any;
    if (data && typeof data === 'object' && 'totalRevenue' in data && 'recentOrders' in data) {
      return {
        success: true,
        message: 'Dashboard stats fetched successfully',
        data: data,
      };
    }

    return apiResponse as ApiResponse<DashboardStats>;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== CUSTOMER APIs ====================

export async function getAdminCustomers(): Promise<ApiResponse<Customer[]>> {
  try {
    console.log('Fetching admin customers...');

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_CUSTOMERS.BASE}`, // "/api/admin/customers"
      {
        method: 'GET',
        headers: getHeaders(true),
      }
    );

    console.log('Customers API response status:', response.status);
    const apiResponse = await handleResponse<Customer[]>(response);
    console.log('Customers API response:', apiResponse);

    // Handle direct array response (not wrapped)
    if (Array.isArray(apiResponse)) {
      return {
        success: true,
        message: 'Customers fetched successfully',
        data: apiResponse,
      };
    }

    return apiResponse as ApiResponse<Customer[]>;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return {
      success: false,
      message: 'Failed to fetch customers',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateCustomerStatus(
  userId: number | string,
  isActive: boolean
): Promise<ApiResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_CUSTOMERS.UPDATE_STATUS(
        userId
      )}?isActive=${isActive}`,
      {
        method: 'PUT',
        headers: getHeaders(true),
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Update customer status error:', error);
    return {
      success: false,
      message: 'Failed to update customer status',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== ORDER APIs ====================

export async function checkout(payload: CheckoutPayload): Promise<ApiResponse<Order>> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.CHECKOUT}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    return handleResponse<Order>(response);
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      success: false,
      message: 'Failed to place order',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getMyOrders(userId?: number): Promise<ApiResponse<Order[]>> {
  try {
    const id = userId || getUserId();
    if (!id) {
      return {
        success: false,
        message: 'User not authenticated',
        error: 'No user ID found',
      };
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.MY_ORDERS(id)}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<Order[]>(response);
  } catch (error) {
    console.error('Get orders error:', error);
    return {
      success: false,
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAllOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS.ALL_ORDERS}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    return handleResponse<Order[]>(response);
  } catch (error) {
    console.error('Get all orders error:', error);
    return {
      success: false,
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateOrderStatus(
  orderId: number,
  status: 'Placed' | 'Packed' | 'Dispatched' | 'Delivered'
): Promise<ApiResponse<null>> {
  try {
    // Build URL with query parameter
    const url = new URL(
      `${API_BASE_URL}${API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId)}`
    );
    
    // Add status as query parameter
    url.searchParams.append('status', status);
    
    const response = await fetch(
      url.toString(),
      {
        method: 'PUT',
        headers: getHeaders(true),
      }
    );

    return handleResponse<null>(response);
  } catch (error) {
    console.error('Update order status error:', error);
    return {
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function cancelMyOrder(
  orderId: number,
  userId: number
): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/orders/cancel/${orderId}/customer/${userId}`,
      {
        method: 'PUT', // ✅ fixed
        headers: getHeaders(true),
      }
    );

    return handleResponse<null>(response);
  } catch (error) {
    console.error('Cancel order error:', error);
    return {
      success: false,
      message: 'Failed to cancel order',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function getPendingOrders(
  params?: { date?: string }
): Promise<ApiResponse<PendingOrder[]>> {
  try {
    const queryString = params?.date
      ? `?date=${encodeURIComponent(params.date)}`
      : '';

    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ORDERS.PENDING_ORDERS}${queryString}`,
      {
        method: 'GET',
        headers: getHeaders(true),
      }
    );

    return handleResponse<PendingOrder[]>(response);
  } catch (error) {
    console.error('Get pending orders error:', error);
    return {
      success: false,
      message: 'Failed to fetch pending orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== PAYMENT APIs ====================

export async function initiatePayment(
  orderId: number
): Promise<ApiResponse<PaymentInitiateResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT.INITIATE(orderId)}`, {
      method: 'POST',
      headers: getHeaders(true),
    });

    return handleResponse<PaymentInitiateResponse>(response);
  } catch (error) {
    console.error('Initiate payment error:', error);
    return {
      success: false,
      message: 'Failed to initiate payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function paymentSuccess(gatewayResponse: any): Promise<ApiResponse> {
  try {
    const formData = new FormData();
    formData.append('response', JSON.stringify(gatewayResponse));

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT.SUCCESS}`, {
      method: 'POST',
      headers: getFormDataHeaders(true),
      body: formData,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Payment success callback error:', error);
    return {
      success: false,
      message: 'Failed to process payment success',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function paymentFailure(gatewayResponse: any): Promise<ApiResponse> {
  try {
    const formData = new FormData();
    formData.append('response', JSON.stringify(gatewayResponse));

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT.FAILURE}`, {
      method: 'POST',
      headers: getFormDataHeaders(true),
      body: formData,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Payment failure callback error:', error);
    return {
      success: false,
      message: 'Failed to process payment failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
// ==================== OFFERS APIs ====================

export async function getAllOffers(): Promise<ApiResponse<Offer[]>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.OFFER.LIST}`,
      {
        method: 'GET',
        headers: getHeaders(true),
      }
    );

    return handleResponse<Offer[]>(response);
  } catch (error) {
    console.error('Get offers error:', error);
    return {
      success: false,
      message: 'Failed to fetch offers',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function createOffer(payload: CreateOfferRequest): Promise<ApiResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.OFFER.CREATE}`,
      {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error('Create offer error:', error);
    return {
      success: false,
      message: 'Failed to create offer',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function applyOffer(userId: number, offerCode: string): Promise<ApiResponse<ApplyOfferRequest>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.OFFER.APPLY}`,
      {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ userId, offerCode }),
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error('Apply offer error:', error);
    return {
      success: false,
      message: 'Failed to apply offer',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== EXPORTS ====================

export default {
  // Auth
  registerUser,
  loginUser,
  getMyProfile,
  
  // Products
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Cart
  addToCart,
  getUserCart,
  removeFromCart,
  clearCart,
  
  // Orders
  checkout,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
  
  // Payment
  initiatePayment,
  paymentSuccess,
  paymentFailure,
};