"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '@/api/cartApi';
import { useAuth } from './AuthContext';

interface CartContextType {
  itemCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({ 
  itemCount: 0, 
  refreshCart: async () => {} 
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user) { 
      setItemCount(0); 
      return; 
    }
    try {
      const res = await cartApi.getCart();
      setItemCount(res.data?.itemCount ?? 0);
    } catch (err) {
      console.error("Cart refresh failed", err);
      setItemCount(0);
    }
  }, [user]);

  useEffect(() => { 
    refreshCart(); 
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
