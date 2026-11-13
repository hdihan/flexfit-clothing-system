import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    CheckCircle, Download, Package, Loader2, Truck,
    MapPin, Home, ShoppingBag, Star, ArrowRight, ShieldCheck,
    Copy, Check, Clock, Calendar, Sparkles, Printer, ExternalLink
} from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';
import Breadcrumbs from '../components/Breadcrumbs';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────
   Lightweight Confetti Animation with Shapes & Ribbons
────────────────────────────────────────────────────────────── */
function useCelebrationConfetti(canvasRef) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            canvas.height = 360;
        };
        resize();
        window.addEventListener('resize', resize);

        const COLORS = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#6366F1'];
        const pieces = Array.from({ length: 90 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height * 0.8,
            w: Math.random() * 8 + 5,
            h: Math.random() * 6 + 4,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rot: Math.random() * 360,
            vx: (Math.random() - 0.5) * 2.5,
            vy: Math.random() * 2.5 + 2,
            vr: (Math.random() - 0.5) * 5,
            alpha: 1,
            shape: Math.random() > 0.4 ? 'rect' : 'circle',
        }));

        let frameId;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;

            pieces.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vr;

                if (p.y > canvas.height * 0.7) {
                    p.alpha = Math.max(0, p.alpha - 0.015);
                }
                if (p.alpha > 0) active = true;

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rot * Math.PI) / 180);
                ctx.fillStyle = p.color;

                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                }
                ctx.restore();
            });

            if (active) {
                frameId = requestAnimationFrame(draw);
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
        };
    }, []);
}

export default function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [copiedTracking, setCopiedTracking] = useState(false);

    useCelebrationConfetti(canvasRef);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data.order);
            } catch (err) {
                console.error('Error fetching order:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const downloadInvoice = async () => {
        setDownloading(true);
        try {
            const res = await api.get(`/invoices/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `FlexFit_Invoice_${order?.orderNumber || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Invoice downloaded successfully!');
        } catch {
            toast.error('Invoice is generating, please retry in a moment');
        } finally {
            setDownloading(false);
        }
    };

    const copyTrackingNumber = () => {
        const trackingNum = order?.trackingNumber || `FF-LK-${order?._id?.slice(-8).toUpperCase()}`;
        navigator.clipboard.writeText(trackingNum);
        setCopiedTracking(true);
        toast.success('Tracking code copied to clipboard!');
        setTimeout(() => setCopiedTracking(false), 2500);
    };

    if (loading) return <Loader />;

    if (!order) {
        return (
            <div className="max-w-lg mx-auto p-12 text-center">
                <ShoppingBag size={56} className="text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Order Not Found</h2>
                <p className="text-gray-500 text-sm mt-2">
                    We could not retrieve the details for this order. It may have expired or was removed.
                </p>
                <button onClick={() => navigate('/products')} className="btn-primary mt-6">
                    Return to Shop
                </button>
            </div>
        );
    }

    const isIntl = order.shippingAddress?.shippingType === 'international';
    const isPayHere = order.paymentMethod === 'payhere';
    const trackingCode = order.trackingNumber || `FF-LK-${order._id.slice(-8).toUpperCase()}`;

    const formattedOrderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-LK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    const estimatedDelivery = (() => {
        const d = new Date(order.createdAt || Date.now());
        d.setDate(d.getDate() + (isIntl ? 9 : 3));
        return d.toLocaleDateString('en-LK', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    })();

    // Order tracking stages
    const trackingSteps = [
        { label: 'Order Placed', time: formattedOrderDate, done: true },
        { label: isPayHere ? 'PayHere Paid' : 'COD Confirmed', time: 'Verified', done: true },
        { label: 'Processing & Quality Check', time: 'In Progress', active: true },
        { label: 'Out for Delivery', time: 'Pending' },
        { label: 'Delivered', time: estimatedDelivery },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 relative">

            {/* ── Celebratory Confetti Canvas ── */}
            <canvas
                ref={canvasRef}
                className="absolute inset-x-0 top-0 w-full h-80 pointer-events-none z-0"
            />

            <div className="relative z-10">
                <Breadcrumbs
                    items={[
                        { label: 'Shop', to: '/products' },
                        { label: 'My Orders', to: '/orders' },
                        { label: `Order #${order.orderNumber || ''}` },
                    ]}
                    fallbackTo="/orders"
                    backLabel="View All Orders"
                />

                {/* ── Celebratory Hero ── */}
                <div className="text-center mb-8 mt-2">
                    <div className="relative inline-flex items-center justify-center mb-4">
                        {/* Glowing pulse rings */}
                        <div className="absolute w-28 h-28 rounded-full bg-emerald-400/20 animate-ping opacity-75" />
                        <div className="absolute w-24 h-24 rounded-full bg-emerald-100" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                            <CheckCircle size={44} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles size={13} className="text-emerald-600" /> Order Placed Successfully
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                        🎉 Thank You For Your Order!
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed">
                        We've received your order and our team is already preparing your garments with love and care.
                    </p>

                    {/* Quick Satisfaction Indicator */}
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-500">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={15} className="fill-amber-400" />
                            ))}
                        </div>
                        <span className="font-medium text-gray-700">Backed by 100% FlexFit Quality Promise</span>
                    </div>
                </div>

                {/* ── Order Highlights Bar ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="card p-3.5 text-center bg-white border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order Number</p>
                        <p className="font-extrabold text-brand-700 text-sm">#{order.orderNumber}</p>
                    </div>

                    <div className="card p-3.5 text-center bg-white border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Payment Method</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                            order.isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                        }`}>
                            {order.isPaid ? '✓ PayHere (Paid)' : '⏳ Cash on Delivery'}
                        </span>
                    </div>

                    <div className="card p-3.5 text-center bg-white border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Order Date</p>
                        <p className="font-semibold text-gray-800 text-xs flex items-center justify-center gap-1">
                            <Calendar size={12} className="text-gray-400" /> {formattedOrderDate}
                        </p>
                    </div>

                    <div className="card p-3.5 text-center bg-white border border-gray-100 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fulfillment</p>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {order.status || 'Processing'}
                        </span>
                    </div>
                </div>

                {/* ── Live Visual Tracking Details ── */}
                <div className="card p-6 mb-6 border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100 mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                                <Truck size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Delivery & Tracking Status</h3>
                                <p className="text-xs text-gray-500">
                                    {isIntl ? 'International Air Courier' : 'Islandwide Express Delivery (Sri Lanka)'}
                                </p>
                            </div>
                        </div>

                        {/* Tracking Code with Copy Button */}
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                            <span className="text-[11px] text-gray-500 font-mono font-medium">Waybill:</span>
                            <span className="text-xs font-mono font-bold text-gray-900">{trackingCode}</span>
                            <button
                                type="button"
                                onClick={copyTrackingNumber}
                                className="p-1 text-gray-400 hover:text-brand-600 rounded transition-all"
                                title="Copy tracking number"
                            >
                                {copiedTracking ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                        </div>
                    </div>

                    {/* Stepper Timeline */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
                        {trackingSteps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center p-2 rounded-xl bg-gray-50/60">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                    step.done
                                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                                        : step.active
                                            ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse'
                                            : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {step.done ? '✓' : idx + 1}
                                </div>
                                <span className="font-bold text-[11px] text-gray-800 leading-tight">
                                    {step.label}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-0.5">
                                    {step.time}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Estimated Arrival Banner */}
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-brand-50/60 via-purple-50/40 to-blue-50/50 border border-brand-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-brand-600 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Estimated Arrival</p>
                                <p className="text-sm font-extrabold text-brand-900">{estimatedDelivery}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[240px]">
                                {[
                                    order.shippingAddress?.street,
                                    order.shippingAddress?.city,
                                    order.shippingAddress?.district || order.shippingAddress?.country,
                                ].filter(Boolean).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Order Summary Card ── */}
                <div className="card p-6 mb-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                        <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                            <ShoppingBag size={18} className="text-brand-600" />
                            Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
                        </h2>
                        <span className="text-xs font-semibold text-gray-500">
                            Invoice Ready
                        </span>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-gray-100">
                        {order.items.map((item) => (
                            <div key={item._id} className="py-3 flex items-center gap-3.5">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-14 h-16 object-cover rounded-lg bg-gray-100 border border-gray-100 flex-shrink-0 shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                                            Size: {item.size}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">
                                            Qty: {item.quantity} × LKR {item.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-sm text-gray-900">
                                        LKR {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cost Breakdown */}
                    <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-900">LKR {order.itemsPrice?.toLocaleString()}</span>
                        </div>

                        {order.discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>Discount</span>
                                <span>- LKR {order.discountAmount.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span>Shipping ({isIntl ? 'International' : 'Domestic'})</span>
                            <span className="font-medium text-gray-900">
                                {order.shippingPrice === 0 ? (
                                    <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">FREE</span>
                                ) : (
                                    `LKR ${order.shippingPrice?.toLocaleString()}`
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Tax (8% VAT)</span>
                            <span className="font-medium text-gray-900">LKR {order.taxPrice?.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between font-black text-lg text-gray-900">
                            <span>Total Amount {order.isPaid ? 'Paid' : 'Payable'}</span>
                            <span className="text-brand-600">LKR {order.totalPrice?.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* PayHere Gateway Verification Details */}
                    {order.isPaid && (
                        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between text-xs text-emerald-900">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
                                <div>
                                    <p className="font-bold">Verified by PayHere Gateway</p>
                                    <p className="text-[11px] text-emerald-700 font-mono">
                                        Transaction ID: {order.paymentResult?.id || `PAYHERE-${order._id.slice(-10)}`}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Confirmed
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Action Buttons with PDF Invoice Download ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {/* Invoice Download Button */}
                    <button
                        type="button"
                        onClick={downloadInvoice}
                        disabled={downloading}
                        className="btn-primary flex items-center justify-center gap-2 py-3.5 shadow-md shadow-brand-500/20 font-bold"
                    >
                        {downloading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download size={18} /> Download Invoice (PDF)
                            </>
                        )}
                    </button>

                    {/* View in Orders */}
                    <Link
                        to="/orders"
                        className="btn-secondary flex items-center justify-center gap-2 py-3.5 font-bold"
                    >
                        <Package size={18} /> My Orders
                    </Link>

                    {/* Continue Shopping */}
                    <Link
                        to="/products"
                        className="btn-secondary flex items-center justify-center gap-2 py-3.5 font-bold border-brand-200 text-brand-700 hover:bg-brand-50"
                    >
                        <ShoppingBag size={18} /> Shop More <ArrowRight size={15} />
                    </Link>
                </div>

                {/* ── Friendly Footer Confirmation ── */}
                <div className="text-center text-xs text-gray-400 space-y-1">
                    <p className="flex items-center justify-center gap-1.5">
                        <Home size={13} />
                        A confirmation receipt has been sent to <span className="font-semibold text-gray-600">{order.user?.email || 'your email address'}</span>.
                    </p>
                    <p>Need support? Contact us anytime at support@flexfit.lk or call +94 11 234 5678</p>
                </div>

            </div>
        </div>
    );
}