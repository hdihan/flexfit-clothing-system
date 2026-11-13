import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CancelOrderModal({ order, onClose, onCancelled }) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');

    const handleCancel = async () => {
        setLoading(true);
        try {
            await api.delete(`/orders/${order._id}`);
            toast.success('Order cancelled and items returned to your cart');
            onCancelled?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Cancel this order?</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Order {order.orderNumber}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-4">
                    <p className="font-medium mb-1">What happens when you cancel:</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                        <li>The items will be returned to your cart</li>
                        <li>Stock will be restored to the vendor</li>
                        <li>This action cannot be undone</li>
                    </ul>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Reason <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows="2"
                        maxLength={200}
                        placeholder="e.g. Changed my mind, found a better option..."
                        className="input-field text-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Keep Order
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Cancelling...
                            </>
                        ) : (
                            'Yes, Cancel'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}