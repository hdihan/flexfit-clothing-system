import { useState } from 'react';
import { X, ShoppingBag, Loader2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import SizeAdvisor from './SizeAdvisor';
import ProductReviews from './ProductReviews';
import AddToWishlistModal from './AddToWishlistModal';
import { getColorHex } from './ColorPicker';

export default function QuickViewModal({ product, onClose }) {
    const [size, setSize] = useState('');
    const [color, setColor] = useState(product.colors?.[0] || '');
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showWishlist, setShowWishlist] = useState(false);

    // Gallery state
    const images = product.images?.length
        ? product.images
        : ['https://via.placeholder.com/600?text=No+Image'];
    const [activeImage, setActiveImage] = useState(0);

    const { addToCart } = useCart();
    const { user } = useAuth();
    const { isProductSaved } = useWishlist();
    const navigate = useNavigate();

    const saved = isProductSaved(product._id);
    const selectedSize = product.sizes?.find((s) => s.size === size);
    const maxStock = selectedSize?.stock || 0;
    const hasMultiple = images.length > 1;

    const goPrev = () =>
        setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
    const goNext = () =>
        setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

    const handleAdd = async () => {
        if (!user) return navigate('/login');
        if (!size) return alert('Please select a size');
        setLoading(true);
        await addToCart(product._id, size, color, qty);
        setLoading(false);
        onClose();
    };

    // Colors we consider "light" so the checkmark/ring is visible on white
    const LIGHT_COLORS = ['white', 'cream', 'beige', 'blush pink', 'mint', 'sky blue'];

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="grid md:grid-cols-2">
                        {/* ── IMAGE GALLERY (left column) ───────────── */}
                        <div className="bg-gray-100 p-4 md:rounded-l-2xl flex flex-col gap-3">
                            {/* Main image with arrows */}
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-white">
                                <img
                                    src={images[activeImage]}
                                    alt={`${product.name} – view ${activeImage + 1}`}
                                    className="w-full h-full object-cover transition-opacity duration-200"
                                />

                                {hasMultiple && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={goPrev}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition"
                                            title="Previous image"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goNext}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition"
                                            title="Next image"
                                        >
                                            <ChevronRight size={18} />
                                        </button>

                                        <div className="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full">
                                            {activeImage + 1} / {images.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail strip */}
                            {hasMultiple && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {images.map((src, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveImage(idx)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                                                activeImage === idx
                                                    ? 'border-brand-600 ring-2 ring-brand-200'
                                                    : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            <img
                                                src={src}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── DETAILS (right column) ────────────────── */}
                        <div className="p-8 relative">
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={20} />
                            </button>

                            {/* Wishlist heart */}
                            <button
                                type="button"
                                onClick={() => setShowWishlist(true)}
                                title={saved ? 'Saved to a wishlist' : 'Save to wishlist'}
                                className="absolute top-4 right-16 p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <Heart
                                    size={20}
                                    className={
                                        saved ? 'fill-brand-600 text-brand-600' : 'text-gray-500'
                                    }
                                />
                            </button>

                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                {product.category}
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-1">
                                {product.name}
                            </h2>
                            <p className="text-2xl font-bold text-brand-600 mt-3">
                                LKR {product.price?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 mt-4 line-clamp-3">
                                {product.description}
                            </p>

                            {/* ── Size ────────────────────────────────── */}
                            <div className="mt-6">
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    Size
                                </label>
                                <SizeAdvisor
                                    onRecommend={(recSize) => {
                                        const sizeExists = product.sizes?.some(
                                            (s) => s.size === recSize && s.stock > 0
                                        );
                                        if (sizeExists) {
                                            setSize(recSize);
                                            setQty(1);
                                        }
                                    }}
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {product.sizes?.map((s) => (
                                        <button
                                            key={s.size}
                                            disabled={s.stock === 0}
                                            onClick={() => {
                                                setSize(s.size);
                                                setQty(1);
                                            }}
                                            className={`w-12 h-12 rounded-lg border-2 font-medium text-sm transition ${
                                                size === s.size
                                                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                                                    : s.stock === 0
                                                        ? 'border-gray-100 text-gray-300 line-through cursor-not-allowed'
                                                        : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            {s.size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Colors (visual swatches) ────────────── */}
                            {product.colors?.length > 0 && (
                                <div className="mt-5">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Color{' '}
                                        {color && (
                                            <span className="text-gray-400 font-normal">
                                                — {color}
                                            </span>
                                        )}
                                    </label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.colors.map((c) => {
                                            const hex = getColorHex(c);
                                            const isSelected = color === c;
                                            const isLight = LIGHT_COLORS.includes(
                                                c.toLowerCase()
                                            );
                                            return (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setColor(c)}
                                                    title={c}
                                                    aria-label={c}
                                                    style={{ backgroundColor: hex }}
                                                    className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 relative ${
                                                        isSelected
                                                            ? 'border-brand-600 ring-2 ring-brand-300 scale-110'
                                                            : 'border-gray-300'
                                                    } ${isLight ? 'shadow-inner' : ''}`}
                                                >
                                                    {isSelected && (
                                                        <span className="absolute inset-0 flex items-center justify-center">
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${
                                                                    isLight
                                                                        ? 'bg-gray-700'
                                                                        : 'bg-white'
                                                                }`}
                                                            />
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── Quantity ────────────────────────────── */}
                            <div className="mt-5">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        className="w-9 h-9 border rounded-lg hover:bg-gray-50"
                                    >
                                        −
                                    </button>
                                    <span className="w-10 text-center font-medium">{qty}</span>
                                    <button
                                        onClick={() => setQty(Math.min(maxStock || 1, qty + 1))}
                                        className="w-9 h-9 border rounded-lg hover:bg-gray-50"
                                    >
                                        +
                                    </button>
                                    {selectedSize && (
                                        <span className="text-xs text-gray-500 ml-2">
                                            {maxStock} in stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ── Add to Cart ─────────────────────────── */}
                            <button
                                onClick={handleAdd}
                                disabled={loading || !size}
                                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <ShoppingBag size={18} />
                                )}
                                Add to Cart
                            </button>

                            {/* ── Save to Wishlist ────────────────────── */}
                            <button
                                type="button"
                                onClick={() => setShowWishlist(true)}
                                className="w-full mt-3 py-2.5 rounded-lg border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-medium text-sm flex items-center justify-center gap-2 transition"
                            >
                                <Heart
                                    size={16}
                                    className={saved ? 'fill-brand-600 text-brand-600' : ''}
                                />
                                {saved ? 'Saved — Manage Wishlists' : 'Save to Wishlist'}
                            </button>

                            <ProductReviews
                                productId={product._id}
                                initialReviews={product.reviews || []}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showWishlist && (
                <AddToWishlistModal
                    product={product}
                    onClose={() => setShowWishlist(false)}
                />
            )}
        </>
    );
}