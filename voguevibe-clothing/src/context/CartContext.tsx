import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, selectedSize?: string, selectedColor?: string) => {
    setCart(prevCart => {
      // Create a unique key for the item based on ID, size, and color
      const cartItemId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`;
      
      const existingItemIndex = prevCart.findIndex(item => 
        item.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
        return newCart;
      }

      return [...prevCart, { 
        ...product, 
        quantity: 1, 
        selectedSize, 
        selectedColor,
        // We use a temporary property to identify items in the cart uniquely if needed, 
        // but for now, the combination of id, size, and color is our logic.
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    // cartItemId here is expected to be the unique combination or we just filter by index/props
    // For simplicity, let's assume we pass the item to remove or its unique identifier
    setCart(prevCart => prevCart.filter(item => {
      const id = `${item.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`;
      return id !== cartItemId;
    }));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => {
        const id = `${item.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`;
        return id === cartItemId ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
