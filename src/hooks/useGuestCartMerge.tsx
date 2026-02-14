import { useEffect, useCallback } from 'react';
import { isAuthenticated, getUserId } from '@/src/lib/api/config';
import { addToCart } from '@/src/lib/api/auth';
import { toast } from 'sonner';

interface GuestCartItem {
  id: string;
  productId: number;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  selectedSize: string;
  addedAt: number;
}

const GUEST_CART_KEY = 'guest_cart';
const MERGE_FLAG_KEY = 'guest_cart_merge_pending';

/**
 * Custom hook to handle guest cart merging after authentication
 * Use this in UserLayout or any component that handles authentication
 */
export function useGuestCartMerge(onMergeComplete?: () => void) {
  const isUserLoggedIn = isAuthenticated();

  const getGuestCart = useCallback((): GuestCartItem[] => {
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return [];
    }
  }, []);

  const clearGuestCart = useCallback(() => {
    localStorage.removeItem(GUEST_CART_KEY);
  }, []);

  const mergeGuestCart = useCallback(async (guestCart: GuestCartItem[]) => {
    const userId = getUserId();
    
    if (!userId) {
      toast.error('Please login again');
      return false;
    }

    try {
      toast.info('Merging your cart items...');

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
        
        // Mark as merged in session storage
        sessionStorage.setItem('guest_cart_merged', 'true');
        
        // Clear the merge pending flag
        localStorage.removeItem(MERGE_FLAG_KEY);
        
        toast.success(`${guestCart.length} item(s) added to your cart!`);
        
        // Call the completion callback if provided
        if (onMergeComplete) {
          onMergeComplete();
        }
        
        return true;
      } else {
        toast.error('Some items failed to merge. Please check your cart.');
        return false;
      }
    } catch (error) {
      console.error('Error merging guest cart:', error);
      toast.error('Failed to merge cart. Please try again.');
      return false;
    }
  }, [clearGuestCart, onMergeComplete]);

  // Check if merge is needed when authentication status changes
  useEffect(() => {
    const checkAndMerge = async () => {
      // Only proceed if user just logged in
      if (!isUserLoggedIn) {
        return;
      }

      // Check if already merged this session
      const hasMerged = sessionStorage.getItem('guest_cart_merged');
      if (hasMerged) {
        return;
      }

      // Get guest cart items
      const guestCart = getGuestCart();
      
      if (guestCart.length === 0) {
        // No items to merge, mark as merged to prevent future checks
        sessionStorage.setItem('guest_cart_merged', 'true');
        return;
      }

      // Perform the merge
      await mergeGuestCart(guestCart);
    };

    checkAndMerge();
  }, [isUserLoggedIn, getGuestCart, mergeGuestCart]);

  return {
    mergeGuestCart,
    getGuestCart,
    clearGuestCart,
  };
}