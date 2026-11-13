import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState({ items: [] });
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (user) fetchCart();
        else setCart({ items: [] });
    }, [user]);

    const fetchCart = async () => {
        try {
            const { data } = await api.get('/cart');
            setCart(data.cart);
        } catch { /* silent */ }
    };

    const addToCart = async (productId, size, color, quantity = 1) => {
        try {
            const { data } = await api.post('/cart/add', { productId, size, color, quantity });
            setCart(data.cart);
            setDrawerOpen(true);
            toast.success('Added to cart');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        }
    };

    const updateItem = async (itemId, quantity) => {
        const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
        setCart(data.cart);
    };

    const removeItem = async (itemId) => {
        const { data } = await api.delete(`/cart/item/${itemId}`);
        setCart(data.cart);
        toast.success('Removed');
    };

    const clearCart = async () => {
        await api.delete('/cart/clear');
        setCart({ items: [] });
    };

    const subtotal = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
    const itemCount = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, addToCart, updateItem, removeItem, clearCart, subtotal, itemCount, isDrawerOpen, setDrawerOpen ,refreshCart: fetchCart, }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);