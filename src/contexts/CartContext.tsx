import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, SizeKey } from '@/types/product';
import { toast } from 'sonner';

export interface CartItem extends Product {
    quantity: number;
    selectedSize: SizeKey;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, size: SizeKey) => void;
    removeFromCart: (productId: string, size: SizeKey) => void;
    updateQuantity: (productId: string, size: SizeKey, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse cart from local storage:', error);
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, size: SizeKey) => {
        setItems(prev => {
            const existingItem = prev.find(item => item.id === product.id && item.selectedSize === size);
            if (existingItem) {
                toast.success(`Increased quantity of ${product.productName} (${size})`);
                return prev.map(item =>
                    item.id === product.id && item.selectedSize === size
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            toast.success(`Added ${product.productName} (${size}) to cart`);
            return [...prev, { ...product, quantity: 1, selectedSize: size }];
        });
    };

    const removeFromCart = (productId: string, size: SizeKey) => {
        setItems(prev => prev.filter(item => item.id !== productId || item.selectedSize !== size));
        toast.info('Item removed from cart');
    };

    const updateQuantity = (productId: string, size: SizeKey, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId, size);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.id === productId && item.selectedSize === size
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getCartTotal = () => {
        return items.reduce((total, item) => {
            const price = item.price || 0;
            return total + price * item.quantity;
        }, 0);
    };

    const getItemCount = () => {
        return items.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
