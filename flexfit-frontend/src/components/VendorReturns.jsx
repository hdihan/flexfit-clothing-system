import { useEffect, useState } from 'react';
import {
    RotateCcw, Package, RefreshCw, Loader2, Info, ChevronDown, ChevronUp,
} from 'lucide-react';
import api from '../services/api';
import Loader from './Loader';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    Requested: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Approved: 'bg-blue-100 text-blue-700 border-blue-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
    'In Transit': 'bg-purple-100 text-purple-700 border-purple-200',
    Received: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Refunded: 'bg-green-100 text-green-700 border-green-200',
};

const STATUSES = ['Requested', 'Approved', 'Rejected', 'In Transit', 'Received', 'Refunded'];

export default function VendorReturns() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/vendors/returns');
            setReturns(data.returns || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load returns');
            setReturns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const updateStatus = async (id, status) => {
        setUpdatingId(id);
        try {
            await api.put(`/vendors/returns/${id}/status`, { status });
            toast.success('Return status updated');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <Loader />;

    if (returns.length === 0) {
        return (
            <div className="card p-8 text-center">
                <RotateCcw size={40} className="text-gray-300 mx-auto" />
                <p className="text-gray-500 text-sm mt-3">No returns for your products</p>
                <p className="text-xs text-gray-400 mt-1">
                    When a customer requests a return that includes your items, it will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                        <RotateCcw size={16} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Product Returns</h2>
                        <p className="text-xs text-gray-500">
                            {returns.length} return{returns.length !== 1 ? 's' : ''} involving
                            your products
                        </p>
                    </div>
                </div>
                <button
                    onClick={load}
                    className="btn-secondary flex items-center gap-2 text-sm"
                    title="Refresh"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className="space-y-3">
                {returns.map((r) => {
                    const expanded = expandedId === r._id;
                    const isUpdating = updatingId === r._id;

                    return (
                        <div
                            key={r._id}
                            className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-brand-200 transition"
                        >
                            {/* Header row */}
                            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="flex-shrink-0">
                                        <p className="text-[10px] uppercase text-gray-500 tracking-wider">
                                            Return #
                                        </p>
                                        <p className="font-bold text-sm">{r.returnNumber}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="hidden sm:block w-px h-10 bg-gray-200" />

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {r.user?.name || 'Customer'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 truncate">
                                            Order {r.order?.orderNumber} • Reason: {r.reason}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Multi-vendor badge */}
                                    {r.isMixedVendor && (
                                        <span
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1"
                                            title="This return also contains items from other vendors"
                                        >
                                            <Info size={10} /> Mixed
                                        </span>
                                    )}

                                    <span
                                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                                            STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {r.status}
                                    </span>

                                    <select
                                        value={r.status}
                                        onChange={(e) => updateStatus(r._id, e.target.value)}
                                        disabled={isUpdating}
                                        className="input-field text-xs py-1.5 pr-6 disabled:opacity-50"
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => setExpandedId(expanded ? null : r._id)}
                                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                                        title={expanded ? 'Hide items' : 'Show items'}
                                    >
                                        {expanded ? (
                                            <ChevronUp size={16} />
                                        ) : (
                                            <ChevronDown size={16} />
                                        )}
                                    </button>

                                    {isUpdating && (
                                        <Loader2
                                            size={16}
                                            className="animate-spin text-brand-600"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Expanded detail panel */}
                            {expanded && (
                                <div className="border-t border-gray-100 bg-gray-50/60 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Package size={13} className="text-gray-500" />
                                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                            Your Items in this Return
                                        </p>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {r.items.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200"
                                            >
                                                {item.product?.images?.[0] ? (
                                                    <img
                                                        src={item.product.images[0]}
                                                        alt={item.name}
                                                        className="w-10 h-12 object-cover rounded flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        Qty {item.quantity}
                                                        {item.product?.price && (
                                                            <> • LKR {item.product.price.toLocaleString()} each</>
                                                        )}
                                                    </p>
                                                </div>
                                                {item.product?.price && (
                                                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                                        LKR{' '}
                                                        {(
                                                            item.product.price * item.quantity
                                                        ).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {r.description && (
                                        <div className="mb-3">
                                            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                                                Customer Description
                                            </p>
                                            <p className="text-xs text-gray-700 bg-white rounded-lg p-2.5 border border-gray-200">
                                                {r.description}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
                                        <p className="text-[11px] text-gray-500">
                                            {r.vendorItemCount} item
                                            {r.vendorItemCount !== 1 ? 's' : ''} belong to your
                                            store
                                        </p>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase text-gray-500 tracking-wider">
                                                Your Portion of Refund
                                            </p>
                                            <p className="text-sm font-bold text-brand-600">
                                                LKR{' '}
                                                {r.vendorRefundEstimate.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {r.isMixedVendor && (
                                        <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-[11px] text-amber-800">
                                            <Info size={13} className="flex-shrink-0 mt-0.5" />
                                            <span>
                                                This return also includes products from other
                                                vendors. You only see and manage your own items.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}