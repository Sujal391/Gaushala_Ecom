"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, MapPin, ArrowLeft, Tag, X, MessageSquare, CreditCard, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import UserLayout from '../../components/layout/UserLayout';
import UserGuard from '../../components/guards/UserGuard';
import { 
  getUserCart, 
  applyOffer, 
  createPaymentOrder, 
  getPaymentConfig,
  createTempOrder,
  confirmPayment
} from '../../lib/api/auth';
import { isAuthenticated, getUserId, getAuthToken, API_BASE_URL } from '../../lib/api/config';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import type { CartItem } from '../../types/index';
import Lottie from "lottie-react";
import placedAnimation from "../../animations/placed.json";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Cache keys for localStorage
const CART_CACHE_KEY = 'cart_updates_cache';
const CHECKOUT_FORM_KEY = 'checkout_form_data';
const APPLIED_OFFER_KEY = 'applied_offer_data';

interface CartUpdate {
  productId: number;
  quantity: number;
}

interface AddressForm {
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  customerRemark: string;
}

interface AppliedOffer {
  offerCode: string;
  discount: number;
  discountPercentage?: number;
  offerType?: 'BUY_GET' | 'PERCENTAGE' | 'FLAT';
  freeItems?: Array<{
    productId: number;
    productName: string;
    quantity: number;
  }>;
}

interface PaymentConfig {
  keyId: string;
  name: string | null;
  description: string | null;
  image: string | null;
  theme: {
    color: string | null;
  };
}

interface CreateTempOrderResponse {
  success: boolean;
  data: {
    orderId: number;
    amount: number;
    currency: string;
    status: 'DRAFT' | 'PENDING_PAYMENT';
  };
  message?: string;
  errors?: Record<string, string>;
}

interface CreatePaymentOrderResponse {
  success: boolean;
  data: {
    orderId: number;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  };
  message?: string;
}

// Helper to detect free items in cart
const detectFreeItems = (cart: CartItem[]): CartItem[] => {
  return cart.filter(item => item.isFreeItem || (item.discountedPrice === 0 && item.price === 0));
};

export default function CheckoutPage() {
  const router = useRouter();
  const { fetchCart: refreshGlobalCart } = useCart();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [applyingOffer, setApplyingOffer] = useState(false);
  const [offerCode, setOfferCode] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [draftOrderId, setDraftOrderId] = useState<number | null>(null);
  const [address, setAddress] = useState<AddressForm>({
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    customerRemark: ''
  });
  const [errors, setErrors] = useState<Partial<AddressForm>>({});
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Load saved form data and applied offer on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to checkout');
      router.push('/shop');
      return;
    }

    // Load saved form data
    loadSavedFormData();
    
    // Load saved offer
    loadSavedOffer();

    loadCart();
    loadPaymentConfig();
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    if (!loading && Object.values(address).some(value => value !== '')) {
      saveFormData();
    }
  }, [address, loading]);

  // Save offer whenever it changes
  useEffect(() => {
    if (appliedOffer) {
      saveOfferData(appliedOffer);
    } else {
      clearSavedOffer();
    }
  }, [appliedOffer]);

  useEffect(() => {
    if (!showSuccessAnimation) return;

    const timer = setTimeout(() => {
      // Clear all saved data on successful order
      clearAllSavedData();
      router.replace('/my-orders');
    }, 2800);

    return () => clearTimeout(timer);
  }, [showSuccessAnimation, router]);

  // Load saved form data from localStorage
  const loadSavedFormData = () => {
    try {
      const saved = localStorage.getItem(CHECKOUT_FORM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAddress(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  };

  // Save form data to localStorage
  const saveFormData = () => {
    try {
      localStorage.setItem(CHECKOUT_FORM_KEY, JSON.stringify(address));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  // Load saved offer from localStorage
  const loadSavedOffer = () => {
    try {
      const saved = localStorage.getItem(APPLIED_OFFER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAppliedOffer(parsed);
      }
    } catch (error) {
      console.error('Error loading saved offer:', error);
    }
  };

  // Save offer to localStorage
  const saveOfferData = (offer: AppliedOffer) => {
    try {
      localStorage.setItem(APPLIED_OFFER_KEY, JSON.stringify(offer));
    } catch (error) {
      console.error('Error saving offer data:', error);
    }
  };

  // Clear saved offer
  const clearSavedOffer = () => {
    try {
      localStorage.removeItem(APPLIED_OFFER_KEY);
    } catch (error) {
      console.error('Error clearing saved offer:', error);
    }
  };

  // Clear all saved data
  const clearAllSavedData = () => {
    try {
      localStorage.removeItem(CHECKOUT_FORM_KEY);
      localStorage.removeItem(APPLIED_OFFER_KEY);
      localStorage.removeItem(CART_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing saved data:', error);
    }
  };

  // Load payment configuration
  const loadPaymentConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await getPaymentConfig();
      console.log('Payment config loaded:', response);
      
      if (response?.success && response.data) {
        const configData = response.data;
        console.log('Config data:', configData);
        
        if (configData.keyId) {
          const mappedConfig: PaymentConfig = {
            keyId: configData.keyId,
            name: configData.name || 'Gaushala Ecommerce',
            description: configData.description || 'Payment for order',
            image: configData.image || '',
            theme: configData.theme || { color: '#F97316' }
          };
          
          console.log('Mapped payment config:', mappedConfig);
          setPaymentConfig(mappedConfig);
        } else {
          console.error('No keyId found in config data:', configData);
          toast.error('Invalid payment configuration: Missing key ID');
        }
      } else {
        console.error('Invalid payment config response:', response);
        toast.error('Invalid payment configuration');
      }
    } catch (error) {
      console.error('Error loading payment config:', error);
      toast.error('Failed to load payment configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  // Load cached updates from localStorage
  const loadCachedUpdates = (): Map<number, number> => {
    try {
      const cached = localStorage.getItem(CART_CACHE_KEY);
      if (cached) {
        const updates: CartUpdate[] = JSON.parse(cached);
        return new Map(updates.map(u => [u.productId, u.quantity]));
      }
    } catch (error) {
      console.error('Error loading cached updates:', error);
    }
    return new Map();
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const userId = getUserId();

      if (!userId) {
        toast.error('User not found. Please login again.');
        router.push('/shop');
        return;
      }

      const response = await getUserCart(userId);

      let cartItems = [];
      
      if (response && response.data) {
        cartItems = response.data.items || response.data || [];
      } else if (response && response.items) {
        cartItems = response.items || [];
      } else if (Array.isArray(response)) {
        cartItems = response;
      } else {
        cartItems = [];
      }

      let mappedCart = cartItems.map((item: any) => ({
        cartItemId: item.cartItemId,
        productId: item.productId,
        productName: item.productName,
        price: item.productPrice || item.price,
        discountedPrice: item.discountedPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        totalDiscountedPrice: item.totalDiscountedPrice,
        images: item.images,
        selectedSize: item.selectedSize,
        sizePrices: item.sizePrices,
        sizeDiscountedPrices: item.sizeDiscountedPrices,
        isFreeItem: item.price === 0 || item.discountedPrice === 0 // Mark free items
      }));

      // Apply cached updates
      const cachedUpdates = loadCachedUpdates();
      if (cachedUpdates.size > 0) {
        mappedCart = mappedCart.map((item: CartItem) => {
          if (cachedUpdates.has(item.productId)) {
            const newQuantity = cachedUpdates.get(item.productId)!;
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: item.price * newQuantity,
              totalDiscountedPrice: (item.discountedPrice || item.price) * newQuantity
            };
          }
          return item;
        });
      }

      if (mappedCart.length === 0) {
        toast.error('Your cart is empty');
        router.push('/cart');
        return;
      }

      setCart(mappedCart);

      // After loading cart, check for free items and update offer if needed
      const freeItems = detectFreeItems(mappedCart);
      if (freeItems.length > 0 && appliedOffer) {
        // Update applied offer with free items info
        setAppliedOffer(prev => prev ? {
          ...prev,
          offerType: 'BUY_GET',
          freeItems: freeItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity
          }))
        } : null);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleApplyOffer = async () => {
    if (!offerCode.trim()) {
      toast.error('Please enter an offer code');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast.error('User not found');
      return;
    }

    try {
      setApplyingOffer(true);
      const response = await applyOffer(userId, offerCode.trim());

      if (response.success && response.data) {
        const discount = response.data.discount || 0;
        const discountPercentage = response.data.discountPercentage;
        
        // Check if this is a Buy Get Free offer (you may need to adjust this logic based on your API response)
        const isBuyGetOffer = response.data.offerType === 'BUY_GET' || 
                             (response.data.message && response.data.message.includes('free'));

        // Refresh cart to get free items
        await loadCart();

        setAppliedOffer({
          offerCode: offerCode.trim(),
          discount,
          discountPercentage,
          offerType: isBuyGetOffer ? 'BUY_GET' : (discountPercentage ? 'PERCENTAGE' : 'FLAT')
        });

        toast.success('Offer applied successfully!', {
          description: isBuyGetOffer 
            ? 'Free items have been added to your cart!' 
            : `You saved ₹${discount.toFixed(2)}`,
        });
        
        setOfferCode('');
      } else {
        toast.error('Invalid offer code', {
          description: response.message || 'This offer code is not valid or has expired',
        });
      }
    } catch (error) {
      console.error('Error applying offer:', error);
      toast.error('Failed to apply offer', {
        description: 'Please try again later',
      });
    } finally {
      setApplyingOffer(false);
    }
  };

  const handleRemoveOffer = async () => {
    try {
      setAppliedOffer(null);
      
      // Refresh cart to remove free items
      await loadCart();
      
      toast.info('Offer code removed');
    } catch (error) {
      console.error('Error removing offer:', error);
      toast.error('Failed to remove offer');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressForm> = {};

    if (!address.houseNo.trim()) {
      newErrors.houseNo = 'House number is required';
    }
    if (!address.street.trim()) {
      newErrors.street = 'Street is required';
    }
    if (!address.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!address.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!address.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(address.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AddressForm, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const createTemporaryOrder = async (): Promise<number | null> => {
    try {
      const rawUserId = getUserId();
      const token = getAuthToken();

      if (!rawUserId || !token) {
        toast.error('User not found');
        return null;
      }

      let userId: number;
      if (typeof rawUserId === 'string') {
        userId = parseInt(rawUserId, 10);
      } else if (typeof rawUserId === 'number') {
        userId = rawUserId;
      } else {
        toast.error('Invalid user ID format');
        return null;
      }

      if (isNaN(userId)) {
        toast.error('Invalid user ID format');
        return null;
      }

      const payload = {
        userId: userId,
        houseNo: String(address.houseNo || '').trim(),
        street: String(address.street || '').trim(),
        landmark: String(address.landmark || '').trim() || "Not provided",
        city: String(address.city || '').trim(),
        state: String(address.state || '').trim(),
        pincode: String(address.pincode || '').trim(),
        offerCode: appliedOffer?.offerCode ? String(appliedOffer.offerCode).trim() : "",
        customerRemark: address.customerRemark ? String(address.customerRemark).trim() : ""
      };

      const response = await createTempOrder(payload, token) as CreateTempOrderResponse;
      
      if (response.success && response.data?.orderId) {
        setDraftOrderId(response.data.orderId);
        toast.success('Order created successfully');
        return response.data.orderId;
      } else {
        if (response.errors) {
          Object.entries(response.errors).forEach(([field, message]) => {
            toast.error(`${field}: ${message}`);
          });
        } else {
          toast.error(response.message || 'Failed to create order');
        }
        return null;
      }
    } catch (error) {
      console.error('Error in createTemporaryOrder:', error);
      toast.error('Failed to create order');
      return null;
    }
  };

  const createRazorpayPaymentOrder = async (orderId: number): Promise<CreatePaymentOrderResponse | null> => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication failed');
        return null;
      }

      const response = await createPaymentOrder(orderId, token) as CreatePaymentOrderResponse;
      return response;
    } catch (error) {
      console.error('Error creating payment order:', error);
      toast.error('Failed to initialize payment');
      return null;
    }
  };

  const handlePaymentSuccess = async (response: any, orderData: any) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication failed');
        setPlacing(false);
        return;
      }

      const confirmPayload = {
        orderId: orderData.orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature
      };

      const confirmResponse = await confirmPayment(confirmPayload, token);

      if (confirmResponse.success) {
        // Clear all saved data on successful payment
        clearAllSavedData();
        setAppliedOffer(null);
        
        // Refresh global cart
        await refreshGlobalCart();

        toast.success('Payment Successful! Order Placed Successfully!');
        setShowSuccessAnimation(true);
      } else {
        toast.error('Payment verification failed');
        setPlacing(false);
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error('Failed to confirm payment');
      setPlacing(false);
    }
  };

  const initializeRazorpayPayment = async (orderData: any) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication failed');
        setPlacing(false);
        return;
      }

      if (!paymentConfig || !paymentConfig.keyId) {
        toast.error('Payment configuration not loaded properly');
        setPlacing(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setPlacing(false);
        return;
      }

      if (typeof window.Razorpay === 'undefined') {
        toast.error('Payment gateway initialization failed');
        setPlacing(false);
        return;
      }

      const options = {
        key: paymentConfig.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: paymentConfig.name || 'Gaushala Ecommerce',
        description: paymentConfig.description || `Order #${orderData.orderId}`,
        image: paymentConfig.image || '',
        order_id: orderData.razorpayOrderId,
        handler: async (response: any) => {
          await handlePaymentSuccess(response, orderData);
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: paymentConfig.theme || { color: '#F97316' },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setPlacing(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      toast.error('Failed to initialize payment');
      setPlacing(false);
    }
  };

  const placeOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    if (!paymentConfig || !paymentConfig.keyId) {
      toast.error('Payment configuration not loaded. Please refresh the page.');
      return;
    }

    try {
      setPlacing(true);
      
      const orderId = await createTemporaryOrder();
      
      if (!orderId) {
        setPlacing(false);
        return;
      }
      
      const paymentOrder = await createRazorpayPaymentOrder(orderId);
      
      if (!paymentOrder || !paymentOrder.success) {
        toast.error('Failed to create payment order');
        setPlacing(false);
        return;
      }
      
      await initializeRazorpayPayment({
        orderId: paymentOrder.data.orderId,
        razorpayOrderId: paymentOrder.data.razorpayOrderId,
        amount: paymentOrder.data.amount,
        currency: paymentOrder.data.currency
      });
      
    } catch (error) {
      console.error('Error in placeOrder:', error);
      toast.error('Failed to process order');
      setPlacing(false);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      // Don't include free items in subtotal
      if (item.isFreeItem) return total;
      const itemTotal = item.totalPrice;
      return total + itemTotal;
    }, 0);
  };

  const getTotalSavings = () => {
    return cart.reduce((total, item) => {
      if (item.discountedPrice && !item.isFreeItem) {
        const originalTotal = item.price * item.quantity;
        const discountedTotal = (item.discountedPrice || item.price) * item.quantity;
        return total + (originalTotal - discountedTotal);
      }
      return total;
    }, 0);
  };

  const getDiscount = () => {
    return appliedOffer ? appliedOffer.discount : 0;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const totalSavings = getTotalSavings();
    const discount = getDiscount();
    return subtotal - totalSavings - discount;
  };

  const getFreeItems = () => {
    return cart.filter(item => item.isFreeItem);
  };

  const getItemDisplayPrice = (item: CartItem) => {
    return item.discountedPrice || item.price;
  };

  const getItemOriginalPrice = (item: CartItem) => {
    return item.price;
  };

  const getItemTotal = (item: CartItem) => {
    return item.totalDiscountedPrice || item.totalPrice;
  };

  const getItemOriginalTotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  if (loading || configLoading) {
    return (
      <UserGuard>
        <UserLayout>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading checkout...</p>
            </div>
          </div>
        </UserLayout>
      </UserGuard>
    );
  }

  if (!paymentConfig || !paymentConfig.keyId) {
    return (
      <UserGuard>
        <UserLayout>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Payment Configuration Error</h2>
                  <p className="text-muted-foreground mb-4">
                    Unable to load payment configuration. Please try again later.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </UserLayout>
      </UserGuard>
    );
  }

  if (showSuccessAnimation) {
    return (
      <UserGuard>
        <UserLayout>
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-64 h-64">
              <Lottie animationData={placedAnimation} loop={false} />
            </div>

            <h2 className="text-xl font-semibold mt-4">
              Order Placed Successfully 🎉
            </h2>

            <p className="text-muted-foreground mt-2">
              Redirecting to your orders...
            </p>
          </div>
        </UserLayout>
      </UserGuard>
    );
  }

  const totalSavings = getTotalSavings();
  const freeItems = getFreeItems();

  return (
    <UserGuard>
      <UserLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/cart')}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>

          <h1 className="text-3xl sm:text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Address Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="houseNo">House/Flat No. *</Label>
                      <Input
                        id="houseNo"
                        value={address.houseNo}
                        onChange={(e) => handleInputChange('houseNo', e.target.value)}
                        placeholder="e.g., 123"
                        className={errors.houseNo ? 'border-red-500' : ''}
                      />
                      {errors.houseNo && (
                        <p className="text-sm text-red-500 mt-1">{errors.houseNo}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="street">Street *</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder="e.g., Main Street"
                        className={errors.street ? 'border-red-500' : ''}
                      />
                      {errors.street && (
                        <p className="text-sm text-red-500 mt-1">{errors.street}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={address.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="e.g., Near Park"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="e.g., Mumbai"
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="e.g., Maharashtra"
                        className={errors.state ? 'border-red-500' : ''}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-500 mt-1">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={address.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="e.g., 400001"
                      maxLength={6}
                      className={errors.pincode ? 'border-red-500' : ''}
                    />
                    {errors.pincode && (
                      <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customerRemark" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="customerRemark"
                      value={address.customerRemark}
                      onChange={(e) => handleInputChange('customerRemark', e.target.value)}
                      placeholder="Any special instructions or remarks for your order..."
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add any special delivery instructions or notes for the admin
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Items ({cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const displayPrice = getItemDisplayPrice(item);
                      const originalPrice = getItemOriginalPrice(item);
                      const itemTotal = getItemTotal(item);
                      const originalTotal = getItemOriginalTotal(item);
                      const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
                      const isFree = item.isFreeItem || item.price === 0;
                      
                      return (
                        <div
                          key={item.cartItemId}
                          className={`flex items-center justify-between py-3 border-b last:border-b-0 ${isFree ? 'bg-green-50/50 rounded-lg px-3' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
                              <img
                                src={imageErrors.has(item.productId) 
                                  ? '/placeholder-product.jpg'
                                  : (item.images?.[0] 
                                    ? `${API_BASE_URL}${item.images[0]}`
                                    : '/placeholder-product.jpg')
                                }
                                alt={item.productName}
                                className="w-full h-full object-contain"
                                onError={() => {
                                  setImageErrors(prev => new Set(prev).add(item.productId));
                                }}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.productName}</p>
                                {isFree && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <Gift className="h-3 w-3 mr-1" />
                                    FREE
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.selectedSize}</p>
                              <div className="flex items-center gap-2 text-sm">
                                {isFree ? (
                                  <span className="text-green-600 font-medium">FREE</span>
                                ) : hasDiscount ? (
                                  <>
                                    <span className="text-primary font-medium">
                                      ₹{displayPrice.toFixed(2)}
                                    </span>
                                    <span className="text-muted-foreground line-through text-xs">
                                      ₹{originalPrice.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">
                                    ₹{originalPrice.toFixed(2)}
                                  </span>
                                )}
                                <span className="text-muted-foreground">
                                  × {item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {isFree ? (
                              <p className="font-semibold text-green-600">FREE</p>
                            ) : (
                              <>
                                <p className="font-semibold text-primary">
                                  ₹{itemTotal.toFixed(2)}
                                </p>
                                {hasDiscount && originalTotal > itemTotal && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    ₹{originalTotal.toFixed(2)}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Free Items Summary */}
                  {freeItems.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 font-medium flex items-center gap-2 mb-2">
                        <Gift className="h-4 w-4" />
                        Free Items Added to Your Order!
                      </p>
                      <div className="space-y-1">
                        {freeItems.map((item, index) => (
                          <p key={index} className="text-xs text-green-600">
                            • {item.quantity}x {item.productName} (FREE)
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Total Savings Banner */}
                  {totalSavings > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        You're saving ₹{totalSavings.toFixed(2)} on this order!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {/* Offer Code Section */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="h-4 w-4" />
                        Have an offer code?
                      </Label>
                      
                      {appliedOffer ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-900">
                                  {appliedOffer.offerCode}
                                </p>
                                {appliedOffer.offerType === 'BUY_GET' ? (
                                  <p className="text-xs text-green-700">
                                    Buy Get Free offer applied
                                  </p>
                                ) : (
                                  <p className="text-xs text-green-700">
                                    Saved ₹{appliedOffer.discount.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveOffer}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Show free items in offer section */}
                          {appliedOffer.freeItems && appliedOffer.freeItems.length > 0 && (
                            <div className="p-2 bg-green-50 rounded-md text-xs">
                              <p className="font-medium text-green-800 mb-1">You get:</p>
                              {appliedOffer.freeItems.map((item, idx) => (
                                <p key={idx} className="text-green-600">
                                  • {item.quantity}x {item.productName} FREE
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter code"
                            value={offerCode}
                            onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleApplyOffer();
                              }
                            }}
                            disabled={applyingOffer}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleApplyOffer}
                            disabled={applyingOffer || !offerCode.trim()}
                            variant="outline"
                          >
                            {applyingOffer ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Apply'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{getSubtotal().toFixed(2)}</span>
                      </div>
                      
                      {/* Product Savings */}
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Product Discounts</span>
                          <span className="font-medium text-green-600">
                            -₹{totalSavings.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {/* Offer Code Discount */}
                      {appliedOffer && appliedOffer.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Offer Discount</span>
                          <span className="font-medium text-green-600">
                            -₹{getDiscount().toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="text-xl font-bold text-primary">
                            ₹{getTotal().toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Free Items Value */}
                        {freeItems.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-green-600 font-medium">
                              You get {freeItems.length} free item(s) worth ₹
                              {freeItems.reduce((total, item) => 
                                total + (item.price * item.quantity), 0
                              ).toFixed(2)}
                            </p>
                          </div>
                        )}
                        
                        {/* Total Savings Summary */}
                        {(totalSavings > 0 || appliedOffer) && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-green-600 font-medium">
                              Total savings: ₹{(totalSavings + getDiscount()).toFixed(2)}
                            </p>
                            {totalSavings > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Includes product discounts
                              </p>
                            )}
                            {appliedOffer && (
                              <p className="text-xs text-muted-foreground">
                                Includes offer code: {appliedOffer.offerCode}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={placeOrder}
                    disabled={placing || showSuccessAnimation || cart.length === 0}
                  >
                    {placing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Proceed to Pay ₹{getTotal().toFixed(2)}
                      </>
                    )}
                  </Button>

                  <div className="mt-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
                    <p>By placing this order, you agree to our terms and conditions</p>
                    <p className="mt-2 text-[10px]">Payments are processed securely via Razorpay</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </UserLayout>
    </UserGuard>
  );
}