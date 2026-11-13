import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

// ── Inline brand social icons (no trademark issues) ──────────────
const FacebookIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const InstagramIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

const TwitterIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

// ── Footer link column helper ─────────────────────────────────────
function FooterColumn({ title, children }) {
    return (
        <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                {title}
            </h3>
            <ul className="space-y-2.5">{children}</ul>
        </div>
    );
}

function FooterLink({ to, children, external }) {
    const cls =
        'text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group';

    if (external) {
        return (
            <li>
                <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
                    {children}
                </a>
            </li>
        );
    }
    return (
        <li>
            <Link to={to} className={cls}>
                {children}
            </Link>
        </li>
    );
}

// ── Main Footer ───────────────────────────────────────────────────
export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            {/* Top gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-purple-500 to-brand-600" />

            {/* Main footer body */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* ── Brand column ─────────────────────────── */}
                    <div className="lg:col-span-1">
                        {/* Logo */}
                        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-lg shadow-brand-900/30">
                                <span className="text-white font-bold text-lg">F</span>
                            </div>
                            <span className="text-xl font-bold text-white">FlexFit</span>
                        </Link>

                        <p className="text-gray-400 text-sm leading-relaxed mb-5">
                            Redefining fashion with smart fit technology. Discover clothes that
                            truly feel like you — every stitch, every style.
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-3">
                            {[
                                { Icon: FacebookIcon, label: 'Facebook', href: '#' },
                                { Icon: InstagramIcon, label: 'Instagram', href: '#' },
                                { Icon: TwitterIcon, label: 'Twitter / X', href: '#' },
                                { Icon: LinkedinIcon, label: 'LinkedIn', href: '#' },
                            ].map(({ Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Shop column ──────────────────────────── */}
                    <FooterColumn title="Shop">
                        <FooterLink to="/products">All Products</FooterLink>
                        <FooterLink to="/mix-and-match">
                            <Sparkles size={13} className="text-brand-400" />
                            Mix &amp; Match Studio
                        </FooterLink>
                        <FooterLink to="/cart">Cart</FooterLink>
                        <FooterLink to="/checkout">Checkout</FooterLink>
                        <FooterLink to="/orders">My Orders</FooterLink>
                    </FooterColumn>

                    {/* ── Company column ───────────────────────── */}
                    <FooterColumn title="Company">
                        <FooterLink to="/about">About FlexFit</FooterLink>
                        <FooterLink to="/about#team">Meet the Team</FooterLink>
                        <FooterLink to="/about#mission">Our Mission</FooterLink>
                        <FooterLink to="/returns">Returns &amp; Exchanges</FooterLink>
                        <FooterLink to="/wishlist">Wish Lists</FooterLink>
                    </FooterColumn>

                    {/* ── Contact column ───────────────────────── */}
                    <FooterColumn title="Contact Us">
                        <li>
                            <a
                                href="mailto:support@flexfit.lk"
                                className="text-gray-400 hover:text-white text-sm transition-colors flex items-start gap-2 group"
                            >
                                <Mail size={14} className="mt-0.5 shrink-0 text-brand-400" />
                                support@flexfit.lk
                            </a>
                        </li>
                        <li>
                            <a
                                href="tel:+94112345678"
                                className="text-gray-400 hover:text-white text-sm transition-colors flex items-start gap-2 group"
                            >
                                <Phone size={14} className="mt-0.5 shrink-0 text-brand-400" />
                                +94 11 234 5678
                            </a>
                        </li>
                        <li>
                            <span className="text-gray-400 text-sm flex items-start gap-2">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-brand-400" />
                                Colombo, Sri Lanka
                            </span>
                        </li>

                        {/* CTA */}
                        <li className="pt-2">
                            <Link
                                to="/about"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors group"
                            >
                                Learn more about us
                                <ArrowRight
                                    size={14}
                                    className="group-hover:translate-x-0.5 transition-transform"
                                />
                            </Link>
                        </li>
                    </FooterColumn>
                </div>
            </div>

            {/* ── Bottom bar ───────────────────────────────────── */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <p>© {year} FlexFit. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link to="/about" className="hover:text-gray-300 transition-colors">
                            About
                        </Link>
                        <span className="text-gray-700">·</span>
                        <Link to="/returns" className="hover:text-gray-300 transition-colors">
                            Returns Policy
                        </Link>
                        <span className="text-gray-700">·</span>
                        <span>Made with ❤️ in Sri Lanka</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
