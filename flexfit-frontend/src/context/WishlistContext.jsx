import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlists = useCallback(async () => {
        if (!user) { setWishlists([]); return; }
        setLoading(true);
        try {
            const { data } = await api.get('/wishlists');
            setWishlists(data.wishlists);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchWishlists(); }, [fetchWishlists]);

    const createWishlist = async (payload) => {
        const { data } = await api.post('/wishlists', payload);
        setWishlists((prev) => [data.wishlist, ...prev]);
        toast.success('Wishlist created');
        return data.wishlist;
    };

    const updateWishlist = async (id, payload) => {
        const { data } = await api.put(`/wishlists/${id}`, payload);
        setWishlists((prev) => prev.map((w) => (w._id === id ? data.wishlist : w)));
        return data.wishlist;
    };

    const deleteWishlist = async (id) => {
        await api.delete(`/wishlists/${id}`);
        setWishlists((prev) => prev.filter((w) => w._id !== id));
        toast.success('Wishlist deleted');
    };

    const addItem = async (wishlistId, productId, note = '') => {
        const { data } = await api.post(`/wishlists/${wishlistId}/items`, { productId, note });
        setWishlists((prev) => prev.map((w) => (w._id === wishlistId ? data.wishlist : w)));
        toast.success('Saved to wishlist');
        return data.wishlist;
    };

    const removeItem = async (wishlistId, productId) => {
        const { data } = await api.delete(`/wishlists/${wishlistId}/items/${productId}`);
        setWishlists((prev) => prev.map((w) => (w._id === wishlistId ? data.wishlist : w)));
        toast.success('Removed');
    };

    const toggleShare = async (id) => {
        const { data } = await api.patch(`/wishlists/${id}/share`);
        setWishlists((prev) => prev.map((w) => (w._id === id ? data.wishlist : w)));
        return data.wishlist;
    };

    const isProductSaved = (productId) =>
        wishlists.some((w) =>
            w.items?.some(
                (i) => (i.product?._id || i.product)?.toString() === productId?.toString()
            )
        );

    return (
        <WishlistContext.Provider
            value={{
                wishlists, loading, fetchWishlists, createWishlist, updateWishlist,
                deleteWishlist, addItem, removeItem, toggleShare, isProductSaved,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);