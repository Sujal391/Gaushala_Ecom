"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UserLayout from '../../components/layout/UserLayout';
import { 
  getUserCart, 
  removeFromCart, 
  clearCart, 
  addToCart 
} from '../../lib/api/auth';
import { isAuthenticated, getUserId } from '../../lib/api/config';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import type { CartItem } from '../../types/index';
import { Suspense } from 'react';

// Cache keys for localStorage
const GUEST_CART_KEY = 'guest_cart';
const CART_CACHE_KEY = 'cart_updates_cache';

interface CartUpdate {
  productId: number;
  quantity: number;
}

interface GuestCartItem {
  productId: number;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  selectedSize: string;
  addedAt: number;
  // No id field for guest cart
}

interface CartItemApi {
  cartItemId: number;
  productId: number;
  productName: string;
  description: string;
  productPrice: number;
  discountedPrice: number;
  quantity: number;
  totalPrice: number;
  totalDiscountedPrice: number;
  sizes: string;
  selectedSize: string;
  images: string[];
  availableSizes?: string[];
  sizePrices?: Record<string, number>;
  sizeDiscountedPrices?: Record<string, number>;
}

interface ExtendedCartItem extends CartItem {
  originalQuantity: number;
  cartItemId?: number; // Only for authenticated users
  discountedPrice?: number;
  totalDiscountedPrice?: number;
  // For guest cart display only - not stored in localStorage
  tempId?: string;
}

export default function CartPage() {
  const router = useRouter();
  const { fetchCart: refreshGlobalCart } = useCart();
  const [cart, setCart] = useState<ExtendedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const isUserLoggedIn = isAuthenticated();

  // Guest cart functions
  const getGuestCart = (): GuestCartItem[] => {
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      if (!cart) return [];
      
      const parsedCart = JSON.parse(cart);
      
      // Handle legacy cart formats
      if (Array.isArray(parsedCart)) {
        // Check if it's the old format with id field
        if (parsedCart.length > 0 && 'id' in parsedCart[0]) {
          // Migrate old format to new format
          const migratedCart = parsedCart.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description || '',
            price: item.price,
            quantity: item.quantity,
            images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
            selectedSize: item.selectedSize || 'Default',
            addedAt: typeof item.addedAt === 'string' ? Date.now() : (item.addedAt || Date.now())
          }));
          
          // Save migrated cart
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(migratedCart));
          return migratedCart;
        }
        
        // Check if it's the format with single image string instead of array
        if (parsedCart.length > 0 && 'image' in parsedCart[0]) {
          const migratedCart = parsedCart.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description || '',
            price: item.price,
            quantity: item.quantity,
            images: item.image ? [item.image] : [],
            selectedSize: item.selectedSize || 'Default',
            addedAt: item.addedAt || Date.now()
          }));
          
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(migratedCart));
          return migratedCart;
        }
        
        // Already in correct format
        return parsedCart;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return [];
    }
  };

  const saveGuestCart = (items: GuestCartItem[]) => {
    try {
      // Remove any temporary IDs before saving
      const cleanItems = items.map(({ ...rest }) => rest);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cleanItems));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const addToGuestCart = (item: Omit<GuestCartItem, 'addedAt'>) => {
    const guestCart = getGuestCart();
    const existingItem = guestCart.find(
      i => i.productId === item.productId && i.selectedSize === item.selectedSize
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.addedAt = Date.now();
    } else {
      guestCart.push({
        ...item,
        addedAt: Date.now()
      });
    }

    saveGuestCart(guestCart);
    return guestCart;
  };

  const removeFromGuestCart = (productId: number, selectedSize: string) => {
    const guestCart = getGuestCart();
    const updatedCart = guestCart.filter(
      item => !(item.productId === productId && item.selectedSize === selectedSize)
    );
    saveGuestCart(updatedCart);
    return updatedCart;
  };

  const updateGuestCartQuantity = (productId: number, selectedSize: string, quantity: number) => {
    const guestCart = getGuestCart();
    const item = guestCart.find(
      i => i.productId === productId && i.selectedSize === selectedSize
    );
    
    if (item) {
      item.quantity = quantity;
      item.addedAt = Date.now();
      saveGuestCart(guestCart);
    }
    
    return guestCart;
  };

  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
  };

  // Load cart based on authentication status
  useEffect(() => {
    loadCart();
  }, [isUserLoggedIn]);

  // Auto merge guest cart after login
  useEffect(() => {
    const mergeGuestCartAfterLogin = async () => {
      const hasMerged = sessionStorage.getItem('guest_cart_merged');
      
      if (isUserLoggedIn && !hasMerged) {
        const guestCart = getGuestCart();
        
        if (guestCart.length > 0) {
          await mergeGuestCart(guestCart);
        }
      }
    };

    mergeGuestCartAfterLogin();
  }, [isUserLoggedIn]);

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

      if (isUserLoggedIn) {
        await loadAuthCart();
      } else {
        await loadGuestCart();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAuthCart = async () => {
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
        discountedPrice: item.discountedPrice,
        totalDiscountedPrice: item.totalDiscountedPrice,
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
            totalPrice: item.price * newQuantity,
            totalDiscountedPrice: item.discountedPrice ? item.discountedPrice * newQuantity : undefined
          };
        }
        return item;
      });
      setHasUnsavedChanges(hasChanges);
    }

    setCart(mappedCart);
  };

  const loadGuestCart = async () => {
    const guestCartItems = getGuestCart();
    
    // Create temporary IDs for rendering only
    const mappedCart: ExtendedCartItem[] = guestCartItems.map((item: GuestCartItem, index) => ({
      tempId: `guest_${item.productId}_${item.selectedSize}_${index}`,
      productId: item.productId,
      productName: item.productName,
      description: item.description || '',
      price: item.price,
      quantity: item.quantity,
      originalQuantity: item.quantity,
      totalPrice: item.price * item.quantity,
      images: item.images || [],
      selectedSize: item.selectedSize || 'Default'
    }));

    setCart(mappedCart);
    setHasUnsavedChanges(false);
  };

  const mergeGuestCart = async (guestCart: GuestCartItem[]) => {
    setIsMerging(true);
    
    try {
      const userId = getUserId();
      
      if (!userId) {
        toast.error('Please login again');
        return;
      }

      toast.info('Merging your guest cart...');

      // Add all guest cart items to authenticated cart
      const mergePromises = guestCart.map(item => 
        addToCart({
          userId: userId,
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize
        })
      );

      const results = await Promise.all(mergePromises);
      
      const allSuccessful = results.every(result => 
        result && (result.success || !result.error)
      );

      if (allSuccessful) {
        // Clear guest cart after successful merge
        clearGuestCart();
        
        // Mark as merged in session storage to prevent duplicate merges
        sessionStorage.setItem('guest_cart_merged', 'true');
        
        // Reload cart with merged items
        await loadAuthCart();
        await refreshGlobalCart();
        
        toast.success('Guest cart merged successfully!');
      } else {
        toast.error('Some items failed to merge');
      }
    } catch (error) {
      console.error('Error merging guest cart:', error);
      toast.error('Failed to merge guest cart. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  const updateQuantity = (item: ExtendedCartItem, change: number) => {
    if (isUserLoggedIn) {
      updateAuthQuantity(item, change);
    } else {
      updateGuestQuantity(item, change);
    }
  };

  const updateAuthQuantity = (item: ExtendedCartItem, change: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(cartItem => {
        if (cartItem.cartItemId === item.cartItemId) {
          const newQuantity = cartItem.quantity + change;
          if (newQuantity < 1) return cartItem;
          
          return {
            ...cartItem,
            quantity: newQuantity,
            totalPrice: cartItem.price * newQuantity,
            totalDiscountedPrice: cartItem.discountedPrice ? cartItem.discountedPrice * newQuantity : undefined
          };
        }
        return cartItem;
      });

      const cachedUpdates = loadCachedUpdates();
      const updatedItem = updatedCart.find(cartItem => cartItem.productId === item.productId);
      
      if (updatedItem) {
        cachedUpdates.set(item.productId, updatedItem.quantity);
        saveCachedUpdates(cachedUpdates);
        
        const hasChanges = updatedCart.some(cartItem => cartItem.quantity !== cartItem.originalQuantity);
        setHasUnsavedChanges(hasChanges);
      }

      return updatedCart;
    });
  };

  const updateGuestQuantity = (item: ExtendedCartItem, change: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(cartItem => {
        if (cartItem.productId === item.productId && cartItem.selectedSize === item.selectedSize) {
          const newQuantity = cartItem.quantity + change;
          if (newQuantity < 1) return cartItem;
          
          return {
            ...cartItem,
            quantity: newQuantity,
            totalPrice: cartItem.price * newQuantity
          };
        }
        return cartItem;
      });

      // Update localStorage
      const updatedItem = updatedCart.find(
        cartItem => cartItem.productId === item.productId && cartItem.selectedSize === item.selectedSize
      );
      
      if (updatedItem) {
        updateGuestCartQuantity(item.productId, item.selectedSize, updatedItem.quantity);
      }

      return updatedCart;
    });
  };

  const removeItem = async (item: ExtendedCartItem) => {
    try {
      setUpdating(true);

      if (isUserLoggedIn) {
        if (!item.cartItemId) return;
        
        const response = await removeFromCart(item.cartItemId);

        if (response && (response.success || !response.error)) {
          toast.success('Item removed from cart');

          const cachedUpdates = loadCachedUpdates();
          cachedUpdates.delete(item.productId);
          saveCachedUpdates(cachedUpdates);

          await loadCart();
          await refreshGlobalCart();
        } else {
          toast.error(response?.message || 'Failed to remove item');
        }
      } else {
        // Guest cart removal - use productId and selectedSize
        removeFromGuestCart(item.productId, item.selectedSize);
        await loadGuestCart();
        await refreshGlobalCart();
        toast.success('Item removed from cart');
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

      if (isUserLoggedIn) {
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
          await refreshGlobalCart();
        } else {
          toast.error(response?.message || 'Failed to clear cart');
        }
      } else {
        // Guest cart clear
        clearGuestCart();
        setCart([]);
        await refreshGlobalCart();
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  const syncCartWithBackend = async () => {
    if (!isUserLoggedIn) return true;

    try {
      setSyncing(true);
      const userId = getUserId();

      if (!userId) {
        toast.error('User not found');
        return false;
      }

      const itemsToUpdate = cart.filter(item => 
        item.cartItemId && item.quantity !== item.originalQuantity
      );

      if (itemsToUpdate.length === 0) {
        clearCachedUpdates();
        return true;
      }

      const updatePromises = itemsToUpdate.map(async (item) => {
        const removeResult = await removeFromCart(item.cartItemId!);
        
        if (!removeResult || removeResult.error) {
          return { success: false, error: 'Failed to remove item' };
        }

        const addResult = await addToCart({
          userId: userId,
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize
        });

        return addResult;
      });

      const results = await Promise.all(updatePromises);
      
      const allSuccessful = results.every(result => 
        result && (result.success || !result.error)
      );

      if (allSuccessful) {
        await loadCart();
        setCart(prevCart =>
          prevCart.map(item => ({
            ...item,
            originalQuantity: item.quantity
          }))
        );

        clearCachedUpdates();
        await refreshGlobalCart();
        toast.success('Cart updated successfully');
        return true;
      } else {
        toast.error('Some items failed to update');
        await loadCart();
        await refreshGlobalCart();
        return false;
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      toast.error('Failed to sync cart');
      await loadCart();
      await refreshGlobalCart();
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const handleCheckout = async () => {
    if (!isUserLoggedIn) {
      toast.error('Please login to proceed to checkout', {
        action: {
          label: 'Login',
          onClick: () => router.push('/login?redirect=checkout')
        },
        duration: 5000
      });
      return;
    }

    if (hasUnsavedChanges) {
      const synced = await syncCartWithBackend();
      if (!synced) {
        toast.error('Please try again');
        return;
      }
    }
    
    router.push('/checkout');
  };

  const handleLoginRedirect = () => {
    router.push('/login?redirect=cart');
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.totalDiscountedPrice || item.totalPrice;
      return total + itemTotal;
    }, 0);
  };

  const getTotal = () => {
    return getSubtotal();
  };

  if (loading || isMerging) {
    return (
      <UserLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              {isMerging ? 'Merging your cart...' : 'Loading cart...'}
            </p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      }>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guest login banner */}
        {!isUserLoggedIn && cart.length > 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <LogIn className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 flex items-center justify-between w-full">
              <span>You're shopping as a guest. Login to save your cart and proceed to checkout.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLoginRedirect}
                className="ml-4 bg-white flex-shrink-0"
              >
                Login
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
          <h1 className="text-3xl sm:text-4xl font-bold">
            {isUserLoggedIn ? 'Shopping Cart' : 'Guest Cart'}
          </h1>
          {!isUserLoggedIn && cart.length > 0 && (
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Guest Mode
            </span>
          )}
        </div>

        {isUserLoggedIn && hasUnsavedChanges && (
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
              {isUserLoggedIn 
                ? 'Add some products to get started'
                : 'Add some products to your guest cart'}
            </p>
            <Button onClick={() => router.push('/shop')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.cartItemId || item.tempId || `${item.productId}_${item.selectedSize}`}>
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
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{item.productName}</h3>
                            {item.selectedSize && item.selectedSize !== 'No size' && (
                              <p className="text-sm text-muted-foreground">
                                Size: {item.selectedSize}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-1">
                              {item.discountedPrice && item.discountedPrice < item.price ? (
                                <>
                                  <span className="text-sm line-through text-muted-foreground">
                                    ₹{item.price.toFixed(2)}
                                  </span>
                                  <span className="text-lg font-bold text-primary">
                                    ₹{item.discountedPrice.toFixed(2)}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    Save ₹{(item.price - item.discountedPrice).toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-primary">
                                  ₹{item.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end justify-start">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item)}
                              disabled={updating}
                              className="text-destructive hover:text-destructive mb-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <p className="text-lg font-bold text-primary block sm:hidden">
                              {item.totalDiscountedPrice && item.totalDiscountedPrice < item.totalPrice ? (
                                <>
                                  <span className="text-sm line-through text-muted-foreground mr-1">
                                    ₹{item.totalPrice.toFixed(2)}
                                  </span>
                                  <span>₹{item.totalDiscountedPrice.toFixed(2)}</span>
                                </>
                              ) : (
                                `₹${item.totalPrice.toFixed(2)}`
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-lg font-bold text-primary hidden sm:block">
                            {item.totalDiscountedPrice && item.totalDiscountedPrice < item.totalPrice ? (
                              <>
                                <span className="text-sm line-through text-muted-foreground mr-2">
                                  ₹{item.totalPrice.toFixed(2)}
                                </span>
                                <span>₹{item.totalDiscountedPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              `₹${item.totalPrice.toFixed(2)}`
                            )}
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
                  
                  {!isUserLoggedIn ? (
                    <>
                      <Button
                        className="w-full mb-3"
                        size="lg"
                        onClick={handleLoginRedirect}
                        disabled={cart.length === 0}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Login to Checkout
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mb-3">
                        Please login to complete your purchase
                      </p>
                    </>
                  ) : (
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
                  )}
                  
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
      </Suspense>
    </UserLayout>
  );
}