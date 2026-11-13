import { Link } from 'react-router-dom';
import {
    Sparkles, Truck, Shield, ArrowRight, Star,
    Zap, Package, TrendingUp, Users, Heart,
    ShoppingBag, CheckCircle2, ChevronRight,
} from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel'; // 👈 NEW IMPORT

/* ─── Tiny inline keyframe injector (no new CSS files needed) ─── */
const KEYFRAMES = `
@keyframes floatY   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
@keyframes floatY2  { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(4px)}  }
@keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeLeft { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
@keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
@keyframes scaleIn  { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
@keyframes tickerX  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
`;

/* ─── Trending categories data ─── */
const CATEGORIES = [
    { label: 'Tops',        emoji: '👕', color: 'from-rose-400 to-pink-600',     link: '/products?category=Tops' },
    { label: 'Bottoms',     emoji: '👖', color: 'from-blue-400 to-indigo-600',   link: '/products?category=Bottoms' },
    { label: 'Dresses',     emoji: '👗', color: 'from-purple-400 to-fuchsia-600',link: '/products?category=Dresses' },
    { label: 'Outerwear',   emoji: '🧥', color: 'from-amber-400 to-orange-600',  link: '/products?category=Outerwear' },
    { label: 'Footwear',    emoji: '👟', color: 'from-emerald-400 to-teal-600',  link: '/products?category=Footwear' },
    { label: 'Accessories', emoji: '👜', color: 'from-sky-400 to-cyan-600',      link: '/products?category=Accessories' },
];

/* ─── Trust ticker items ─── */
const TICKER = [
    '🚀  Island-wide delivery',
    '✅  Secure PayHere checkout',
    '↩️  Easy 30-day returns',
    '🤖  AI-powered styling',
    '🏪  50+ verified vendors',
    '💎  Premium quality guarantee',
    '🎁  Free shipping over LKR 5,000',
    '⚡  Same-day dispatch available',
];

/* ─── Why FlexFit cards ─── */
const WHY_CARDS = [
    {
        icon: Sparkles,
        title: 'AI Styling Studio',
        desc: 'Drag-and-drop virtual outfit builder with live harmony ratings and AI-powered suggestions.',
        gradient: 'from-brand-500 to-purple-600',
        bg: 'from-brand-50 to-purple-50',
        border: 'border-brand-100',
        shadow: 'shadow-brand-100',
    },
    {
        icon: Truck,
        title: 'Fast Island Delivery',
        desc: 'Multi-vendor fulfilment across Sri Lanka. Free shipping on orders over LKR 5,000.',
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-100',
        shadow: 'shadow-emerald-100',
    },
    {
        icon: Shield,
        title: 'Secure & Guaranteed',
        desc: 'Trusted checkout with PayHere. Easy returns and full fit guarantee on every order.',
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'from-blue-50 to-indigo-50',
        border: 'border-blue-100',
        shadow: 'shadow-blue-100',
    },
];

/* ─── Social proof testimonials ─── */
const TESTIMONIALS = [
    {
        name: 'Nimasha P.',
        role: 'Fashion Enthusiast',
        text: 'The Mix & Match Studio is next level. I found a perfect outfit in minutes that I never would have thought of myself!',
        stars: 5,
        avatar: 'N',
        color: 'from-brand-500 to-purple-600',
    },
    {
        name: 'Kavindu R.',
        role: 'Regular Buyer',
        text: "Best online fashion experience in Sri Lanka. Fast delivery and the AI styling tips are genuinely helpful.",
        stars: 5,
        avatar: 'K',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        name: 'Sithara M.',
        role: 'Style Creator',
        text: 'Love how I can mix vendors and see everything together. The colour harmony score actually works!',
        stars: 5,
        avatar: 'S',
        color: 'from-blue-500 to-indigo-600',
    },
];

export default function Home() {
    return (
        <div className="overflow-x-hidden">
            <style>{KEYFRAMES}</style>

            {/* ══════════════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════════════ */}
            <section className="relative min-h-[92vh] flex items-center bg-gray-950 overflow-hidden">

                {/* Gradient blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-[650px] h-[650px] bg-brand-600/25 rounded-full blur-[130px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[520px] h-[520px] bg-purple-600/20 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: '0.7s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-brand-900/10 rounded-full blur-[160px]" />
                </div>

                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.025]"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* ── Left ── */}
                        <div style={{ animation: 'fadeUp 0.7s ease both' }}>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                                <Sparkles size={13} className="animate-pulse" />
                                AI-Powered Fashion Marketplace
                            </div>

                            {/* Headline */}
                            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight">
                                Fashion that{' '}
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: 'linear-gradient(90deg,#f472b6,#a78bfa,#60a5fa,#f472b6)',
                                        backgroundSize: '200% auto',
                                        animation: 'shimmer 4s linear infinite',
                                    }}
                                >
                                    fits you
                                </span>
                                <br />perfectly.
                            </h1>

                            <p className="text-gray-400 text-lg md:text-xl mt-8 max-w-lg leading-relaxed">
                                AI-powered personal styling, multi-vendor marketplace, and virtual outfit builder — all in one place.
                            </p>

                            {/* CTA buttons */}
                            <div className="flex flex-wrap gap-4 mt-10">
                                <Link
                                    to="/mix-and-match"
                                    className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold px-7 py-4 rounded-2xl shadow-2xl shadow-brand-900/50 transition-all duration-300 hover:scale-105 hover:shadow-brand-600/40 text-base"
                                >
                                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                    Mix &amp; Match Studio
                                </Link>
                                <Link
                                    to="/products"
                                    className="group inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/35 text-white font-bold px-7 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 text-base"
                                >
                                    Shop Collection
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* Quick trust checks */}
                            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-8">
                                {['Free returns', 'Secure checkout', 'Island-wide delivery'].map(t => (
                                    <span key={t} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                        <CheckCircle2 size={13} className="text-emerald-500" />
                                        {t}
                                    </span>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-white/10">
                                {[
                                    { num: '500+', label: 'Products',  icon: Package },
                                    { num: '50+',  label: 'Vendors',   icon: Users   },
                                    { num: '10K+', label: 'Customers', icon: TrendingUp },
                                ].map(({ num, label, icon: Icon }) => (
                                    <div key={label}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Icon size={14} className="text-brand-400" />
                                            <p className="text-3xl font-black text-white">{num}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Right — Studio card ── */}
                        <div
                            className="relative flex justify-center lg:justify-end"
                            style={{ animation: 'fadeLeft 0.75s ease both' }}
                        >
                            <div className="relative w-full max-w-sm">
                                {/* Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/35 to-purple-600/35 rounded-3xl blur-2xl scale-110" />

                                {/* Card */}
                                <div
                                    className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl"
                                    style={{ animation: 'floatY 6s ease-in-out infinite' }}
                                >
                                    {/* Top accent bar */}
                                    <div className="h-0.5 w-full bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 rounded-full mb-5" />

                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <p className="text-white font-bold text-sm">Outfit Studio</p>
                                            <p className="text-gray-500 text-xs mt-0.5">AI-curated look</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                                            <Star size={10} className="fill-emerald-400" /> 97% Match
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { src: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400', alt: 'Denim Jacket' },
                                            { src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', alt: 'Oversized Tee' },
                                            { src: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', alt: 'Slim Chinos' },
                                            { src: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', alt: 'Canvas Sneakers' },
                                        ].map(({ src, alt }) => (
                                            <div key={alt} className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                                                <img src={src} alt={alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/10">
                                        <div>
                                            <p className="text-gray-400 text-xs">4 Pieces · Full Look</p>
                                            <p className="text-white font-black text-lg mt-0.5">LKR 21,400</p>
                                        </div>
                                        <Link
                                            to="/mix-and-match"
                                            className="bg-gradient-to-r from-brand-500 to-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg"
                                        >
                                            Try Now →
                                        </Link>
                                    </div>
                                </div>

                                {/* Floating badge – AI Harmony */}
                                <div
                                    className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-3 border border-gray-100 flex items-center gap-2"
                                    style={{ animation: 'floatY2 5s ease-in-out infinite' }}
                                >
                                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <Zap size={16} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-medium">AI Harmony</p>
                                        <p className="text-xs font-black text-gray-900">Live Score</p>
                                    </div>
                                </div>

                                {/* Floating badge – Delivery */}
                                <div
                                    className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-3 border border-gray-100 flex items-center gap-2"
                                    style={{ animation: 'floatY 7s ease-in-out infinite', animationDelay: '1s' }}
                                >
                                    <div className="w-8 h-8 bg-brand-100 rounded-xl flex items-center justify-center">
                                        <Package size={16} className="text-brand-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-medium">Fast Delivery</p>
                                        <p className="text-xs font-black text-gray-900">Island-wide</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom wave divider */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
                    <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ fill: '#f9fafb' }}>
                        <path d="M0,32 C360,0 1080,56 1440,24 L1440,56 L0,56 Z" />
                    </svg>
                </div>
            </section>

            {/* 👇 PROMOTIONAL BANNER CAROUSEL ADDED HERE 👇 */}
            <BannerCarousel />
            {/* 👆 PROMOTIONAL BANNER CAROUSEL ADDED HERE 👆 */}

            {/* ══════════════════════════════════════════════════════
                TRUST TICKER
            ══════════════════════════════════════════════════════ */}
            <div className="bg-white border-b border-gray-100 py-3 overflow-hidden">
                <div
                    className="flex gap-16 whitespace-nowrap text-sm font-semibold text-gray-500"
                    style={{ animation: 'tickerX 28s linear infinite', width: 'max-content' }}
                >
                    {[...TICKER, ...TICKER].map((item, i) => (
                        <span key={i} className="flex items-center gap-2">{item}</span>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                CATEGORY GRID
            ══════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">Browse by category</p>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900">Shop the collection</h2>
                    </div>
                    <Link
                        to="/products"
                        className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group"
                    >
                        View all
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {CATEGORIES.map(({ label, emoji, color, link }) => (
                        <Link
                            key={label}
                            to={link}
                            className="group relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer"
                        >
                            {/* Gradient background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
                            {/* Subtle pattern overlay */}
                            <div className="absolute inset-0 opacity-10"
                                 style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            {/* Scale-in on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                            <span className="relative text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{emoji}</span>
                            <span className="relative text-white font-black text-sm tracking-wide drop-shadow">{label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                MIX & MATCH FEATURE BANNER
            ══════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 text-white p-8 md:p-12 shadow-2xl border border-purple-500/20">

                    {/* Blobs */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                    {/* Top accent stripe */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 rounded-t-3xl" />

                    <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">

                        {/* Left copy */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-5 border border-brand-500/30">
                                <Sparkles size={12} /> New Feature
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                                Virtual Mix &amp; Match{' '}
                                <span className="bg-gradient-to-r from-brand-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                                    Canvas Studio
                                </span>
                            </h2>
                            <p className="text-gray-300 mt-4 leading-relaxed text-sm">
                                Drag and drop tops, jackets, pants, dresses, footwear, and accessories onto our interactive canvas. Preview colour harmonies and add your complete look to cart in one click!
                            </p>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                {[
                                    { dot: 'bg-brand-400',   text: 'Real-Time Style Harmony Meter' },
                                    { dot: 'bg-purple-400',  text: 'Anatomical Mannequin Snapping' },
                                    { dot: 'bg-pink-400',    text: 'One-Click Outfit Checkout' },
                                    { dot: 'bg-emerald-400', text: 'Download Lookbook Snapshot' },
                                ].map(({ dot, text }) => (
                                    <div key={text} className="flex items-center gap-2 text-xs text-gray-300">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                                        {text}
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/mix-and-match"
                                className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-2xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl text-sm"
                            >
                                <Sparkles size={16} className="text-brand-600" />
                                Try Mix &amp; Match Studio Now
                            </Link>
                        </div>

                        {/* Right — preview card */}
                        <div className="relative flex justify-center">
                            <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
                                <div className="flex items-center justify-between text-xs text-gray-300 pb-3 border-b border-white/10">
                                    <span className="font-bold text-white">Outfit Studio Preview</span>
                                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30">97% Match</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 my-4">
                                    {[
                                        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400',
                                        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                                        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
                                        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400',
                                    ].map((src, i) => (
                                        <div key={i} className="rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-square p-1.5">
                                            <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                                    <span className="text-gray-300">4 Pieces Styled</span>
                                    <span className="font-black text-pink-400">LKR 21,400</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                WHY FLEXFIT
            ══════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="text-center mb-12">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Why choose us</p>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900">Why choose FlexFit?</h2>
                    <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                        Everything you need for a premium fashion shopping experience.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {WHY_CARDS.map(({ icon: Icon, title, desc, gradient, bg, border, shadow }) => (
                        <div
                            key={title}
                            className={`group relative bg-gradient-to-br ${bg} border ${border} rounded-3xl p-8 hover:shadow-2xl ${shadow} hover:-translate-y-2 transition-all duration-300 overflow-hidden`}
                        >
                            {/* Top accent line */}
                            <div className={`absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r ${gradient} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                <Icon size={26} className="text-white" />
                            </div>
                            <h3 className="font-black text-xl text-gray-900 mb-3">{title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>

                            {/* Arrow hint */}
                            <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                                Learn more
                                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                TESTIMONIALS
            ══════════════════════════════════════════════════════ */}
            <section className="bg-gray-50 border-t border-gray-100 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Social proof</p>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900">Loved by shoppers</h2>
                        <p className="text-gray-500 mt-3">Join thousands of satisfied customers across Sri Lanka.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map(({ name, role, text, stars, avatar, color }) => (
                            <div key={name} className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: stars }).map((_, i) => (
                                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                <p className="text-gray-700 text-sm leading-relaxed mb-6">"{text}"</p>

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                                        {avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{name}</p>
                                        <p className="text-xs text-gray-500">{role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                BOTTOM CTA BANNER
            ══════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 text-white p-10 md:p-14 text-center shadow-2xl shadow-brand-200">

                    {/* Decorative circles */}
                    <div className="absolute top-1/2 left-[-5%] w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute top-1/2 right-[-5%] w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
                            <Heart size={12} className="fill-white" />
                            Join 10,000+ happy shoppers
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                            Start building your{' '}
                            <span className="underline decoration-white/40 decoration-4 underline-offset-4">perfect wardrobe</span>
                            <br />today.
                        </h2>
                        <p className="text-white/75 text-lg max-w-lg mx-auto mb-8">
                            Explore hundreds of styles from verified vendors, powered by AI that actually understands your taste.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/products"
                                className="group inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-xl text-sm"
                            >
                                <ShoppingBag size={17} />
                                Shop Now
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/register"
                                className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold px-8 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 text-sm"
                            >
                                Create Free Account
                                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}