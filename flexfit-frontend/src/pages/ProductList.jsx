import { useEffect, useState } from 'react';
import {
    Search, SlidersHorizontal, X, Sparkles, ChevronDown,
    LayoutGrid, LayoutList, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Breadcrumbs from '../components/Breadcrumbs';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Beige'];

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [gridCols, setGridCols] = useState(4);

    // ── Pagination State ──
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const [filters, setFilters] = useState({
        keyword: '', category: '', size: '', color: '',
        minPrice: '', maxPrice: '', sort: 'newest',
    });

    // Fetch products from backend
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
            params.page = page; // Inject the current page number

            const { data } = await api.get('/products', { params });
            setProducts(data.products);
            setTotalPages(data.pages || 1);
            setTotalProducts(data.count || 0);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Whenever filters change, reset back to page 1
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // Fetch with a slight debounce to avoid spamming the API
    useEffect(() => {
        const t = setTimeout(fetchProducts, 400);
        return () => clearTimeout(t);
    }, [filters, page]);

    // Scroll to top smoothly when the page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    const clearFilters = () =>
        setFilters({ keyword: '', category: '', size: '', color: '', minPrice: '', maxPrice: '', sort: 'newest' });

    const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Page Header ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-7">
                    <Breadcrumbs
                        items={[{ label: 'Shop Collection' }]}
                        fallbackTo="/"
                        backLabel="Back to Home"
                        className="py-1 mb-4 border-b border-gray-100/70"
                    />
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">FlexFit Store</p>
                            <h1 className="text-4xl font-black text-gray-900">Shop Collection</h1>
                            <p className="text-gray-500 mt-2">
                                {loading ? 'Loading...' : `${totalProducts} products available`}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    id="shop-search"
                                    value={filters.keyword}
                                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 bg-white focus:border-brand-500 focus:outline-none text-sm font-medium transition-all"
                                    placeholder="Search products..."
                                />
                            </div>

                            {/* Filter toggle */}
                            <button
                                id="shop-filter-btn"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm border-2 transition-all whitespace-nowrap ${
                                    showFilters || activeFilterCount > 0
                                        ? 'bg-brand-600 text-white border-brand-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400'
                                }`}
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="bg-white text-brand-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                                        {activeFilterCount}
                                    </span>
                                )}
                                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Grid toggle */}
                            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                                <button onClick={() => setGridCols(4)} className={`p-2 rounded-lg transition-all ${gridCols === 4 ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}>
                                    <LayoutGrid size={16} className="text-gray-600" />
                                </button>
                                <button onClick={() => setGridCols(3)} className={`p-2 rounded-lg transition-all ${gridCols === 3 ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}>
                                    <LayoutList size={16} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ── Filter Panel ── */}
                {showFilters && (
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-8 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-black text-gray-900">Refine Results</h3>
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters} className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1.5 font-semibold transition-colors">
                                    <X size={14} /> Clear all filters
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { label: 'Category', key: 'category', options: CATEGORIES },
                                { label: 'Size', key: 'size', options: SIZES },
                                { label: 'Color', key: 'color', options: COLORS },
                            ].map(({ label, key, options }) => (
                                <div key={key}>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{label}</label>
                                    <select
                                        value={filters[key]}
                                        onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-brand-500 focus:outline-none text-sm font-medium transition-all appearance-none"
                                    >
                                        <option value="">All</option>
                                        {options.map((o) => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Sort By</label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-brand-500 focus:outline-none text-sm font-medium transition-all appearance-none"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price: Low → High</option>
                                    <option value="price_desc">Price: High → Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Min Price</label>
                                <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                       className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-brand-500 focus:outline-none text-sm font-medium transition-all" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Max Price</label>
                                <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                       className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-brand-500 focus:outline-none text-sm font-medium transition-all" placeholder="50000" />
                            </div>
                        </div>

                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-500 self-center">Quick:</span>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilters({ ...filters, category: filters.category === cat ? '' : cat })}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        filters.category === cat
                                            ? 'bg-brand-600 text-white shadow-md shadow-brand-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Mix & Match Banner ── */}
                <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-brand-200/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                            <Sparkles size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-base">Virtual Mix & Match Studio</h3>
                            <p className="text-xs text-white/80 mt-0.5">Drag garments onto a mannequin, check color harmony, and checkout full outfits instantly.</p>
                        </div>
                    </div>
                    <Link to="/mix-and-match" className="flex-shrink-0 px-5 py-2.5 bg-white text-gray-900 hover:bg-gray-50 rounded-xl text-xs font-black transition-all hover:scale-105 shadow-lg flex items-center gap-1.5">
                        <Sparkles size={13} className="text-brand-600" /> Open Studio
                    </Link>
                </div>

                {/* ── Product Grid ── */}
                {loading ? (
                    <Loader />
                ) : products.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                        <button onClick={clearFilters} className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-brand-200">
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Grid */}
                        <div className={`grid grid-cols-2 gap-5 ${
                            gridCols === 4 ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
                        }`}>
                            {products.map((p) => <ProductCard key={p._id} product={p} />)}
                        </div>

                        {/* ── Pagination Controls ── */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-12 mb-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl font-semibold text-sm hover:border-brand-500 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>

                                <div className="flex gap-1.5">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                                page === i + 1
                                                    ? 'bg-brand-600 text-white shadow-md shadow-brand-200 scale-110'
                                                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 px-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl font-semibold text-sm hover:border-brand-500 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}