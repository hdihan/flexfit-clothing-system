import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function BannerCarousel() {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await api.get('/banners');
                setBanners(data.banners || []);
            } catch (err) {
                console.error('Failed to load banners', err);
            }
        };
        fetchBanners();
    }, []);

    // Auto-slide every 6 seconds
    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [banners.length]);

    if (!banners.length) return null;

    const current = banners[currentIndex];

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

    return (
        <div className={`relative overflow-hidden bg-gradient-to-r ${current.bgGradient || 'from-brand-600 to-purple-700'} text-white mx-4 sm:mx-6 lg:mx-8 mt-6 rounded-3xl shadow-xl`}>
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                    <div className="text-5xl md:text-6xl mb-4">{current.emoji}</div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        {current.title}
                    </h2>
                    {current.subtitle && (
                        <p className="text-white/90 text-lg md:text-xl mb-8 max-w-xl mx-auto md:mx-0">
                            {current.subtitle}
                        </p>
                    )}
                    {current.ctaText && current.ctaLink && (
                        <Link
                            to={current.ctaLink}
                            className="inline-block bg-white text-gray-900 font-bold px-8 py-3.5 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg text-sm"
                        >
                            {current.ctaText}
                        </Link>
                    )}
                </div>

                {/* Decorational Elements */}
                <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <div className="text-[200px] leading-none">{current.emoji}</div>
                </div>
            </div>

            {/* Controls (only if more than 1 banner) */}
            {banners.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center backdrop-blur-sm transition-all z-20">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center backdrop-blur-sm transition-all z-20">
                        <ChevronRight size={24} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}