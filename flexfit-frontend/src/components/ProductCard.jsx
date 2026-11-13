import { useState, useEffect, useRef } from 'react';
import { Eye, Star, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuickViewModal from './QuickViewModal';
import AddToWishlistModal from './AddToWishlistModal';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
    const [open, setOpen] = useState(false);
    const [showWishlist, setShowWishlist] = useState(false);
    const [hoverIndex, setHoverIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef(null);

    const { isProductSaved } = useWishlist();
    const saved = isProductSaved(product._id);

    const images = product.images?.length
        ? product.images
        : ['https://via.placeholder.com/400x533?text=No+Image'];
    const hasMultiple = images.length > 1;

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (!hasMultiple) return;
        intervalRef.current = setInterval(() => {
            setHoverIndex((i) => (i + 1) % images.length);
        }, 900);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setHoverIndex(0);
    };

    useEffect(() => () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    const isOutOfStock = product.totalStock === 0;

    return (
        <>
            <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300 hover:-translate-y-1">

                {/* Image container */}
                <div
                    className="relative aspect-[3/4] bg-gray-50 overflow-hidden"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <img
                        src={images[hoverIndex]}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
                    />

                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                    {/* Image dots */}
                    {hasMultiple && (
                        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                            {images.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`rounded-full transition-all duration-300 ${
                                        hoverIndex === idx ? 'bg-white w-4 h-1.5' : 'bg-white/50 w-1.5 h-1.5'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Wishlist heart */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowWishlist(true);
                        }}
                        title={saved ? 'Saved to a wishlist' : 'Save to wishlist'}
                        className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                            saved
                                ? 'bg-brand-600 scale-110'
                                : 'bg-white/95 hover:bg-white hover:scale-110'
                        }`}
                    >
                        <Heart
                            size={15}
                            className={saved ? 'fill-white text-white' : 'text-gray-600'}
                        />
                    </button>

                    {/* Status badges */}
                    {isOutOfStock && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 tracking-wide">
                            OUT OF STOCK
                        </span>
                    )}
                    {!isOutOfStock && product.isNew && (
                        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 tracking-wide">
                            NEW
                        </span>
                    )}

                    {/* Action buttons overlay */}
                    <div className={`absolute inset-x-3 bottom-3 flex flex-col gap-1.5 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <Link
                            to={`/mix-and-match?item=${product._id}`}
                            className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
                        >
                            <Sparkles size={13} /> Style in Mix & Match
                        </Link>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpen(true);
                            }}
                            className="bg-white/95 hover:bg-white text-gray-900 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all backdrop-blur-sm"
                        >
                            <Eye size={13} /> Quick View
                        </button>
                    </div>
                </div>

                {/* Info section */}
                <div className="p-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                        {product.category}
                    </p>
                    <h3 className="font-bold text-gray-900 truncate text-sm leading-snug">
                        {product.name}
                    </h3>

                    {/* Color swatches */}
                    {product.colors?.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                            {product.colors.slice(0, 5).map((color) => (
                                <span
                                    key={color}
                                    title={color}
                                    className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0"
                                    style={{ backgroundColor: color.toLowerCase() }}
                                />
                            ))}
                            {product.colors.length > 5 && (
                                <span className="text-[10px] text-gray-400 font-medium">+{product.colors.length - 5}</span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                        <p className="font-black text-gray-900 text-base">
                            LKR {product.price?.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-amber-700">
                                {product.ratings?.toFixed(1) || '0.0'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {open && <QuickViewModal product={product} onClose={() => setOpen(false)} />}
            {showWishlist && (
                <AddToWishlistModal
                    product={product}
                    onClose={() => setShowWishlist(false)}
                />
            )}
        </>
    );
}