"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getUserCart } from "../lib/api/auth";
import { getUserId, isAuthenticated } from "../lib/api/config";
import { CartItem } from "../types";

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  fetchCart: () => Promise<void>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCart: () => void;
  incrementCartCount: (quantity: number) => void;
  decrementCartCount: (quantity: number) => void;
  updateCartCount: (newCount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    if (!isAuthenticated()) {
      setCart([]);
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setCart([]);
      return;
    }

    try {
      const response = await getUserCart(userId);
      const items =
        response?.data?.items ||
        response?.data ||
        response?.items ||
        [];

      setCart(items);
    } catch (error) {
      console.error("Fetch cart failed:", error);
      setCart([]);
    }
  };

  const clearCart = () => setCart([]);

  // Optimistic update: increment cart count without API call
  const incrementCartCount = (quantity: number = 1) => {
    setCart((prevCart) => {
      // Create a dummy item to increment count
      // This is just for count purposes, actual cart will be fetched when needed
      const dummyItem: CartItem = {
        cartItemId: Date.now(), // temporary ID
        productId: 0,
        productName: "",
        description: "",
        productPrice: 0,
        quantity: quantity,
        totalPrice: 0,
        images: [],
        selectedSize: "",
      };
      return [...prevCart, dummyItem];
    });
  };

  // Optimistic update: decrement cart count without API call
  const decrementCartCount = (quantity: number = 1) => {
    setCart((prevCart) => {
      let remaining = quantity;
      const newCart = [...prevCart];

      // Remove items from the end until we've decremented by the required quantity
      while (remaining > 0 && newCart.length > 0) {
        const lastItem = newCart[newCart.length - 1];
        if (lastItem.quantity <= remaining) {
          remaining -= lastItem.quantity;
          newCart.pop();
        } else {
          newCart[newCart.length - 1] = {
            ...lastItem,
            quantity: lastItem.quantity - remaining,
          };
          remaining = 0;
        }
      }

      return newCart;
    });
  };

  // Update cart count to a specific value
  const updateCartCount = (newCount: number) => {
    const currentCount = cart.reduce((total, item) => total + item.quantity, 0);
    const diff = newCount - currentCount;

    if (diff > 0) {
      incrementCartCount(diff);
    } else if (diff < 0) {
      decrementCartCount(Math.abs(diff));
    }
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Fetch cart ONCE when app loads
  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        fetchCart,
        setCart,
        clearCart,
        incrementCartCount,
        decrementCartCount,
        updateCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
