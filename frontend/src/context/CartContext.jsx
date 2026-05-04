import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext({ itemCount: 0, refreshCart: () => {} });

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user) { setItemCount(0); return; }
    try {
      const res = await cartApi.getCart();
      setItemCount(res.data?.itemCount ?? 0);
    } catch {
      setItemCount(0);
    }
  }, [user]);

  // Refresh whenever the logged-in user changes
  useEffect(() => { refreshCart(); }, [refreshCart]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
