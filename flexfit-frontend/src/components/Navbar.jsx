import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, Store, Sparkles, Heart, X, ChevronRight } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { itemCount, setDrawerOpen } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Detect scroll for glass effect enhancement
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isActive = (path) => location.pathname === path;

    // Get user initials
    const getInitials = (name = '') => name.split(' ').filter(Boolean).map(p => p[0].toUpperCase()).slice(0, 2).join('') || '?';

    const navLink = (to, label, icon) => (
        <Link
            to={to}
            className={`relative text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                isActive(to)
                    ? 'text-brand-600'
                    : 'text-gray-600 hover:text-gray-900'
            }`}
        >
            {icon}
            {label}
            {isActive(to) && (
                <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-purple-500 rounded-full" />
            )}
        </Link>
    );

    return (
        <>
            <nav className={`sticky top-0 z-40 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 backdrop-blur-xl shadow-md shadow-gray-100/80 border-b border-gray-100'
                    : 'bg-white/80 backdrop-blur-md border-b border-gray-200/60'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* ── Logo ── */}
                        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-md shadow-brand-300/40">
                                <span className="text-white font-black text-lg leading-none">F</span>
                            </div>
                            <span className="text-xl font-black text-gray-900 tracking-tight">FlexFit</span>
                        </Link>

                        {/* ── Desktop Nav ── */}
                        <div className="hidden md:flex items-center gap-7">
                            {user?.role === 'vendor' && navLink('/vendor', 'Dashboard', <Store size={15} />)}
                            {user?.role === 'admin' && navLink('/admin', 'Dashboard', null)}
                            {navLink('/products', 'Shop', null)}

                            {/* Mix & Match — special styling */}
                            <Link
                                to="/mix-and-match"
                                className="flex items-center gap-1.5 text-sm font-bold transition-all hover:scale-105"
                            >
                                <Sparkles size={14} className="text-brand-500" />
                                <span className="text-gray-700">Mix & Match</span>
                                <span className="bg-gradient-to-r from-brand-600 to-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-tight shadow-sm">
                                    AI
                                </span>
                            </Link>

                        </div>

                        {/* ── Right Actions ── */}
                        <div className="flex items-center gap-2">
                            {/* Cart button */}
                            <button
                                id="navbar-cart-btn"
                                onClick={() => (user ? setDrawerOpen(true) : navigate('/login'))}
                                className="relative p-2.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                            >
                                <ShoppingBag size={21} />
                                {itemCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-brand-300/50 animate-bounce-once">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </button>

                            {/* User area (desktop) */}
                            {user ? (
                                <div className="hidden md:flex items-center gap-2" ref={profileRef}>
                                    {/* Profile pill button */}
                                    <button
                                        id="navbar-profile-btn"
                                        onClick={() => setProfileOpen(prev => !prev)}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all duration-200 ${
                                            profileOpen
                                                ? 'border-brand-300 bg-brand-50 shadow-sm'
                                                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-brand-300/40">
                                            {getInitials(user.name)}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">{user.name}</span>
                                        <ChevronRight size={14} className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {/* Profile dropdown */}
                                    {profileOpen && (
                                        <div className="absolute top-[62px] right-4 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-50 animate-[fadeSlideDown_0.18s_ease]">
                                            {/* User info */}
                                            <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-purple-50 border-b border-gray-100">
                                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                            </div>
                                            {/* Links */}
                                            <div className="p-2 space-y-0.5">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-all"
                                                >
                                                    <User size={15} className="text-gray-400" />
                                                    My Profile
                                                </Link>
                                                <Link
                                                    to="/orders"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-all"
                                                >
                                                    <ShoppingBag size={15} className="text-gray-400" />
                                                    My Orders
                                                </Link>
                                                <Link
                                                    to="/wishlist"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-all"
                                                >
                                                    <Heart size={15} className="text-gray-400" />
                                                    Wishlist
                                                </Link>
                                            </div>
                                            {/* Sign out */}
                                            <div className="p-2 border-t border-gray-100">
                                                <button
                                                    onClick={() => { setProfileOpen(false); logout(); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <LogOut size={15} />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-purple-700 px-4 py-2.5 rounded-xl transition-all hover:scale-105 shadow-md shadow-brand-200">
                                        Sign up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile hamburger */}
                            <button
                                id="navbar-menu-btn"
                                className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                {menuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Mobile Menu ── */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />

                    {/* Slide-in panel */}
                    <div className="absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col">
                        {/* Panel header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black text-lg">F</span>
                                </div>
                                <span className="font-black text-gray-900 text-lg">FlexFit</span>
                            </div>
                            <button onClick={() => setMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* User info strip */}
                        {user && (
                            <Link
                                to="/profile"
                                onClick={() => setMenuOpen(false)}
                                className="px-5 py-4 bg-gradient-to-r from-brand-50 to-purple-50 border-b border-gray-100 flex items-center justify-between group hover:from-brand-100 hover:to-purple-100 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <User size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm group-hover:text-brand-700">{user.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                        )}

                        {/* Nav links */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-1">
                            {[
                                ...(user?.role === 'vendor' ? [{ to: '/vendor', label: 'Vendor Dashboard', icon: <Store size={18} /> }] : []),
                                ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Dashboard', icon: <Store size={18} /> }] : []),
                                { to: '/products', label: 'Shop Collection', icon: <ShoppingBag size={18} /> },
                                { to: '/mix-and-match', label: 'Mix & Match Studio', icon: <Sparkles size={18} />, highlight: true },
                                ...(user ? [
                                    { to: '/profile', label: 'My Profile', icon: <User size={18} /> },
                                    { to: '/orders', label: 'My Orders', icon: <ChevronRight size={18} /> },
                                    { to: '/wishlist', label: 'Wishlists', icon: <Heart size={18} /> },
                                    { to: '/returns', label: 'Returns', icon: <ChevronRight size={18} /> },
                                    { to: '/cart', label: 'Cart', icon: <ShoppingBag size={18} />, badge: itemCount },
                                ] : []),
                            ].map(({ to, label, icon, highlight, badge }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                                        isActive(to)
                                            ? 'bg-brand-50 text-brand-700'
                                            : highlight
                                                ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:from-brand-500 hover:to-purple-500'
                                                : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className={highlight ? 'text-white' : isActive(to) ? 'text-brand-600' : 'text-gray-400'}>
                                            {icon}
                                        </span>
                                        {label}
                                    </span>
                                    {badge > 0 && (
                                        <span className="bg-brand-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                            {badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Bottom actions */}
                        <div className="p-5 border-t border-gray-100 space-y-3">
                            {user ? (
                                <button
                                    onClick={() => { setMenuOpen(false); logout(); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <LogOut size={18} /> Sign out
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <Link to="/login" className="block w-full text-center px-4 py-3 rounded-2xl text-sm font-bold border-2 border-gray-200 hover:border-brand-400 transition-all">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="block w-full text-center px-4 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-purple-700 transition-all shadow-md shadow-brand-200">
                                        Create account
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}