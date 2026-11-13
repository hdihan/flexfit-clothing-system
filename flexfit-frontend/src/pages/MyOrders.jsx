import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, RefreshCw, XCircle, Loader2, MapPin, Clock, CheckCircle2, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';
import CancelOrderModal from '../components/CancelOrderModal';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';

const STATUS_CONFIG = {
    Pending:    { color: 'bg-gray-100 text-gray-700 border-gray-200',         icon: Clock,         dot: 'bg-gray-400' },
    Processing: { color: 'bg-amber-50 text-amber-700 border-amber-200',       icon: RefreshCw,     dot: 'bg-amber-400' },
    Shipped:    { color: 'bg-blue-50 text-blue-700 border-blue-200',          icon: Truck,         dot: 'bg-blue-500' },
    Delivered:  { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2,  dot: 'bg-emerald-500' },
    Cancelled:  { color: 'bg-red-50 text-red-700 border-red-200',             icon: XCircle,       dot: 'bg-red-500' },
};

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const [cancelling, setCancelling] = useState(null);
    const { refreshCart } = useCart();

    const loadOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders');
            setOrders(data.orders || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, []);

    const downloadInvoice = async (orderId, orderNumber) => {
        setDownloading(orderId);
        try {
            const res = await api.get(`/invoices/${orderId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `Invoice_${orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Could not download invoice');
        } finally {
            setDownloading(null);
        }
    };

    const canCancel = (order) => !order.isPaid && order.status === 'Pending';

    const handleCancelled = () => { loadOrders(); refreshCart(); };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumbs
                    items={[
                        { label: 'Shop', to: '/products' },
                        { label: 'My Orders' },
                    ]}
                    fallbackTo="/products"
                    backLabel="Back to Shop"
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Account</p>
                        <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
                        <p className="text-gray-500 mt-1">
                            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
                        </p>
                    </div>
                    <button
                        onClick={loadOrders}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2.5 rounded-2xl transition-all hover:shadow-sm"
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <Package size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-black text-gray-700 mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">You haven't placed any orders yet. Start exploring our collection!</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-brand-200"
                        >
                            <ShoppingBag size={18} /> Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {orders.map((order) => {
                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                            const StatusIcon = status.icon;
                            return (
                                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300">
                                    {/* Order header */}
                                    <div className="flex flex-wrap justify-between items-center gap-4 p-5 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                <Package size={20} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-sm">{order.orderNumber}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Status badge */}
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                {order.status}
                                            </span>
                                            {/* Payment badge */}
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                                                order.isPaid
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                                            </span>
                                            {/* Total */}
                                            <p className="font-black text-gray-900 text-lg">
                                                LKR {order.totalPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Items row */}
                                    <div className="px-5 py-4 flex gap-3 overflow-x-auto scrollbar-none">
                                        {order.items.map((item) => (
                                            <div key={item._id} className="flex-shrink-0 w-16">
                                                <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                                    <img
                                                        src={item.image || 'https://via.placeholder.com/64x80?text=Item'}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1.5 truncate font-medium">{item.name}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex flex-wrap justify-between items-center gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <MapPin size={12} />
                                            {order.items.length} item{order.items.length > 1 ? 's' : ''} · Shipping to {order.shippingAddress.city}
                                        </p>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => downloadInvoice(order._id, order.orderNumber)}
                                                disabled={downloading === order._id}
                                                className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
                                            >
                                                {downloading === order._id
                                                    ? <Loader2 size={14} className="animate-spin" />
                                                    : <Download size={14} />}
                                                Invoice
                                            </button>

                                            <Link
                                                to={`/order-success/${order._id}`}
                                                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                                            >
                                                View details <ArrowRight size={14} />
                                            </Link>

                                            {canCancel(order) && (
                                                <button
                                                    onClick={() => setCancelling(order)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all"
                                                >
                                                    <XCircle size={13} /> Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {cancelling && (
                <CancelOrderModal
                    order={cancelling}
                    onClose={() => setCancelling(null)}
                    onCancelled={handleCancelled}
                />
            )}
        </div>
    );
}