import { useEffect, useState } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { useSearchParams } from 'react-router-dom';
import {
    Package, DollarSign, ShoppingCart, Plus, Loader2,
    Store, X, Edit2, Trash2, Save, Upload, Mail,
    LayoutDashboard, Boxes, ClipboardList, RotateCcw, Tag, Megaphone,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api, { uploadImages } from '../services/api';
import Loader from '../components/Loader';
import LowStockBanner from '../components/LowStockBanner';
import VendorReturns from '../components/VendorReturns';
import ColorPicker from '../components/ColorPicker';
import PromotionsTab from '../components/PromotionsTab';
import PromoBannersTab from '../components/PromoBannersTab';
import Breadcrumbs from '../components/Breadcrumbs';
import toast from 'react-hot-toast';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const TABS = [
    { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
    { id: 'products',   label: 'Products',   icon: Boxes },
    { id: 'orders',     label: 'Orders',     icon: ClipboardList },
    { id: 'returns',    label: 'Returns',    icon: RotateCcw },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'banners',    label: 'Banners',    icon: Megaphone },
];

export default function VendorDashboard() {
    const confirm = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialise tab from URL (fallback to 'overview' for unknown values)
    const [tab, setTab] = useState(() => {
        const t = searchParams.get('tab');
        return TABS.some((x) => x.id === t) ? t : 'overview';
    });

    const [loading, setLoading] = useState(true);
    const [vendor, setVendor] = useState(null);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showVendorSetup, setShowVendorSetup] = useState(false);
    const [sendingReport, setSendingReport] = useState(false);

    // Low-stock state
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    // ── Sync tab → URL ─────────────────────────────────────
    useEffect(() => {
        if (searchParams.get('tab') !== tab) {
            setSearchParams({ tab }, { replace: true });
        }
    }, [tab, searchParams, setSearchParams]);

    // ── Load dashboard data ────────────────────────────────
    const loadDashboard = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/vendors/dashboard');
            setVendor(data.vendor);
            setStats(data.stats);
            setOrders(data.orders);

            const p = await api.get('/products', {
                params: { limit: 100, vendor: data.vendor._id },
            });
            setProducts(p.data.products);

            const ls = await api.get('/vendors/low-stock');
            setLowStockAlerts(ls.data.alerts || []);
        } catch (err) {
            if (err.response?.status === 404) setShowVendorSetup(true);
            else toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/vendors/orders/${orderId}/status`, { status });
            toast.success('Order status updated');
            loadDashboard();
        } catch {
            toast.error('Update failed');
        }
    };

    const deleteProduct = async (id, name) => {
        const ok = await confirm({
            title: 'Delete Product?',
            message: `"${name}" will be permanently removed from your store. This cannot be undone.`,
            confirmLabel: 'Delete Product',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            loadDashboard();
        } catch {
            toast.error('Delete failed');
        }
    };

    const sendReportEmail = async () => {
        setSendingReport(true);
        try {
            await api.post('/vendors/report/email');
            toast.success('Performance report sent to your email!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send report');
        } finally {
            setSendingReport(false);
        }
    };

    if (loading) return <Loader />;

    if (showVendorSetup) {
        return (
            <VendorSetup
                onComplete={() => {
                    setShowVendorSetup(false);
                    loadDashboard();
                }}
            />
        );
    }

    const lowStockVariantCount = lowStockAlerts.length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Premium Header ── */}
            <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Vendor Portal' },
                        ]}
                        fallbackTo="/"
                        backLabel="Exit to Store"
                        className="border-b border-white/20 mb-5 py-2 text-brand-100 [&_a]:text-brand-100 [&_span]:text-white [&_button]:bg-white/10 [&_button]:text-white [&_button]:border-white/20 [&_button:hover]:bg-white/20"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-white/25">
                                <Store size={12} />
                                Vendor Portal
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">{vendor?.storeName}</h1>
                            <p className="text-brand-200 mt-1 text-sm">Your store at a glance</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={sendReportEmail}
                                disabled={sendingReport}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
                            >
                                {sendingReport ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                Email Report
                            </button>
                            <button
                                onClick={() => setShowAddProduct(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-black/20"
                            >
                                <Plus size={16} /> Add Product
                            </button>
                        </div>
                    </div>

                    {/* ── KPI Strip ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        {[
                            { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, sub: 'all time' },
                            { label: 'Revenue', value: `LKR ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, sub: 'earned' },
                            { label: 'Pending', value: stats?.pending || 0, icon: Package, sub: 'orders' },
                            { label: 'Low Stock', value: lowStockVariantCount, icon: Package, sub: lowStockVariantCount > 0 ? 'need attention' : 'all good' },
                        ].map(({ label, value, icon: Icon, sub }) => (
                            <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={14} className="text-brand-200" />
                                    <p className="text-[11px] text-brand-200 uppercase tracking-wide font-semibold">{label}</p>
                                </div>
                                <p className="text-xl font-black text-white">{value}</p>
                                <p className="text-xs text-white/50 mt-0.5">{sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Tab Navigation ── */}
                    <div className="flex gap-1 mt-6 overflow-x-auto scrollbar-none pb-px">
                        {TABS.map(({ id, label, icon: Icon }) => {
                            const active = tab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setTab(id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                                        active
                                            ? 'bg-white text-brand-700 shadow-lg shadow-black/20'
                                            : 'text-brand-200 hover:text-white hover:bg-white/15'
                                    }`}
                                >
                                    <Icon size={15} />
                                    {label}
                                    {id === 'products' && products.length > 0 && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-brand-100 text-brand-700' : 'bg-white/20 text-white'}`}>
                                            {products.length}
                                        </span>
                                    )}
                                    {id === 'orders' && orders.length > 0 && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-brand-100 text-brand-700' : 'bg-white/20 text-white'}`}>
                                            {orders.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* ═══════════════════════════════════════════════
                LOW-STOCK BANNER (always visible)
            ═══════════════════════════════════════════════ */}
                {!bannerDismissed && lowStockAlerts.length > 0 && (
                    <LowStockBanner
                        alerts={lowStockAlerts}
                        onDismiss={() => setBannerDismissed(true)}
                    />
                )}


                {/* ═══════════════════════════════════════════════
                TAB CONTENT
            ═══════════════════════════════════════════════ */}


                {/* ── OVERVIEW ─────────────────────────────────── */}
                {tab === 'overview' && (
                    <div className="space-y-6">
                        {/* Revenue chart */}
                        {orders.length > 0 ? (
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="font-bold text-lg">Revenue Over Time</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Total earned: LKR{' '}
                                            {(stats?.totalRevenue || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getChartData(orders)}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#e5e7eb"
                                            />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                                dx={-10}
                                                tickFormatter={(v) => `LKR ${v}`}
                                            />
                                            <Tooltip
                                                formatter={(value) =>
                                                    `LKR ${value.toLocaleString()}`
                                                }
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#4f46e5"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
                                                activeDot={{
                                                    r: 6,
                                                    fill: '#4f46e5',
                                                    stroke: '#fff',
                                                    strokeWidth: 2,
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <EmptyCard
                                icon={ClipboardList}
                                title="No sales data yet"
                                message="Place your first sale to see revenue trends here."
                            />
                        )}

                        {/* Snapshot: recent 3 orders + low stock summary */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-sm">Recent Orders</h3>
                                    <button
                                        onClick={() => setTab('orders')}
                                        className="text-xs text-brand-600 hover:underline font-medium"
                                    >
                                        View all →
                                    </button>
                                </div>
                                {orders.length === 0 ? (
                                    <p className="text-xs text-gray-500 py-3">
                                        No orders yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {orders.slice(0, 3).map((o) => (
                                            <div
                                                key={o._id}
                                                className="flex items-center justify-between text-xs py-1.5 border-b last:border-0 border-gray-100"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {o.orderNumber}
                                                    </p>
                                                    <p className="text-gray-500 truncate">
                                                        {o.user?.name}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-gray-900 whitespace-nowrap ml-3">
                                                    LKR {o.totalPrice.toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-sm">Inventory Health</h3>
                                    <button
                                        onClick={() => setTab('products')}
                                        className="text-xs text-brand-600 hover:underline font-medium"
                                    >
                                        Manage →
                                    </button>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                        <span className="text-gray-500">Total products</span>
                                        <span className="font-bold text-gray-900">
                                        {products.length}
                                    </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500">
                                        Variants needing attention
                                    </span>
                                        <span
                                            className={`font-bold ${
                                                lowStockVariantCount > 0
                                                    ? 'text-red-600'
                                                    : 'text-emerald-600'
                                            }`}
                                        >
                                        {lowStockVariantCount}
                                    </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5">
                                    <span className="text-gray-500">
                                        Out-of-stock variants
                                    </span>
                                        <span className="font-bold text-red-600">
                                        {
                                            lowStockAlerts.filter(
                                                (a) => a.severity === 'out'
                                            ).length
                                        }
                                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── PRODUCTS ─────────────────────────────────── */}
                {tab === 'products' && (
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <div>
                                <h2 className="font-bold text-lg">
                                    My Products ({products.length})
                                </h2>
                                {lowStockVariantCount > 0 && (
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        ⚠️ {lowStockVariantCount} variant
                                        {lowStockVariantCount > 1 ? 's' : ''} need attention
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowAddProduct(true)}
                                className="btn-primary flex items-center gap-2 text-sm"
                            >
                                <Plus size={16} /> Add Product
                            </button>
                        </div>

                        {products.length === 0 ? (
                            <EmptyCard
                                icon={Boxes}
                                title="No products yet"
                                message="Add your first product to start selling."
                                cta={{
                                    label: 'Add Your First Product',
                                    onClick: () => setShowAddProduct(true),
                                }}
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-left">
                                    <tr>
                                        <th className="p-3">Image</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Category</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3">Colors</th>
                                        <th className="p-3">Stock</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {products.map((p) => {
                                        const productAlerts = lowStockAlerts.filter(
                                            (a) =>
                                                a.productId?.toString() ===
                                                p._id?.toString()
                                        );
                                        return (
                                            <tr
                                                key={p._id}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="p-3">
                                                    <div className="relative">
                                                        <img
                                                            src={p.images?.[0]}
                                                            alt=""
                                                            className="w-12 h-14 object-cover rounded"
                                                        />
                                                        {p.images?.length > 1 && (
                                                            <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[9px] font-bold px-1 rounded-full">
                                                                {p.images.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-medium">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {p.name}
                                                        {productAlerts.length > 0 && (
                                                            <span
                                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                                    productAlerts.some(
                                                                        (a) =>
                                                                            a.severity ===
                                                                            'out'
                                                                    )
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}
                                                                title={productAlerts
                                                                    .map(
                                                                        (a) =>
                                                                            `${a.size}: ${a.stock}`
                                                                    )
                                                                    .join(', ')}
                                                            >
                                                                {productAlerts.some(
                                                                    (a) =>
                                                                        a.severity === 'out'
                                                                )
                                                                    ? '⚠️ OUT'
                                                                    : `⚠️ ${productAlerts.length} low`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">{p.category}</td>
                                                <td className="p-3">
                                                    LKR {p.price.toLocaleString()}
                                                </td>
                                                <td className="p-3">
                                                    {p.colors?.length > 0 ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-gray-600 font-medium">
                                                                {p.colors.length}
                                                            </span>
                                                            <span className="text-gray-400">
                                                                •
                                                            </span>
                                                            <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                                                {p.colors
                                                                    .slice(0, 2)
                                                                    .join(', ')}
                                                                {p.colors.length > 2 &&
                                                                    '…'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td
                                                    className={`p-3 font-medium ${
                                                        p.totalStock < 5
                                                            ? 'text-red-500'
                                                            : ''
                                                    }`}
                                                >
                                                    {p.totalStock}{' '}
                                                    {p.totalStock < 5 && '⚠️'}
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`text-xs ${
                                                            p.isActive
                                                                ? 'text-green-600'
                                                                : 'text-red-500'
                                                        }`}
                                                    >
                                                        {p.isActive
                                                            ? '● Active'
                                                            : '● Hidden'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            setEditingProduct(p)
                                                        }
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteProduct(p._id, p.name)
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ORDERS ───────────────────────────────────── */}
                {tab === 'orders' && (
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg">All Orders ({orders.length})</h2>
                        </div>

                        {orders.length === 0 ? (
                            <EmptyCard
                                icon={ClipboardList}
                                title="No orders yet"
                                message="Orders containing your products will appear here."
                            />
                        ) : (
                            <div className="space-y-3">
                                {orders.map((o) => (
                                    <div
                                        key={o._id}
                                        className="border rounded-lg p-4 flex flex-wrap gap-4 justify-between items-center hover:border-brand-200 transition"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm">
                                                {o.orderNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {o.user?.name} • {o.shippingAddress.city}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(o.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-sm">
                                                LKR {o.totalPrice.toLocaleString()}
                                            </p>
                                            <select
                                                value={o.status}
                                                onChange={(e) =>
                                                    updateOrderStatus(o._id, e.target.value)
                                                }
                                                className="input-field text-sm py-1.5"
                                            >
                                                {[
                                                    'Pending',
                                                    'Processing',
                                                    'Shipped',
                                                    'Delivered',
                                                    'Cancelled',
                                                ].map((s) => (
                                                    <option key={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── RETURNS ──────────────────────────────────── */}
                {tab === 'returns' && <VendorReturns />}

                {/* ── PROMOTIONS ───────────────────────────────── */}
                {tab === 'promotions' && <PromotionsTab />}

                {/* ── BANNERS ──────────────────────────────────── */}
                {tab === 'banners' && <PromoBannersTab />}

                {/* ═══════════════════════════════════════════════
                MODALS
            ═══════════════════════════════════════════════ */}
                {showAddProduct && (
                    <ProductFormModal
                        mode="create"
                        vendorId={vendor._id}
                        onClose={() => setShowAddProduct(false)}
                        onSaved={() => {
                            setShowAddProduct(false);
                            loadDashboard();
                        }}
                    />
                )}
                {editingProduct && (
                    <ProductFormModal
                        mode="edit"
                        product={editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onSaved={() => {
                            setEditingProduct(null);
                            loadDashboard();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────
function getChartData(orders) {
    if (!orders.length) return [];
    const groups = {};
    orders.forEach((o) => {
        const date = new Date(o.createdAt).toLocaleDateString();
        if (!groups[date]) groups[date] = 0;
        groups[date] += o.totalPrice;
    });
    return Object.keys(groups)
        .reverse()
        .map((date) => ({ date, revenue: groups[date] }));
}

function EmptyCard({ icon: Icon, title, message, cta }) {
    return (
        <div className="text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Icon size={24} />
            </div>
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">{message}</p>
            {cta && (
                <button onClick={cta.onClick} className="btn-primary text-sm mt-4">
                    {cta.label}
                </button>
            )}
        </div>
    );
}
// ═══════════════════════════════════════════════════════════════
// VendorSetup — one-time profile creation
// ═══════════════════════════════════════════════════════════════
function VendorSetup({ onComplete }) {
    const [form, setForm] = useState({ storeName: '', businessRegNo: '', description: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/vendors/register', form);
            toast.success('Vendor profile created!');
            onComplete();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Setup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-8">
            <div className="card p-8">
                <h1 className="text-2xl font-bold mb-2">Set Up Your Store</h1>
                <p className="text-gray-600 mb-6 text-sm">
                    One-time setup to start selling on FlexFit
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        value={form.storeName}
                        onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                        className="input-field"
                        placeholder="Store Name"
                        required
                    />
                    <input
                        value={form.businessRegNo}
                        onChange={(e) =>
                            setForm({ ...form, businessRegNo: e.target.value })
                        }
                        className="input-field"
                        placeholder="Business Registration No."
                        required
                    />
                    <textarea
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                        className="input-field"
                        rows="3"
                        placeholder="Short description"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Creating...' : 'Create Store'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// ProductFormModal — create / edit (unchanged from previous)
// ═══════════════════════════════════════════════════════════════
function ProductFormModal({ mode, product, vendorId, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        category: product?.category || 'Tops',
        price: product?.price || '',
    });

    const [sizes, setSizes] = useState(
        product?.sizes?.length
            ? product.sizes.map((s) => ({ size: s.size, stock: s.stock }))
            : SIZES.map((s) => ({ size: s, stock: 0 }))
    );

    const [colors, setColors] = useState(product?.colors || []);

    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const picked = Array.from(e.target.files || []);
        if (!picked.length) return;

        const tooBig = picked.find((f) => f.size > 5 * 1024 * 1024);
        if (tooBig) return toast.error(`"${tooBig.name}" exceeds 5 MB`);

        const room = 6 - existingImages.length - newFiles.length;
        const accepted = picked.slice(0, Math.max(0, room));

        if (accepted.length < picked.length) {
            toast(`Only ${room} more image${room === 1 ? '' : 's'} allowed (max 6)`, {
                icon: 'ℹ️',
            });
        }

        setNewFiles((prev) => [...prev, ...accepted]);
        setNewPreviews((prev) => [
            ...prev,
            ...accepted.map((f) => URL.createObjectURL(f)),
        ]);
    };

    const removeExisting = (idx) =>
        setExistingImages((prev) => prev.filter((_, i) => i !== idx));

    const removeNew = (idx) => {
        URL.revokeObjectURL(newPreviews[idx]);
        setNewFiles((prev) => prev.filter((_, i) => i !== idx));
        setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const moveToFront = (type, idx) => {
        if (type === 'existing') {
            const copy = [...existingImages];
            const [moved] = copy.splice(idx, 1);
            setExistingImages([moved, ...copy]);
        } else {
            const filesCopy = [...newFiles];
            const prevCopy = [...newPreviews];
            const [movedFile] = filesCopy.splice(idx, 1);
            const [movedPrev] = prevCopy.splice(idx, 1);
            setNewFiles([movedFile, ...filesCopy]);
            setNewPreviews([movedPrev, ...prevCopy]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (colors.length === 0) {
            return toast.error('Please select at least one available color');
        }

        setLoading(true);
        try {
            let uploadedUrls = [];
            if (newFiles.length > 0) {
                setUploading(true);
                uploadedUrls = await uploadImages(newFiles);
                setUploading(false);
            }

            const allImages = [...existingImages, ...uploadedUrls];

            if (allImages.length === 0) {
                toast.error('Please add at least one image');
                setLoading(false);
                setUploading(false);
                return;
            }

            const payload = {
                name: form.name,
                description: form.description,
                category: form.category,
                price: Number(form.price),
                images: allImages,
                sizes,
                colors,
            };

            if (isEdit) {
                await api.put(`/products/${product._id}`, payload);
                toast.success('Product updated');
            } else {
                await api.post('/products', { ...payload, vendor: vendorId });
                toast.success('Product created');
            }
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const totalImages = existingImages.length + newFiles.length;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">
                            Product Name
                        </label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className="input-field"
                            rows="2"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Category
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) =>
                                    setForm({ ...form, category: e.target.value })
                                }
                                className="input-field"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Price (LKR)
                            </label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) =>
                                    setForm({ ...form, price: e.target.value })
                                }
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <ColorPicker colors={colors} onChange={setColors} max={8} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium">
                                Product Images{' '}
                                <span className="text-gray-400">({totalImages}/6)</span>
                            </label>
                            <span className="text-[11px] text-gray-500">
                                First image is the cover
                            </span>
                        </div>

                        {totalImages > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                                {existingImages.map((url, idx) => (
                                    <div
                                        key={`ex-${idx}`}
                                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group"
                                    >
                                        <img
                                            src={url}
                                            alt={`Existing ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {idx === 0 && (
                                            <span className="absolute top-1 left-1 text-[9px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">
                                                COVER
                                            </span>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                                            {idx !== 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveToFront('existing', idx)
                                                    }
                                                    className="text-[10px] bg-white text-gray-800 px-2 py-1 rounded font-semibold hover:bg-gray-100"
                                                >
                                                    Set Cover
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeExisting(idx)}
                                                className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {newPreviews.map((url, idx) => (
                                    <div
                                        key={`new-${idx}`}
                                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-brand-300 bg-brand-50/40 group"
                                    >
                                        <img
                                            src={url}
                                            alt={`New ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className="absolute top-1 right-1 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                                            NEW
                                        </span>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                                            {!(
                                                existingImages.length === 0 &&
                                                idx === 0
                                            ) && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveToFront('new', idx)
                                                    }
                                                    className="text-[10px] bg-white text-gray-800 px-2 py-1 rounded font-semibold hover:bg-gray-100"
                                                >
                                                    Set Cover
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeNew(idx)}
                                                className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalImages < 6 && (
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="border-2 border-dashed border-gray-300 hover:border-brand-500 hover:bg-brand-50/30 rounded-lg p-4 flex items-center justify-center gap-2 text-gray-600 transition">
                                    <Upload size={18} />
                                    <span className="text-sm font-medium">
                                        {totalImages === 0
                                            ? 'Click to upload images'
                                            : 'Add more images'}
                                    </span>
                                </div>
                            </label>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, WEBP or GIF • Max 5 MB each • Up to 6 images
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Stock by Size
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {sizes.map((s, i) => (
                                <div key={s.size}>
                                    <label className="text-xs text-gray-500 font-medium">
                                        {s.size}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={s.stock}
                                        onChange={(e) => {
                                            const next = [...sizes];
                                            next[i].stock = Number(e.target.value);
                                            setSizes(next);
                                        }}
                                        className="input-field"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            💡 Alert emails fire automatically when a variant drops below 5.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {loading || uploading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        {uploading
                            ? 'Uploading images...'
                            : loading
                                ? 'Saving...'
                                : isEdit
                                    ? 'Update Product'
                                    : 'Create Product'}
                    </button>
                </form>
            </div>
        </div>
    );
}