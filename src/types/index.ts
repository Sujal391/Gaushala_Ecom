// src/types/index.ts

// ==================== COMMON TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ==================== AUTH TYPES ====================

export interface RegisterPayload {
  name: string;
  email: string;
  mobileNo: string;
  password: string;
  confirmPassword: string;
  createdAt: string;
}

export interface LoginPayload {
  emailOrMobile: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  role: string;
  email?: string;
  mobileNo?: string;
  referralCode?: string;
  referredByUserId?: number;
}

export interface User {
  id?: number;
  userId?: number;
  name?: string;
  email?: string;
  mobileNo?: string;
  role?: string;
  isAdmin?: boolean;
}

export interface MyProfileResponse {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
  referralCode: string;
  referredByUserId: number | null;
  createdAt: string;
}

// ==================== REFERRAL TYPES ====================

export interface ReferredUser {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
  registeredAt: string;
  isReferralUsed: boolean;
}

export interface Referrer {
  referrerUserId: number;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  totalReferredCount: number;
  referredUsers: ReferredUser[];
}

export interface ReferralSummaryResponse {
  success: boolean;
  totalReferrers: number;
  data: Referrer[];
}

// ==================== PRODUCT TYPES ====================

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stockQty: number;
  sizes: string[];
  images: string[];
  createdAt: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  description: string;
  stockQty: number;
  images: File[];
}

export interface UpdateProductPayload {
  name: string;
  price: number;
  description: string;
  stockQty: number;
  images: string[];
}

// ==================== CART TYPES ====================

export interface AddToCartPayload {
  userId: number;
  productId: number;
  quantity: number;
  selectedSize?: string;
}

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  sizes: string;
  selectedSize: string;
  price: number;
  quantity: number;
  totalPrice: number;
  images: string[];
}

export interface CartResponse {
  items: CartItem[];
  cartTotal: number;
  
}

// ==================== SAMPLE REQUEST TYPES ====================

export interface CreateSampleRequestPayload {
  userId: number;
  productId: number;
  productName: string; // optional if backend requires it
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateSampleRequestResponse {
  id: number;
  message: string;
}

export type SampleRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'shipped';

export interface SampleRequest {
  sampleRequestId: number;
  userId: number;
  productId: number;
  productName: string;
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  status: SampleRequestStatus;
  adminRemark?: string;
  createdAt: string;
  updatedAt: string;
}

export type GetAllSampleRequestsResponse = SampleRequest[];

export type GetUserSampleRequestsResponse = SampleRequest[];

export interface UpdateSampleRequestStatusPayload {
  status: SampleRequestStatus;
  adminRemark?: string;
}

export interface UpdateSampleRequestStatusResponse {
  id: number;
  status: SampleRequestStatus;
  adminRemark?: string;
  message: string;
}


// ==================== FEEDBACK TYPES ====================

export interface Feedback {
  feedbackId: number;
  productId: number;
  userId: number;
  rating: number;
  review: string;
  createdAt: string;
}

export interface FeedbackApiResponse {
  success: boolean;
  message: string;
  data: Feedback[];
  error?: string;
}

// ==================== ORDER TYPES ====================

export interface CheckoutPayload {
  userId: number;
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  offerCode: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: number;
  userId?: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  isReferralDiscountApplied: boolean;
  orderStatus: string;
  createdAt?: string;
  orderDate?: string;
  items?: OrderItem[];
}

export interface PendingOrder {
  orderId: number;
  userId: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  isReferralDiscountApplied: boolean;
  orderStatus: string;
  createdAt: string;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  recentOrders: Order[];
}

// ==================== CUSTOMER TYPES ====================

export interface Customer {
  id: number;
  name: string;
  email: string;
  mobileNo: string;
  isActive: boolean;
  createdAt: string;
}

export interface IncompleteUser {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
  createdAt: string;
}

// ==================== PAYMENT TYPES ====================

export interface PaymentInitiateResponse {
  orderId: number;
  paymentId: string;
  amount: number;
  currency: string;
  paymentGateway: string;
  gatewayPayload: {
    key: string;
    order_id: string;
    amount: number;
    currency: string;
  };
}

export interface PaymentSuccessResponse {
  orderId: number;
  paymentStatus: string;
  transactionId: string;
  paidAt: string;
}

export interface PaymentFailureResponse {
  orderId: number;
  paymentStatus: string;
  reason: string;
}

// ==================== OFFERS TYPES ====================

export interface OfferProduct {
  productId: number;
  productName: string;
}

export interface Offer {
  offerId: number;
  offerCode: string;
  offerType: string;
  discountPercent: number;
  minQuantity: number;
  maxDiscountPercent: number;
  maxDiscountAmount: number; // Add this field
  validFrom: string;
  validTo: string;
  products: {
    productId: number;
    productName: string;
  }[];
}
export interface CreateOfferPayload {
  offerCode: string;
  offerType: string;
  discountPercent: number;
  minQuantity: number;
  productIds: number[];
  maxDiscountPercent: number;
  maxDiscountAmount: number; // Add this field
  slabs: OfferSlab[];
  validFrom: string;
  validTo: string;
}

export interface OfferSlab {
  minAmount: number;
  maxAmount: number;
  discountPercent: number;
}

export interface ApplyOfferRequest {
  userId: number;
  offerCode: string;
}

export interface LayoutProps {
  children: React.ReactNode;
}