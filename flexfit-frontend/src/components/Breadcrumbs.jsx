import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';

/**
 * Commercial-grade breadcrumb and back button navigation
 * 
 * @param {Array} items - Array of { label: string, to?: string }
 * @param {string} fallbackTo - Fallback URL if back navigation has no prior entry (defaults to '/')
 * @param {string} backLabel - Text for the back button (defaults to 'Back')
 * @param {string} className - Additional CSS classes
 */
export default function Breadcrumbs({
    items = [],
    fallbackTo = '/',
    backLabel = 'Back',
    className = '',
}) {
    const navigate = useNavigate();

    const handleBack = () => {
        // If there is history within this site session, navigate back
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallbackTo);
        }
    };

    return (
        <nav
            aria-label="Breadcrumb navigation"
            className={`flex flex-wrap items-center justify-between gap-3 py-3 mb-6 border-b border-gray-100/80 text-xs sm:text-sm ${className}`}
        >
            {/* ── Left: Breadcrumb Trail ── */}
            <ol className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-gray-500 min-w-0">
                <li className="flex items-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 font-semibold transition-all hover:opacity-80"
                        title="Home"
                    >
                        <Home size={15} />
                        <span>Home</span>
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                            {isLast || !item.to ? (
                                <span
                                    className="font-bold truncate max-w-[200px] sm:max-w-[320px]"
                                    aria-current="page"
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.to}
                                    className="font-medium text-gray-600 hover:text-brand-600 hover:underline transition-colors truncate max-w-[150px] sm:max-w-[220px]"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>

            {/* ── Right: Commercial-Grade Back Button ── */}
            <button
                type="button"
                onClick={handleBack}
                className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-gray-800 bg-white hover:bg-brand-50 border border-gray-300 hover:border-brand-300 shadow-xs hover:text-brand-700 hover:shadow-sm transition-all select-none flex-shrink-0"
                title="Go to previous page"
            >
                <ArrowLeft
                    size={15}
                    className="text-brand-600 group-hover:-translate-x-1 transition-transform"
                />
                <span>{backLabel}</span>
            </button>
        </nav>
    );
}
