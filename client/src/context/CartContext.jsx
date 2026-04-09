import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

const getInitialItems = () => {
  try {
    const stored = localStorage.getItem('artisan-cart');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    
    // Handle old Zustand format if it exists: { state: { items: [...] } }
    if (parsed && typeof parsed === 'object' && parsed.state && Array.isArray(parsed.state.items)) {
      return parsed.state.items;
    }
    
    // Handle new plain array format
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    return [];
  } catch (error) {
    console.warn('Failed to parse cart items', error);
    return [];
  }
};

const initialState = {
  items: getInitialItems(),
  isCartOpen: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: !state.isCartOpen };
    case 'OPEN_CART':
      return { ...state, isCartOpen: true };
    case 'CLOSE_CART':
      return { ...state, isCartOpen: false };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persistence
  useEffect(() => {
    localStorage.setItem('artisan-cart', JSON.stringify(state.items));
  }, [state.items]);

  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);

  const addToCart = useCallback((product, quantity = 1) => {
    const existingIndex = state.items.findIndex(
      (item) => item.product._id === product._id
    );

    if (existingIndex > -1) {
      const newItems = [...state.items];
      const maxQty = product.stock > 0 ? Math.min(product.stock, 10) : 10;
      newItems[existingIndex].quantity = Math.min(newItems[existingIndex].quantity + quantity, maxQty);
      dispatch({ type: 'SET_ITEMS', payload: newItems });
    } else {
      dispatch({
        type: 'SET_ITEMS',
        payload: [...state.items, { product, quantity }],
      });
    }
  }, [state.items]);

  const removeFromCart = useCallback((productId) => {
    dispatch({
      type: 'SET_ITEMS',
      payload: state.items.filter((item) => item.product._id !== productId),
    });
  }, [state.items]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    const newItems = state.items.map((item) =>
      item.product._id === productId ? { ...item, quantity } : item
    );
    dispatch({ type: 'SET_ITEMS', payload: newItems });
  }, [state.items, removeFromCart]);

  const incrementQuantity = useCallback((productId) => {
    const item = state.items.find((i) => i.product._id === productId);
    if (item) {
      const maxQty = item.product.stock > 0 ? Math.min(item.product.stock, 10) : 10;
      if (item.quantity < maxQty) {
        updateQuantity(productId, item.quantity + 1);
      }
    }
  }, [state.items, updateQuantity]);

  const decrementQuantity = useCallback((productId) => {
    const item = state.items.find((i) => i.product._id === productId);
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  }, [state.items, updateQuantity]);

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  // Computed Values using useMemo for performance
  const totalItems = useMemo(() => 
    Array.isArray(state.items) ? state.items.reduce((sum, item) => sum + item.quantity, 0) : 0,
  [state.items]);

  const subtotal = useMemo(() => 
    Array.isArray(state.items) ? state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) : 0,
  [state.items]);

  const shipping = useMemo(() => (subtotal > 100 || subtotal === 0 ? 0 : 12.99), [subtotal]);
  
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const value = useMemo(() => ({
    ...state,
    totalItems,
    subtotal,
    shipping,
    total,
    toggleCart,
    openCart,
    closeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
  }), [
    state, totalItems, subtotal, shipping, total, 
    toggleCart, openCart, closeCart, addToCart, removeFromCart, 
    updateQuantity, incrementQuantity, decrementQuantity, clearCart
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
