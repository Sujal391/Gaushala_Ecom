"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserLayout from '../../components/layout/UserLayout';
import { getUserCart, checkout } from '../../lib/api/auth';
import { isAuthenticated, getUserId } from '../../lib/api/config';
import { toast } from 'sonner';
import type { CartItem } from '../../types/index';

// Cache key for localStorage
const CART_CACHE_KEY = 'cart_updates_cache';

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
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [errors, setErrors] = useState<Partial<AddressForm>>({});
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to checkout');
      router.push('/shop');
      return;
    }

    loadCart();
  }, []);

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
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        images: item.images
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
              totalPrice: item.price * newQuantity
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
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
      router.push('/cart');
    } finally {
      setLoading(false);
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
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const placeOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    try {
      setPlacing(true);
      const userId = getUserId();

      if (!userId) {
        toast.error('User not found');
        return;
      }

      const response = await checkout({
        userId: userId,
        ...address
      });

      console.log('Checkout response:', response); // For debugging

      // Check if response exists and has orderId and success message
      if (response && response.orderId && response.message) {
        // Clear cart cache
        localStorage.removeItem(CART_CACHE_KEY);
        
        toast.success('Order Placed Successfully!', {
          description: `Order #${response.orderId} has been confirmed. Redirecting to orders...`,
          duration: 3000,
        });
        
        // Redirect to orders page
        setTimeout(() => {
          router.push('/my-orders');
        }, 1000);
      } else {
        toast.error('Order Failed', {
          description: response?.message || 'Failed to place order. Please try again.',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Order Failed', {
        description: 'Failed to place order. Please try again.',
        duration: 4000,
      });
    } finally {
      setPlacing(false);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.1;
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
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
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
                          <img
                            src={imageErrors.has(item.productId) 
                              ? '/placeholder-product.jpg'
                              : (item.images?.[0] 
                                ? `http://gaushalaecommerce.runasp.net${item.images[0]}`
                                : '/placeholder-product.jpg')
                            }
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Add productId to error set
                              setImageErrors(prev => new Set(prev).add(item.productId));
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">₹{item.totalPrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">₹{getTax().toFixed(2)}</span>
                  </div>
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
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={placeOrder}
                  disabled={placing || cart.length === 0}
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                <div className="mt-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
                  By placing this order, you agree to our terms and conditions
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}