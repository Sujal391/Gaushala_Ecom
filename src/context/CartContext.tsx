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
