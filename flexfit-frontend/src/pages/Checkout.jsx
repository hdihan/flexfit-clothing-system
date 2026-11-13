import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, CreditCard, Loader2, ShoppingBag, Info, ShieldCheck,
    Truck, Globe, Phone, Building, CheckCircle2, RotateCcw, AlertCircle, Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { SRI_LANKA_PROVINCES, COUNTRIES } from '../data/locations';
import PaymentForm from '../components/PaymentForm';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Checkout() {
    const { cart, subtotal, clearCart } = useCart();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [processing, setProcessing] = useState(false);
    const [shippingType, setShippingType] = useState('domestic'); // 'domestic' | 'international'
    const [paymentMethod, setPaymentMethod] = useState('payhere');
    const [saveToProfile, setSaveToProfile] = useState(false);
    const [autoFilled, setAutoFilled] = useState(false);

    // Form fields
    const [form, setForm] = useState({
        street: user?.address?.street || '',
        street2: user?.address?.street2 || '',
        city: user?.address?.city || '',
        district: user?.address?.district || '',
        stateOrProvince: '',
        country: user?.address?.country || 'United States',
        postalCode: user?.address?.postalCode || '',
        phone: user?.phone || '',
    });

    const [errors, setErrors] = useState({});

    // Promotions
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');
    const [validatingPromo, setValidatingPromo] = useState(false);

    // Auto-fill from profile on mount and when user data becomes available
    const applyProfileData = (userData) => {
        const u = userData || user;
        if (!u) return;

        const hasProfileInfo = Boolean(
            u.address?.street ||
            u.address?.city ||
            u.address?.district ||
            u.address?.postalCode ||
            u.phone
        );

        if (hasProfileInfo) {
            setForm((prev) => ({
                ...prev,
                street: u.address?.street || prev.street,
                street2: u.address?.street2 || prev.street2,
                city: u.address?.city || prev.city,
                district: u.address?.district || prev.district,
                postalCode: u.address?.postalCode || prev.postalCode,
                phone: u.phone || prev.phone,
                country: u.address?.country || prev.country,
            }));
            setAutoFilled(true);
        }
    };

    useEffect(() => {
        // Fetch freshest profile info directly from server for accurate auto-fill
        const loadProfile = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                if (data) {
                    applyProfileData(data);
                }
            } catch {
                // Fallback to AuthContext user if offline or guest
                applyProfileData(user);
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user]);

    // Handle switching between Domestic and International
    const handleShippingTypeChange = (type) => {
        setShippingType(type);
        setErrors({});

        // If user was on COD and switches to International, switch to PayHere
        if (type === 'international' && paymentMethod === 'cod') {
            setPaymentMethod('payhere');
            toast('Cash on Delivery is only available for Sri Lanka domestic orders', {
                icon: 'ℹ️',
            });
        }
    };

    // Pricing calculation
    const discount = appliedPromo ? appliedPromo.discountAmount : 0;
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);

    // Shipping fee: Domestic free over 5000, else 350. International: flat 2500
    const shipping = shippingType === 'international'
        ? 2500
        : (subtotalAfterDiscount > 5000 ? 0 : 350);

    const tax = Number((subtotalAfterDiscount * 0.08).toFixed(2));
    const total = subtotalAfterDiscount + shipping + tax;

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setValidatingPromo(true);
        setPromoError('');
        try {
            const res = await api.post('/promotions/validate', { code: promoCode });
            setAppliedPromo(res.data.promotion);
            toast.success('Promotion applied!');
        } catch (err) {
            setPromoError(err.response?.data?.message || 'Invalid code');
            setAppliedPromo(null);
        } finally {
            setValidatingPromo(false);
        }
    };

    const removePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
    };

    // Validation
    const validate = () => {
        const e = {};

        // Street address validation
        if (!form.street.trim()) {
            e.street = 'Street address is required';
        }

        // City validation
        if (!form.city.trim()) {
            e.city = 'City is required';
        }

        // Phone validation
        const cleanedPhone = form.phone.replace(/[\s\-()]/g, '');
        if (!form.phone.trim()) {
            e.phone = 'Contact phone number is required';
        } else if (shippingType === 'domestic') {
            // Sri Lanka phone validation (e.g. 07XXXXXXXX, +947XXXXXXXX, or 9-10 digits)
            const slPhoneRegex = /^(?:0|94|\+94)?7[0-9]{8}$/;
            if (!slPhoneRegex.test(cleanedPhone) && cleanedPhone.length < 9) {
                e.phone = 'Please enter a valid Sri Lankan phone number (e.g. 077 123 4567)';
            }
        } else {
            // International phone validation (at least 7 digits, digits with optional leading +)
            const intlPhoneRegex = /^\+?[0-9]{7,15}$/;
            if (!intlPhoneRegex.test(cleanedPhone)) {
                e.phone = 'Please enter a valid international phone number (e.g. +1 555 123 4567)';
            }
        }

        if (shippingType === 'domestic') {
            // Domestic mandatory district selection
            if (!form.district) {
                e.district = 'District selection is mandatory';
            }
        } else {
            // International validations
            if (!form.country) {
                e.country = 'Destination country is required';
            }
            if (!form.stateOrProvince.trim()) {
                e.stateOrProvince = 'State / Province / Region is required';
            }
            if (!form.postalCode.trim()) {
                e.postalCode = 'Postal / Zip code is required for international delivery';
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ─────────────────────────────────────────────────────────
    // Save address back to user profile if requested
    // ─────────────────────────────────────────────────────────
    const maybeSaveToProfile = async () => {
        if (!saveToProfile || !user) return;
        try {
            const updatedProfile = {
                phone: form.phone.trim(),
                address: {
                    street: form.street.trim(),
                    street2: form.street2.trim(),
                    city: form.city.trim(),
                    district: shippingType === 'domestic' ? form.district : (form.stateOrProvince.trim() || ''),
                    postalCode: form.postalCode.trim(),
                    country: shippingType === 'domestic' ? 'Sri Lanka' : form.country,
                },
            };
            const { data } = await api.put('/auth/profile', updatedProfile);
            updateUser(data);
        } catch (err) {
            console.error('Failed to update profile from checkout:', err);
        }
    };

    // ─────────────────────────────────────────────────────────
    // Build Shipping Address Payload
    // ─────────────────────────────────────────────────────────
    const buildShippingPayload = () => {
        return {
            shippingType,
            street: form.street.trim() + (form.street2.trim() ? `, ${form.street2.trim()}` : ''),
            street2: form.street2.trim() || undefined,
            city: form.city.trim(),
            district: shippingType === 'domestic' ? form.district : (form.stateOrProvince.trim() || 'International'),
            state: form.stateOrProvince.trim() || undefined,
            country: shippingType === 'domestic' ? 'Sri Lanka' : form.country,
            postalCode: form.postalCode.trim() || (shippingType === 'domestic' ? '00000' : ''),
            phone: form.phone.trim(),
        };
    };

    // ─────────────────────────────────────────────────────────
    // Handle PayHere Payment
    // ─────────────────────────────────────────────────────────
    const handlePayHerePayment = async (cardData) => {
        // Always validate the shipping form first (even when called from card form)
        if (!validate()) {
            toast.error('Please complete the shipping address before payment');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (!cart.items || cart.items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        if (!window.payhere) {
            toast.error('PayHere SDK not loaded. Please refresh the page.');
            return;
        }

        setProcessing(true);
        try {
            // 1. Create the order on the backend
            const orderRes = await api.post('/orders', {
                shippingAddress: buildShippingPayload(),
                paymentMethod: 'payhere',
                promotionCode: appliedPromo ? appliedPromo.code : undefined,
            });
            const order = orderRes.data.order;

            // Optional background profile save
            await maybeSaveToProfile();

            // 2. Get hash from backend
            const hashRes = await api.post('/payments/hash', {
                orderId: order._id,
                amount: order.totalPrice,
                currency: 'LKR',
            });
            const { merchantId, hash, amount, currency, sandbox } = hashRes.data;

            // 3. Build PayHere payment object
            const payment = {
                sandbox,
                merchant_id: merchantId,
                return_url: `${window.location.origin}/order-success/${order._id}`,
                cancel_url: `${window.location.origin}/checkout`,
                notify_url: `${import.meta.env.VITE_API_URL?.replace('/api', '')}/api/payments/notify`,
                order_id: order._id,
                items: `FlexFit Order ${order.orderNumber}`,
                amount,
                currency,
                hash,

                first_name: user?.name?.split(' ')[0] || 'Customer',
                last_name: user?.name?.split(' ').slice(1).join(' ') || 'User',
                email: user?.email || 'customer@flexfit.lk',
                phone: form.phone.trim() || user?.phone || '0770000000',
                address: form.street,
                city: form.city,
                country: shippingType === 'domestic' ? 'Sri Lanka' : form.country,
                postal_code: form.postalCode || (shippingType === 'domestic' ? '20000' : '00000'),
            };

            // 4. PayHere event handlers
            window.payhere.onCompleted = async (paymentId) => {
                console.log('✅ PayHere completed:', paymentId);
                try {
                    await api.put(`/payments/confirm/${order._id}`, { paymentId });
                } catch { /* silent */ }
                clearCart();
                toast.success('Payment successful!');
                navigate(`/order-success/${order._id}`);
            };

            window.payhere.onDismissed = async () => {
                setProcessing(false);
                toast.error('Payment cancelled');
                try {
                    await api.delete(`/orders/${order._id}`);
                    toast.success('Cart restored');
                } catch (err) {
                    console.error('Failed to cancel order:', err);
                }
            };

            window.payhere.onError = async (error) => {
                setProcessing(false);
                toast.error('Payment error: ' + error);
                try {
                    await api.delete(`/orders/${order._id}`);
                    toast.success('Cart restored');
                } catch (err) {
                    console.error('Failed to cancel order:', err);
                }
            };

            // 5. Start the payment popup
            window.payhere.startPayment(payment);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment initialization failed');
            setProcessing(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // Handle Cash on Delivery Payment
    // ─────────────────────────────────────────────────────────
    const handleCODPayment = async () => {
        setProcessing(true);
        try {
            const orderRes = await api.post('/orders', {
                shippingAddress: buildShippingPayload(),
                paymentMethod: 'cod',
                promotionCode: appliedPromo ? appliedPromo.code : undefined,
            });
            const order = orderRes.data.order;

            await maybeSaveToProfile();
            clearCart();
            toast.success('Order placed successfully!');
            navigate(`/order-success/${order._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
            setProcessing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please resolve the highlighted errors in the shipping form');
            return;
        }
        if (!cart.items || cart.items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        if (paymentMethod === 'payhere') {
            await handlePayHerePayment();
        } else {
            await handleCODPayment();
        }
    };

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto p-12 text-center">
                <ShoppingBag size={60} className="text-gray-300 mx-auto" />
                <h1 className="text-2xl font-bold mt-4">Your cart is empty</h1>
                <p className="text-gray-500 text-sm mt-1">Discover fresh athletic styles and add items to your cart.</p>
                <button onClick={() => navigate('/products')} className="btn-primary mt-6">
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: 'Shop', to: '/products' },
                    { label: 'Cart', to: '/cart' },
                    { label: 'Checkout' },
                ]}
                fallbackTo="/cart"
                backLabel="Back to Cart"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Secure checkout with domestic islandwide delivery & international shipping
                    </p>
                </div>

                {/* Auto-fill badge indicator & quick refill */}
                {autoFilled && (
                    <div className="flex items-center gap-2 bg-pink-50 border border-brand-200 text-brand-800 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                        <Sparkles size={14} className="text-brand-600 animate-pulse" />
                        <span>Auto-filled from your profile</span>
                        <button
                            type="button"
                            onClick={() => {
                                applyProfileData();
                                toast.success('Profile details refreshed');
                            }}
                            className="ml-1 text-brand-700 hover:text-brand-900 underline flex items-center gap-1 font-semibold"
                            title="Re-populate with saved profile data"
                        >
                            <RotateCcw size={11} /> Re-fill
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">

                    {/* ─────────────────────────────────────────────────────────────
                        Shipping Destination Switcher & Details
                    ────────────────────────────────────────────────────────────── */}
                    <div className="card p-6">
                        {/* Section Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <MapPin size={20} className="text-brand-600" /> Shipping Destination & Address
                            </h2>
                            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                                Step 1 of 2
                            </span>
                        </div>

                        {/* Shipping Mode Toggle (Domestic Sri Lanka vs International) */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Select Shipping Mode
                            </label>
                            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleShippingTypeChange('domestic')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                                        shippingType === 'domestic'
                                            ? 'bg-white text-brand-700 shadow-sm border border-gray-200/80'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <span className="text-base">🇱🇰</span>
                                    <span>Sri Lanka Domestic</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleShippingTypeChange('international')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                                        shippingType === 'international'
                                            ? 'bg-white text-brand-700 shadow-sm border border-gray-200/80'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Globe size={16} className={shippingType === 'international' ? 'text-brand-600' : 'text-gray-500'} />
                                    <span>International Shipping</span>
                                </button>
                            </div>

                            {/* Informational Banner */}
                            {shippingType === 'domestic' ? (
                                <div className="mt-3 bg-brand-50/60 border border-brand-100 rounded-lg p-3 flex items-center justify-between text-xs text-brand-900">
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} className="text-brand-600 flex-shrink-0" />
                                        <span>Islandwide delivery to all 25 districts across Sri Lanka (2–4 business days).</span>
                                    </div>
                                    <span className="font-bold text-brand-700 whitespace-nowrap ml-2">
                                        {subtotalAfterDiscount > 5000 ? 'Free Shipping Active' : 'Free over LKR 5,000'}
                                    </span>
                                </div>
                            ) : (
                                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-blue-900">
                                    <Globe size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-blue-950 mb-0.5">Worldwide Express Delivery (DHL / FedEx / Aramex)</p>
                                        <p className="text-blue-800">
                                            Reliable tracked international shipping (5–10 business days). Flat international rate: LKR 2,500. Cash on delivery is unavailable internationally.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ────────────────── Shipping Address Form ────────────────── */}
                        <div className="grid md:grid-cols-2 gap-4">

                            {/* Country Dropdown (International Mode Only) */}
                            {shippingType === 'international' && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                        <span>Destination Country <span className="text-red-500">*</span></span>
                                        <span className="text-[11px] font-normal text-gray-500">Worldwide Shipping</span>
                                    </label>
                                    <select
                                        value={form.country}
                                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                                        className={`input-field ${errors.country ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    >
                                        <option value="">Select Destination Country</option>
                                        {COUNTRIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                                </div>
                            )}

                            {/* Street Address Line 1 */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    {shippingType === 'domestic' ? 'Street Address' : 'Address Line 1 (Street Address or P.O. Box)'}{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.street}
                                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                                    className={`input-field ${errors.street ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    placeholder={shippingType === 'domestic' ? '123 Main Street or Road Name' : '1234 Maple Avenue, Suite 100'}
                                />
                                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                            </div>

                            {/* Street Address Line 2 (Optional) */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                    <span>Apartment, Suite, Unit, Building <span className="text-gray-400 font-normal lowercase">(optional)</span></span>
                                </label>
                                <input
                                    value={form.street2}
                                    onChange={(e) => setForm({ ...form, street2: e.target.value })}
                                    className="input-field"
                                    placeholder={shippingType === 'domestic' ? 'Apartment 4B, Lotus Residencies' : 'Apt 4B / Floor 2'}
                                />
                            </div>

                            {/* City / Town */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    City / Town <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    className={`input-field ${errors.city ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    placeholder={shippingType === 'domestic' ? 'e.g. Kandy, Colombo, Galle' : 'e.g. London, New York, Sydney'}
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>

                            {/* Sri Lanka Domestic: District Grouped by Province */}
                            {shippingType === 'domestic' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                        <span>District <span className="text-red-500">*</span></span>
                                        <span className="text-[11px] font-normal text-gray-500">25 Districts</span>
                                    </label>
                                    <select
                                        value={form.district}
                                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                                        className={`input-field ${errors.district ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    >
                                        <option value="">-- Select Sri Lankan District --</option>
                                        {SRI_LANKA_PROVINCES.map((p) => (
                                            <optgroup key={p.province} label={`${p.province} Province`}>
                                                {p.districts.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                                </div>
                            ) : (
                                /* International: State / Province / Region */
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        State / Province / Region <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={form.stateOrProvince}
                                        onChange={(e) => setForm({ ...form, stateOrProvince: e.target.value })}
                                        className={`input-field ${errors.stateOrProvince ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                        placeholder="e.g. California, Ontario, NSW"
                                    />
                                    {errors.stateOrProvince && <p className="text-red-500 text-xs mt-1">{errors.stateOrProvince}</p>}
                                </div>
                            )}

                            {/* Postal / Zip Code */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Postal / Zip Code {shippingType === 'international' ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal lowercase">(optional)</span>}
                                </label>
                                <input
                                    value={form.postalCode}
                                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                                    className={`input-field ${errors.postalCode ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    placeholder={shippingType === 'domestic' ? 'e.g. 20000' : 'e.g. 90210 / SW1A 1AA'}
                                />
                                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                            </div>

                            {/* Contact Phone Number Input (Mandatory & Validated) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                    <span>Contact Phone Number <span className="text-red-500">*</span></span>
                                    <span className="text-[11px] font-normal text-gray-500">For courier updates</span>
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className={`input-field pl-10 ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                        placeholder={shippingType === 'domestic' ? '077 123 4567' : '+1 555 123 4567'}
                                    />
                                </div>
                                {errors.phone ? (
                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                ) : (
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        {shippingType === 'domestic' ? 'Sri Lanka mobile number for delivery SMS' : 'Include country code with + prefix'}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* Save to Profile Option */}
                        {user && (
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={saveToProfile}
                                        onChange={(e) => setSaveToProfile(e.target.checked)}
                                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                                    />
                                    <span className="font-medium">Save this address & contact number to my profile for future orders</span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* ─────────────────────────────────────────────────────────────
                        Payment Method
                    ────────────────────────────────────────────────────────────── */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <CreditCard size={20} className="text-brand-600" /> Payment Method
                            </h2>
                            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                                Step 2 of 2
                            </span>
                        </div>

                        <div className="space-y-3">
                            {/* PayHere / Card Option */}
                            <label className={`block border-2 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer transition-all ${
                                paymentMethod === 'payhere'
                                    ? 'border-brand-500 bg-brand-50/40 shadow-sm'
                                    : 'border-gray-200 hover:border-brand-200'
                            }`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="payhere"
                                    checked={paymentMethod === 'payhere'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900">PayHere (Online Card / Mobile Wallet)</p>
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Instant
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Visa • Mastercard • American Express • Discover • eZ Cash • Genie
                                    </p>
                                </div>
                                <ShieldCheck className={paymentMethod === 'payhere' ? 'text-brand-600' : 'text-gray-400'} size={24} />
                            </label>

                            {/* Cash on Delivery Option (Sri Lanka Only) */}
                            <label className={`block border-2 rounded-xl p-4 flex items-center gap-3.5 transition-all ${
                                shippingType === 'international'
                                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                    : paymentMethod === 'cod'
                                        ? 'border-brand-500 bg-brand-50/40 shadow-sm cursor-pointer'
                                        : 'border-gray-200 hover:border-brand-200 cursor-pointer'
                            }`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => {
                                        if (shippingType !== 'international') {
                                            setPaymentMethod(e.target.value);
                                        }
                                    }}
                                    disabled={shippingType === 'international'}
                                    className="w-4 h-4 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
                                        {shippingType === 'international' ? (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Sri Lanka Only
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Pay at doorstep
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {shippingType === 'international'
                                            ? 'COD is unavailable for international air freight delivery'
                                            : 'Pay with cash upon package arrival to your doorstep'}
                                    </p>
                                </div>
                                <Truck className={paymentMethod === 'cod' && shippingType !== 'international' ? 'text-brand-600' : 'text-gray-400'} size={24} />
                            </label>
                        </div>

                        {paymentMethod === 'payhere' && (
                            <div className="mt-4">
                                <PaymentForm
                                    onSubmit={handlePayHerePayment}
                                    totalAmount={total}
                                    processing={processing}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    Order Summary
                ────────────────────────────────────────────────────────────── */}
                <div className="md:col-span-1">
                    <div className="card p-6 sticky top-24">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                            <h2 className="font-bold text-lg text-gray-900">Order Summary</h2>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                {cart.items.reduce((s, i) => s + i.quantity, 0)} items
                            </span>
                        </div>

                        {/* Cart items list */}
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                            {cart.items.map((item) => (
                                <div key={item._id} className="flex gap-3 text-sm py-1">
                                    <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-md bg-gray-100 border border-gray-100 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate font-semibold text-gray-900 text-xs sm:text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Size: <span className="font-medium text-gray-700">{item.size}</span> × {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                                        LKR {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Promo Code Input */}
                        <div className="border-t border-gray-100 pt-4 mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Promo code"
                                    className="input-field py-2 text-sm uppercase"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    disabled={!!appliedPromo}
                                />
                                {appliedPromo ? (
                                    <button
                                        type="button"
                                        onClick={removePromo}
                                        className="btn-secondary py-2 px-3 text-sm text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        Remove
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleApplyPromo}
                                        disabled={validatingPromo}
                                        className="btn-secondary py-2 px-3 text-sm whitespace-nowrap font-medium"
                                    >
                                        {validatingPromo ? 'Checking...' : 'Apply'}
                                    </button>
                                )}
                            </div>
                            {promoError && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {promoError}</p>}
                            {appliedPromo && (
                                <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1 font-medium">
                                    <CheckCircle2 size={12} /> Discount applied: -LKR {appliedPromo.discountAmount.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* Line Item Totals */}
                        <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">LKR {subtotal.toLocaleString()}</span>
                            </div>

                            {appliedPromo && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount ({appliedPromo.code})</span>
                                    <span>- LKR {appliedPromo.discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1">
                                    Shipping
                                    <span className="text-[11px] text-gray-400">
                                        ({shippingType === 'domestic' ? 'Sri Lanka' : 'International'})
                                    </span>
                                </span>
                                <span className="font-medium text-gray-900">
                                    {shipping === 0 ? (
                                        <span className="text-green-600 font-bold uppercase tracking-wider text-xs">FREE</span>
                                    ) : (
                                        `LKR ${shipping.toLocaleString()}`
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Tax (8%)</span>
                                <span className="font-medium text-gray-900">LKR {tax.toLocaleString()}</span>
                            </div>

                            <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-extrabold text-lg text-gray-900">
                                <span>Total</span>
                                <span className="text-brand-600">LKR {total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Submit Button or Payment Gateway Indicator */}
                        {paymentMethod === 'cod' ? (
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2 shadow-sm font-semibold tracking-wide"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} /> Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <Truck size={18} /> Place Order (Cash on Delivery)
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-brand-50/60 to-purple-50/40 border border-brand-100/80 text-center">
                                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand-700 mb-1">
                                    <ShieldCheck size={16} className="text-brand-600" />
                                    PayHere Gateway Active
                                </div>
                                <p className="text-[11px] text-gray-500 leading-relaxed">
                                    Enter your card details in the form on the left and click <strong className="text-gray-800">Pay Securely</strong> to authorize payment.
                                </p>
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <ShieldCheck size={14} className="text-gray-400" />
                            <span>256-bit encrypted secure checkout</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}