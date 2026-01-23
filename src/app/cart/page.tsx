"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UserLayout from '../../components/layout/UserLayout';
import UserGuard from '../../components/guards/UserGuard';
import { getUserCart, removeFromCart, clearCart, addToCart } from '../../lib/api/auth';
import { isAuthenticated, getUserId } from '../../lib/api/config';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import type { CartItem } from '../../types/index';

// Cache key for localStorage
const CART_CACHE_KEY = 'cart_updates_cache';

interface CartUpdate {
  productId: number;
  quantity: number;
}

interface CartItemApi {
  cartItemId: number;
  productId: number;
  productName: string;
  description: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  sizes: string;
  selectedSize: string;
  images: string[];
}

interface ExtendedCartItem extends CartItem {
  originalQuantity: number;
}



export default function CartPage() {
  const router = useRouter();
  const { fetchCart: refreshGlobalCart } = useCart();
  const [cart, setCart] = useState<ExtendedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to view your cart');
      router.push('/shop');
      return;
    }

    loadCart();
  }, []);

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

  const saveCachedUpdates = (updates: Map<number, number>) => {
    try {
      const updateArray: CartUpdate[] = Array.from(updates.entries()).map(([productId, quantity]) => ({
        productId,
        quantity
      }));
      localStorage.setItem(CART_CACHE_KEY, JSON.stringify(updateArray));
    } catch (error) {
      console.error('Error saving cached updates:', error);
    }
  };

  const clearCachedUpdates = () => {
    try {
      localStorage.removeItem(CART_CACHE_KEY);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error clearing cached updates:', error);
    }
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
      console.log('Get cart response:', response);

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

      console.log('Cart items:', cartItems);

      let mappedCart: ExtendedCartItem[] = cartItems.map((item: CartItemApi) => {
        let displaySize = item.selectedSize;
        
        if (!displaySize || displaySize.trim() === '') {
          try {
            const sizesArray = JSON.parse(item.sizes);
            if (Array.isArray(sizesArray) && sizesArray.length > 0) {
              displaySize = sizesArray[0];
            } else {
              displaySize = 'No size';
            }
          } catch (error) {
            displaySize = 'No size';
          }
        }
        
        return {
          cartItemId: item.cartItemId,
          productId: item.productId,
          productName: item.productName,
          description: item.description,
          price: item.productPrice,
          quantity: item.quantity,
          originalQuantity: item.quantity,
          totalPrice: item.totalPrice,
          images: item.images,
          selectedSize: item.selectedSize
        };
      });

      const cachedUpdates = loadCachedUpdates();
      if (cachedUpdates.size > 0) {
        let hasChanges = false;
        mappedCart = mappedCart.map((item) => {
          if (cachedUpdates.has(item.productId)) {
            const newQuantity = cachedUpdates.get(item.productId)!;
            if (newQuantity !== item.originalQuantity) {
              hasChanges = true;
            }
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: item.price * newQuantity
            };
          }
          return item;
        });
        setHasUnsavedChanges(hasChanges);
      }

      console.log('Mapped cart items:', mappedCart);
      setCart(mappedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (cartItemId: number, productId: number, change: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) return item;
          
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.price * newQuantity
          };
        }
        return item;
      });

      const cachedUpdates = loadCachedUpdates();
      const updatedItem = updatedCart.find(item => item.productId === productId);
      if (updatedItem) {
        cachedUpdates.set(productId, updatedItem.quantity);
        saveCachedUpdates(cachedUpdates);
        
        const hasChanges = updatedCart.some(item => item.quantity !== item.originalQuantity);
        setHasUnsavedChanges(hasChanges);
      }

      return updatedCart;
    });
  };

  const removeItem = async (cartItemId: number, productId: number) => {
    try {
      setUpdating(true);
      const response = await removeFromCart(cartItemId);

      if (response && (response.success || !response.error)) {
        toast.success('Item removed from cart');

        const cachedUpdates = loadCachedUpdates();
        cachedUpdates.delete(productId);
        saveCachedUpdates(cachedUpdates);

        await loadCart();
        // Sync global cart state
        await refreshGlobalCart();
      } else {
        toast.error(response?.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    try {
      setUpdating(true);
      const userId = getUserId();

      if (!userId) {
        toast.error('User not found');
        return;
      }

      const response = await clearCart(userId);

      if (response && (response.success || !response.error)) {
        toast.success('Cart cleared');
        setCart([]);
        clearCachedUpdates();
        // Sync global cart state
        await refreshGlobalCart();
      } else {
        toast.error(response?.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  const syncCartWithBackend = async () => {
    try {
      setSyncing(true);
      const userId = getUserId();

      if (!userId) {
        toast.error('User not found');
        return false;
      }

      const itemsToUpdate = cart.filter(item => item.quantity !== item.originalQuantity);

      if (itemsToUpdate.length === 0) {
        clearCachedUpdates();
        return true;
      }

      console.log('Syncing items:', itemsToUpdate.map(item => ({
        cartItemId: item.cartItemId,
        productId: item.productId,
        originalQuantity: item.originalQuantity,
        newQuantity: item.quantity
      })));

      // Update each item using remove + add approach
      const updatePromises = itemsToUpdate.map(async (item) => {
        console.log(`Updating cart item ${item.cartItemId} to quantity ${item.quantity}`);
        
        // Remove the old cart item
        const removeResult = await removeFromCart(item.cartItemId);
        
        if (!removeResult || removeResult.error) {
          console.error('Failed to remove item during sync');
          return { success: false, error: 'Failed to remove item' };
        }

        // Add the item back with new quantity
        const addResult = await addToCart({
          userId: userId,
          productId: item.productId,
          quantity: item.quantity,
        });

        return addResult;
      });

      const results = await Promise.all(updatePromises);
      
      const allSuccessful = results.every(result => 
        result && (result.success || !result.error)
      );

      if (allSuccessful) {
        // Reload cart from backend to get fresh data
        await loadCart();

        // Update original quantities to match current quantities
        setCart(prevCart =>
          prevCart.map(item => ({
            ...item,
            originalQuantity: item.quantity
          }))
        );

        clearCachedUpdates();
        // Sync global cart state
        await refreshGlobalCart();
        toast.success('Cart updated successfully');
        return true;
      } else {
        toast.error('Some items failed to update');
        await loadCart(); // Reload to get actual state
        await refreshGlobalCart();
        return false;
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      toast.error('Failed to sync cart');
      await loadCart(); // Reload cart on error
      await refreshGlobalCart();
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const handleCheckout = async () => {
    if (hasUnsavedChanges) {
      const synced = await syncCartWithBackend();
      if (!synced) {
        toast.error('Please try again');
        return;
      }
    }
    router.push('/checkout');
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getTotal = () => {
    return getSubtotal();
  };

  if (loading) {
    return (
      <UserGuard>
        <UserLayout>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading cart...</p>
            </div>
          </div>
        </UserLayout>
      </UserGuard>
    );
  }

  return (
    <UserGuard>
      <UserLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/shop')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>

          {cart.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={updating}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Shopping Cart</h1>
        </div>

        {hasUnsavedChanges && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You have unsaved changes. Your cart will be synced when you proceed to checkout.
            </AlertDescription>
          </Alert>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button onClick={() => router.push('/shop')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.cartItemId}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product image */}
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={
                            item.images?.[0]
                              ? `https://gaushalaecommerce.runasp.net${item.images[0]}`
                              : '/placeholder-product.jpg'
                          }
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-2">
                          {/* Product info */}
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{item.productName}</h3>
                            {item.selectedSize && item.selectedSize !== 'No size' && (
                              <p className="text-sm text-muted-foreground">
                                Size: {item.selectedSize}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">₹ {item.price.toFixed(2)}</p>
                          </div>
                          
                          {/* Delete button with total price below it */}
                          <div className="flex flex-col items-end justify-start">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.cartItemId, item.productId)}
                              disabled={updating}
                              className="text-destructive hover:text-destructive mb-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {/* Total price - visible on mobile, hidden on desktop */}
                            <p className="text-lg font-bold text-primary block sm:hidden">
                              ₹ {item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.cartItemId, item.productId, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.cartItemId, item.productId, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Total price - hidden on mobile, visible on desktop */}
                          <p className="text-lg font-bold text-primary hidden sm:block">
                            ₹ {item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">₹{getTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full mb-3"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={updating || syncing || cart.length === 0}
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Syncing Cart...
                      </>
                    ) : updating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Proceed to Checkout'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/shop')}
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
    </UserGuard>
  );
}