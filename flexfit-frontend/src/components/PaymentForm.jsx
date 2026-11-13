import { useState, useEffect } from 'react';
import { CreditCard, Lock, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

/* ─── High-Fidelity SVG Brand Logos ─── */
const VisaLogo = () => (
    <svg viewBox="0 0 64 20" className="h-5 w-auto" aria-label="Visa">
        <path fill="#1434CB" d="M24.5 1.5L16.2 18.5H11L6.7 5.1C6.4 4.1 6.2 3.7 5.3 3.3C3.9 2.5 1.9 1.9 0 1.5L0.2 0.7H9.2C10.5 0.7 11.6 1.6 11.9 3.1L14.2 13.9L19.4 0.7H24.5V1.5ZM46.1 12.8C46.1 8 39.4 7.7 39.5 5.5C39.5 4.8 40.2 4.1 41.6 3.9C42.3 3.8 44.3 3.7 46.2 4.6L47 1C45.9 0.6 44.4 0.2 42.6 0.2C37.4 0.2 33.7 2.9 33.7 6.9C33.7 9.8 36.3 11.4 38.3 12.4C40.3 13.4 41 14 41 14.9C41 16.3 39.3 16.9 37.8 16.9C35.1 16.9 33.6 16.2 32.3 15.6L31.5 19.3C32.8 19.9 35.1 20.4 37.5 20.4C43.1 20.4 46.1 17.6 46.1 12.8ZM59.7 18.5H64L60.2 0.7H56.3C55.4 0.7 54.6 1.2 54.3 2.1L46.4 18.5H51.6L52.6 15.6H58.9L59.7 18.5ZM54.1 11.9L56.7 4.9L58.2 11.9H54.1ZM32.3 0.7L28.2 18.5H23.3L27.4 0.7H32.3Z" />
    </svg>
);

const MastercardLogo = () => (
    <svg viewBox="0 0 50 32" className="h-5 w-auto" aria-label="Mastercard">
        <rect width="50" height="32" rx="4" fill="transparent" />
        <circle cx="18" cy="16" r="12" fill="#EB001B" />
        <circle cx="32" cy="16" r="12" fill="#F79E1B" />
        <path d="M25 6.4a12 12 0 0 1 0 19.2A12 12 0 0 1 25 6.4z" fill="#FF5F00" />
    </svg>
);

const AmexLogo = () => (
    <svg viewBox="0 0 54 32" className="h-5 w-auto" aria-label="American Express">
        <rect width="54" height="32" rx="4" fill="#006FCF" />
        <path fill="#FFFFFF" d="M11.6 13.2h2.5l-3.3-7.5H8.3L5 13.2h2.5l.6-1.5h2.9l.6 1.5zm-2.4-3.2l.8-2 .8 2H9.2zm14.7-4.3H19v7.5h4.9c2.3 0 3.7-1.3 3.7-3.7 0-2.5-1.4-3.8-3.7-3.8zm-.2 5.5h-2.5v-3.5h2.5c1.1 0 1.7.5 1.7 1.7 0 1.2-.6 1.8-1.7 1.8zm14.6-5.5h-5.8v7.5h5.8v-1.8H38v-1.1h3.3v-1.8H38v-1h4.1V5.7zm7.5 0h-2.5l-2.1 3.5-2.1-3.5h-2.6l3.3 5-3.5 5.2h2.6l2.3-3.6 2.3 3.6h2.6l-3.5-5.2 3.2-5z" />
    </svg>
);

const ChipSvg = () => (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="rounded">
        <rect width="36" height="28" rx="4" fill="#E5C158" />
        <rect x="1" y="1" width="34" height="26" rx="3" stroke="#C69E2E" strokeWidth="1" />
        <path d="M0 9h12v10H0M24 9h12v10H24M12 0v9M24 0v9M12 19v9M24 19v9" stroke="#9E7B17" strokeWidth="1" strokeLinecap="round" />
        <circle cx="18" cy="14" r="4" stroke="#9E7B17" strokeWidth="1" />
    </svg>
);

const ContactlessSvg = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/70">
        <path d="M7 16.5a6 6 0 0 1 0-9" />
        <path d="M10.5 19a10 10 0 0 1 0-14" />
        <path d="M14 21.5a14 14 0 0 1 0-19" />
    </svg>
);

const BRANDS = [
    { id: 'visa', label: 'Visa', Logo: VisaLogo, digits: 16, placeholder: '4916 2175 0161 1292' },
    { id: 'mastercard', label: 'Mastercard', Logo: MastercardLogo, digits: 16, placeholder: '5200 8282 0000 1234' },
    { id: 'amex', label: 'AMEX', Logo: AmexLogo, digits: 15, placeholder: '3782 8224 6310 005' },
];

const MONTHS = [
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' },
];

// Starts from 2026 onwards as requested
const CURRENT_YEAR = 2026;
const YEARS = Array.from({ length: 12 }, (_, i) => String(CURRENT_YEAR + i));

/**
 * Formats card number into clean 4-digit groups (e.g. 4521 4567 8885 4400)
 */
function formatCardNumber(raw, isAmex) {
    const digits = raw.replace(/\D/g, '').slice(0, isAmex ? 15 : 16);
    // Split into 4-digit chunks
    const matches = digits.match(/.{1,4}/g);
    return matches ? matches.join(' ') : digits;
}

/**
 * Mask preview for virtual card
 */
function maskCardDisplay(number, isAmex) {
    const raw = number.replace(/\s/g, '');
    if (!raw) return isAmex ? '•••• •••• •••• •••' : '•••• •••• •••• ••••';
    
    // Group remaining into 4s with dots
    const totalDigits = isAmex ? 15 : 16;
    let padded = raw;
    while (padded.length < totalDigits) {
        padded += '•';
    }
    const chunks = padded.match(/.{1,4}/g) || [];
    return chunks.join(' ');
}

export default function PaymentForm({ onSubmit, totalAmount, processing = false }) {
    const [brand, setBrand] = useState('visa');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [holder, setHolder] = useState('');
    const [showCvv, setShowCvv] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const isAmex = brand === 'amex';
    const cvvLen = isAmex ? 4 : 3;
    const maxDigits = isAmex ? 15 : 16;

    // Auto-detect brand from typed number
    useEffect(() => {
        const raw = cardNumber.replace(/\s/g, '');
        if (raw.startsWith('4') && brand !== 'visa') {
            setBrand('visa');
        } else if ((raw.startsWith('51') || raw.startsWith('52') || raw.startsWith('53') || raw.startsWith('54') || raw.startsWith('55') || raw.startsWith('22') || raw.startsWith('23') || raw.startsWith('24') || raw.startsWith('25') || raw.startsWith('26') || raw.startsWith('27')) && brand !== 'mastercard') {
            setBrand('mastercard');
        } else if ((raw.startsWith('34') || raw.startsWith('37')) && brand !== 'amex') {
            setBrand('amex');
        }
    }, [cardNumber, brand]);

    const handleBrandSelect = (id) => {
        setBrand(id);
        const newIsAmex = id === 'amex';
        if (cardNumber) {
            setCardNumber(formatCardNumber(cardNumber, newIsAmex));
        }
        if (cvv && cvv.length > (newIsAmex ? 4 : 3)) {
            setCvv(cvv.slice(0, newIsAmex ? 4 : 3));
        }
    };

    const handleCardInput = (e) => {
        const formatted = formatCardNumber(e.target.value, isAmex);
        setCardNumber(formatted);
        if (errors.cardNumber) {
            setErrors((prev) => ({ ...prev, cardNumber: null }));
        }
    };

    const handleHolderInput = (e) => {
        // Only allow letters, spaces, and hyphens
        const val = e.target.value.replace(/[^a-zA-Z\s\-']/g, '').toUpperCase();
        setHolder(val);
        if (errors.holder) {
            setErrors((prev) => ({ ...prev, holder: null }));
        }
    };

    const handleCvvInput = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, cvvLen);
        setCvv(val);
        if (errors.cvv) {
            setErrors((prev) => ({ ...prev, cvv: null }));
        }
    };

    // Autofill PayHere Default Sandbox Test Card
    const autofillPayHereTestCard = () => {
        setBrand('visa');
        setCardNumber('4916 2175 0161 1292');
        setHolder('PAYHERE TEST USER');
        setExpiryMonth('12');
        setExpiryYear('2028');
        setCvv('123');
        setErrors({});
    };

    const validate = () => {
        const e = {};
        const rawDigits = cardNumber.replace(/\s/g, '');

        if (!rawDigits) {
            e.cardNumber = 'Card number is required';
        } else if (rawDigits.length !== maxDigits) {
            e.cardNumber = `Card number must be ${maxDigits} digits`;
        }

        if (!holder.trim()) {
            e.holder = 'Cardholder name is required';
        } else if (holder.trim().length < 3) {
            e.holder = 'Cardholder name is too short';
        }

        if (!expiryMonth) {
            e.expiryMonth = 'Month required';
        }
        if (!expiryYear) {
            e.expiryYear = 'Year required';
        }

        if (!cvv) {
            e.cvv = 'CVV required';
        } else if (cvv.length !== cvvLen) {
            e.cvv = `CVV must be ${cvvLen} digits`;
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleFormSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setTouched({ cardNumber: true, holder: true, expiryMonth: true, expiryYear: true, cvv: true });
        if (validate()) {
            onSubmit({
                cardNumber,
                brand,
                expiryMonth,
                expiryYear,
                cvv,
                holder,
            });
        }
    };

    const activeBrand = BRANDS.find((b) => b.id === brand) || BRANDS[0];

    return (
        <div className="rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden transition-all">
            {/* Header with SSL Badge & PayHere Branding */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-brand-50/30">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Lock size={15} />
                    </div>
                    <div>
                        <span>PayHere Secure Card Checkout</span>
                        <p className="text-[11px] font-normal text-gray-500">Official PCI-DSS Level 1 Gateway</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-2.5 py-1">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        256-bit SSL Encrypted
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* ── PayHere Sandbox Test Card Banner (1-Click Autofill) ── */}
                <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-600 flex-shrink-0" />
                        <div>
                            <span className="font-bold">PayHere Sandbox Default Test Card: </span>
                            <span className="font-mono bg-amber-100/90 px-1.5 py-0.5 rounded text-amber-950 font-bold">
                                4916 2175 0161 1292
                            </span>
                            <span className="text-amber-700 hidden sm:inline"> (Exp: 12/28 • CVV: 123)</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={autofillPayHereTestCard}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all active:scale-95"
                    >
                        <RefreshCw size={12} /> Auto-fill Test Card
                    </button>
                </div>

                {/* ── Clean Card Selector (Visa, Mastercard, AMEX) ── */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Select Card Network
                        </label>
                        <span className="text-[11px] text-gray-400">Debit or Credit</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {BRANDS.map(({ id, label, Logo }) => {
                            const isSelected = brand === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => handleBrandSelect(id)}
                                    className={`relative flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-xl border-2 transition-all duration-200 ${
                                        isSelected
                                            ? 'border-brand-600 bg-brand-50/40 shadow-sm shadow-brand-100 ring-2 ring-brand-500/20'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                                    }`}
                                >
                                    <div className="h-6 flex items-center justify-center">
                                        <Logo />
                                    </div>
                                    <span className={`text-[11px] font-bold ${isSelected ? 'text-brand-700' : 'text-gray-600'}`}>
                                        {label}
                                    </span>
                                    {isSelected && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center shadow">
                                            <CheckCircle2 size={11} strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Virtual Interactive Card Preview ── */}
                <div className="relative rounded-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-brand-950 text-white p-5 sm:p-6 shadow-xl shadow-gray-300/40 border border-gray-800/50 overflow-hidden select-none">
                    {/* Holographic Sheen Circles */}
                    <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 blur-2xl pointer-events-none" />
                    <div className="absolute left-1/3 -top-12 w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-between h-44">
                        {/* Top row: Chip, Contactless, Brand */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ChipSvg />
                                <ContactlessSvg />
                            </div>
                            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
                                <activeBrand.Logo />
                            </div>
                        </div>

                        {/* Middle row: Live 4-digit formatted card number */}
                        <div className="my-auto">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block mb-0.5">
                                Card Number
                            </span>
                            <div className="font-mono text-lg sm:text-xl font-bold tracking-[0.18em] text-white/95 drop-shadow">
                                {maskCardDisplay(cardNumber, isAmex)}
                            </div>
                        </div>

                        {/* Bottom row: Cardholder and Expiry */}
                        <div className="flex items-end justify-between pt-2 border-t border-white/10">
                            <div className="max-w-[70%]">
                                <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-medium">
                                    Cardholder Name
                                </span>
                                <span className="text-xs sm:text-sm font-bold tracking-wider truncate block text-white/95">
                                    {holder.trim() || 'CARDHOLDER NAME'}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-medium">
                                    Expires
                                </span>
                                <span className="text-xs sm:text-sm font-bold font-mono tracking-widest text-white/95">
                                    {expiryMonth || 'MM'}/{expiryYear ? expiryYear.slice(-2) : 'YY'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Live Formatted Inputs ── */}
                <div className="space-y-4">

                    {/* 1. Card Number with 4-digit grouping */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Card Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <CreditCard size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                inputMode="numeric"
                                value={cardNumber}
                                onChange={handleCardInput}
                                placeholder={activeBrand.placeholder}
                                maxLength={isAmex ? 18 : 19}
                                className={`input-field pl-11 pr-20 font-mono text-base tracking-widest ${
                                    errors.cardNumber ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : ''
                                }`}
                            />
                            <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
                                <activeBrand.Logo />
                            </div>
                        </div>
                        {errors.cardNumber ? (
                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                                <AlertCircle size={13} /> {errors.cardNumber}
                            </p>
                        ) : (
                            <p className="text-[11px] text-gray-400 mt-1">
                                Digits format into 4-digit groups automatically (e.g., 4521 4567 8885 4400)
                            </p>
                        )}
                    </div>

                    {/* 2. Cardholder Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Cardholder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={holder}
                            onChange={handleHolderInput}
                            placeholder="AS PRINTED ON CARD"
                            className={`input-field font-semibold tracking-wide uppercase ${
                                errors.holder ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : ''
                            }`}
                        />
                        {errors.holder && (
                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                                <AlertCircle size={13} /> {errors.holder}
                            </p>
                        )}
                    </div>

                    {/* 3. Expiry Date & CVV */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">

                        {/* Expiry Date Section: Distinct Month + Divider + Year */}
                        <div className="sm:col-span-8">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                {/* Month Selector */}
                                <div className="flex-1">
                                    <select
                                        value={expiryMonth}
                                        onChange={(e) => {
                                            setExpiryMonth(e.target.value);
                                            if (errors.expiryMonth) setErrors((prev) => ({ ...prev, expiryMonth: null }));
                                        }}
                                        className={`input-field font-semibold text-sm ${
                                            errors.expiryMonth ? 'border-red-500 ring-1 ring-red-500' : ''
                                        }`}
                                    >
                                        <option value="">Month (MM)</option>
                                        {MONTHS.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Clear Divider */}
                                <div className="px-1 py-2 flex items-center justify-center font-bold text-gray-400 text-lg select-none">
                                    /
                                </div>

                                {/* Year Selector (2026 onwards) */}
                                <div className="flex-1">
                                    <select
                                        value={expiryYear}
                                        onChange={(e) => {
                                            setExpiryYear(e.target.value);
                                            if (errors.expiryYear) setErrors((prev) => ({ ...prev, expiryYear: null }));
                                        }}
                                        className={`input-field font-semibold text-sm ${
                                            errors.expiryYear ? 'border-red-500 ring-1 ring-red-500' : ''
                                        }`}
                                    >
                                        <option value="">Year (YYYY)</option>
                                        {YEARS.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {(errors.expiryMonth || errors.expiryYear) && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                                    <AlertCircle size={13} /> {errors.expiryMonth || errors.expiryYear}
                                </p>
                            )}
                        </div>

                        {/* CVV Input with Show/Hide toggle */}
                        <div className="sm:col-span-4">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                <span>CVV / CVC <span className="text-red-500">*</span></span>
                                <span className="text-[10px] text-gray-400 lowercase">{isAmex ? '4 digits' : '3 digits'}</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showCvv ? 'text' : 'password'}
                                    inputMode="numeric"
                                    value={cvv}
                                    onChange={handleCvvInput}
                                    placeholder={isAmex ? '1234' : '123'}
                                    maxLength={cvvLen}
                                    className={`input-field font-mono pr-10 text-center tracking-widest ${
                                        errors.cvv ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : ''
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCvv(!showCvv)}
                                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-1"
                                    tabIndex={-1}
                                    title={showCvv ? 'Hide CVV' : 'Show CVV'}
                                >
                                    {showCvv ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {errors.cvv && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                                    <AlertCircle size={13} /> {errors.cvv}
                                </p>
                            )}
                        </div>

                    </div>
                </div>

                {/* ── Single Primary Payment Action Button ── */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleFormSubmit}
                        disabled={processing}
                        className="btn-primary w-full py-3.5 px-6 flex items-center justify-center gap-2.5 text-base font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    >
                        <Lock size={18} />
                        <span>
                            {processing
                                ? 'Connecting to PayHere...'
                                : totalAmount
                                    ? `Pay Securely · LKR ${totalAmount.toLocaleString()}`
                                    : 'Pay Securely with PayHere'
                            }
                        </span>
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Protected by PayHere 256-bit SSL encrypted tokenization</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
