import { useEffect, useState } from 'react';
import { PackageX, Plus, Loader2, X, Trash2, Edit2, Save } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';
import { useConfirm } from '../context/ConfirmContext';

const REASONS = ['Sizing', 'Defect', 'Changed Mind', 'Wrong Item', 'Other'];
const STATUS_COLORS = {
    Requested: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-blue-100 text-blue-700',
    Rejected: 'bg-red-100 text-red-700',
    'In Transit': 'bg-purple-100 text-purple-700',
    Received: 'bg-green-100 text-green-700',
    Refunded: 'bg-green-100 text-green-700',
};

export default function Returns() {
    const confirm = useConfirm();
    const [returns, setReturns] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const [r, o] = await Promise.all([api.get('/returns'), api.get('/orders')]);
            setReturns(r.data.returns);
            setOrders(o.data.orders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const del = async (id) => {
        const ok = await confirm({
            title: 'Cancel Return Request?',
            message: 'This return request will be permanently cancelled. You will need to submit a new request if you change your mind.',
            confirmLabel: 'Cancel Return',
            cancelLabel: 'Keep',
            variant: 'warning',
        });
        if (!ok) return;
        try {
            await api.delete(`/returns/${id}`);
            toast.success('Return request cancelled successfully');
            load();
        } catch {
            toast.error('Failed to cancel return');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: 'Shop', to: '/products' },
                    { label: 'Returns & Exchanges' },
                ]}
                fallbackTo="/orders"
                backLabel="Back to Orders"
            />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <PackageX className="text-brand-600" /> Returns
                    </h1>
                    <p className="text-gray-600 mt-1">{returns.length} request{returns.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> New Return
                </button>
            </div>

            {returns.length === 0 ? (
                <div className="card p-12 text-center">
                    <PackageX size={60} className="text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">No return requests yet</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Create one</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {returns.map((r) => (
                        <div key={r._id} className="card p-5">
                            <div className="flex justify-between items-start gap-3 pb-3 border-b">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Return #</p>
                                    <p className="font-bold">{r.returnNumber}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Order: {r.order?.orderNumber} • {new Date(r.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                                    {/* Only allow edit/delete while Requested */}
                                    {r.status === 'Requested' && (
                                        <>
                                            <button
                                                onClick={() => setEditing(r)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => del(r._id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Cancel"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="pt-3">
                                <p className="text-sm"><span className="text-gray-500">Reason:</span> {r.reason}</p>
                                {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                                <p className="text-sm font-medium mt-2 text-brand-600">
                                    Refund: LKR {r.refundAmount?.toLocaleString()}
                                </p>
                                {r.status !== 'Requested' && (
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                        This return has been processed — contact support for changes.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <ReturnFormModal
                    orders={orders}
                    onClose={() => setShowForm(false)}
                    onSaved={() => { setShowForm(false); load(); }}
                />
            )}

            {editing && (
                <ReturnEditModal
                    returnItem={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); load(); }}
                />
            )}
        </div>
    );
}

// ─── Create Modal ─────────────────────────────
function ReturnFormModal({ orders, onClose, onSaved }) {
    const [form, setForm] = useState({ order: '', reason: 'Sizing', description: '' });
    const [loading, setLoading] = useState(false);

    const selectedOrder = orders.find((o) => o._id === form.order);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.order) return toast.error('Please select an order');
        setLoading(true);
        try {
            await api.post('/returns', {
                order: form.order,
                items: selectedOrder?.items.map((i) => ({
                    product: i.product,
                    name: i.name,
                    quantity: i.quantity,
                })) || [],
                reason: form.reason,
                description: form.description,
            });
            toast.success('Return request submitted');
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">New Return Request</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">You have no orders to return yet.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Select Order</label>
                            <select value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="input-field" required>
                                <option value="">-- Choose an order --</option>
                                {orders.map((o) => (
                                    <option key={o._id} value={o._id}>
                                        {o.orderNumber} — LKR {o.totalPrice.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Reason</label>
                            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input-field">
                                {REASONS.map((r) => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows="3" placeholder="Tell us what happened..." />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? 'Submitting...' : 'Submit Return'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// ─── Edit Modal ────────────────────────────────
function ReturnEditModal({ returnItem, onClose, onSaved }) {
    const [form, setForm] = useState({
        reason: returnItem.reason,
        description: returnItem.description || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/returns/${returnItem._id}`, form);
            toast.success('Return updated');
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">Edit Return</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800">
                    You can edit this return while it's in <strong>Requested</strong> status. Once processed, contact support.
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Reason</label>
                        <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input-field">
                            {REASONS.map((r) => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows="3" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}