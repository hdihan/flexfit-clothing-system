import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Globe, Eye, Sparkles, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';
import QuickViewModal from '../components/QuickViewModal';
import Breadcrumbs from '../components/Breadcrumbs';

export default function PublicWishlist() {
    const { token } = useParams();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/wishlists/shared/${token}`);
                setWishlist(data.wishlist);
            } catch (err) {
                setError(err.response?.data?.message || 'Wishlist unavailable');
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    if (loading) return <Loader />;

    if (error || !wishlist) {
        return (
            <div className="max-w-2xl mx-auto p-12 text-center">
                <Heart size={60} className="text-gray-300 mx-auto" />
                <h1 className="text-2xl font-bold mt-4">Wishlist not available</h1>
                <p className="text-gray-600 mt-2">
                    {error || 'This wishlist may have been made private or deleted.'}
                </p>
                <Link to="/products" className="btn-primary mt-6 inline-block">
                    Browse Products
                </Link>
            </div>
        );
    }

    const itemCount = wishlist.items?.length || 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: 'Shop', to: '/products' },
                    { label: `${wishlist.name} (Shared)` },
                ]}
                fallbackTo="/products"
                backLabel="Explore FlexFit"
            />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-100 to-purple-100 text-brand-700 text-xs font-semibold uppercase tracking-wide mb-4">
                <Sparkles size={13} /> Shared Wishlist
            </div>

            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                    <Heart className="text-brand-600" size={32} /> {wishlist.name}
                </h1>
                <p className="text-gray-600 mt-2">
                    Curated by <span className="font-semibold">{wishlist.user?.name || 'a FlexFit shopper'}</span>
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                    <span className="flex items-center gap-1"><Globe size={14} /> Public</span>
                    <span className="flex items-center gap-1">
                        <Eye size={14} /> {wishlist.views} view{wishlist.views === 1 ? '' : 's'}
                    </span>
                    <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                </div>
                {wishlist.description && (
                    <p className="text-gray-700 mt-4 max-w-2xl">{wishlist.description}</p>
                )}
            </div>

            {itemCount === 0 ? (
                <div className="card p-12 text-center">
                    <ShoppingBag size={48} className="text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">This wishlist is currently empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.items.map((item) => {
                        const p = item.product;
                        if (!p) return null;
                        return (
                            <div
                                key={item._id}
                                className="card group overflow-hidden cursor-pointer"
                                onClick={() => setPreview(p)}
                            >
                                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                                    <img
                                        src={p.images?.[0]}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">{p.category}</p>
                                    <h3 className="font-medium text-gray-900 mt-1 truncate">{p.name}</h3>
                                    <p className="font-bold text-brand-600 mt-2">
                                        LKR {p.price?.toLocaleString()}
                                    </p>
                                    {item.note && (
                                        <p className="text-xs text-gray-500 italic mt-2">"{item.note}"</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {preview && <QuickViewModal product={preview} onClose={() => setPreview(null)} />}
        </div>
    );
}