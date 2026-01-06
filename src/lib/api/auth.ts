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
  CreateProductPayload,
  UpdateProductPayload,
  AddToCartPayload,
  CartItem,
  CartResponse,
  DashboardStats,
  CheckoutPayload,
  OrderItem,
  Order,
  PaymentInitiateResponse,
  Customer,
} from '../../types/index';

// ==================== HELPER FUNCTIONS ====================

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();
    console.log('handleResponse - HTTP Status:', response.status, response.ok);
    console.log('handleResponse - Response data:', data);

    if (!response.ok) {
      console.error('handleResponse - Request failed:', data);
      return {
        success: false,
        message: data.message || 'Request failed',
        error: data.error || 'Request failed',
      };
    }

    return data;
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
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
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_CUSTOMERS}`, // "/api/admin/customers"
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
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

// ==================== EXPORTS ====================

export default {
  // Auth
  registerUser,
  loginUser,
  
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
  
  // Payment
  initiatePayment,
  paymentSuccess,
  paymentFailure,
};