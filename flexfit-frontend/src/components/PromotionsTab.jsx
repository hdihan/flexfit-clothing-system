import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Loader2, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from './Loader';
import { useConfirm } from '../context/ConfirmContext';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];

export default function PromotionsTab() {
    const confirm = useConfirm();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/promotions');
            setPromotions(data.promotions);
        } catch {
            toast.error('Failed to load promotions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const del = async (id, code) => {
        const ok = await confirm({
            title: 'Delete Promotion?',
            message: `Promotion code "${code}" will be permanently removed and can no longer be redeemed.`,
            confirmLabel: 'Delete Promotion',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/promotions/${id}`);
            toast.success(`Promotion "${code}" deleted successfully`);
            load();
        } catch {
            toast.error('Failed to delete promotion');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="card p-6 mt-6">
            <div className="flex justify-between mb-4">
                <h2 className="font-bold text-lg">Promotions ({promotions.length})</h2>
                <button onClick={() => setEditing({})} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={16} /> Add Promotion
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-3">Code</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Discount</th>
                            <th className="p-3">Valid From</th>
                            <th className="p-3">Valid Until</th>
                            <th className="p-3">Usage</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map((p) => (
                            <tr key={p._id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-bold">{p.code}</td>
                                <td className="p-3">{p.category || 'All'}</td>
                                <td className="p-3">
                                    {p.discountType === 'percentage' ? `${p.discountValue}%` : `LKR ${p.discountValue}`}
                                </td>
                                <td className="p-3">{new Date(p.validFrom).toLocaleDateString()}</td>
                                <td className="p-3">{new Date(p.validUntil).toLocaleDateString()}</td>
                                <td className="p-3">{p.usedCount} {p.usageLimit ? `/ ${p.usageLimit}` : ''}</td>
                                <td className="p-3">
                                    <span className={`text-xs ${p.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                        {p.isActive ? '● Active' : '● Inactive'}
                                    </span>
                                </td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => setEditing(p)} className="text-blue-600 hover:text-blue-800">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => del(p._id, p.code)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {promotions.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center p-4 text-gray-500">No promotions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editing && (
                <PromotionModal promotion={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
            )}
        </div>
    );
}

function PromotionModal({ promotion, onClose, onSaved }) {
    const isEdit = !!promotion?._id;
    const [form, setForm] = useState({
        code: promotion?.code || '',
        description: promotion?.description || '',
        discountType: promotion?.discountType || 'percentage',
        discountValue: promotion?.discountValue || '',
        validFrom: promotion?.validFrom ? new Date(promotion.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        validUntil: promotion?.validUntil ? new Date(promotion.validUntil).toISOString().split('T')[0] : '',
        usageLimit: promotion?.usageLimit || '',
        category: promotion?.category || 'All'
    });
    const [saving, setSaving] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined
            };

            if (isEdit) {
                await api.put(`/promotions/${promotion._id}`, payload);
                toast.success('Promotion updated');
            } else {
                await api.post('/promotions', payload);
                toast.success('Promotion created');
            }
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold">{isEdit ? 'Edit Promotion' : 'Create Promotion'}</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field uppercase" placeholder="PROMOCODE" required />
                    <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Description (Optional)" />
                    
                    <div className="grid grid-cols-2 gap-3">
                        <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input-field">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                        <input type="number" min="0" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input-field" placeholder="Discount Value" required />
                    </div>

                    <div>
                        <label className="text-xs font-medium mb-1 block">Category</label>
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1 block">Valid From</label>
                            <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Valid Until</label>
                            <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="input-field" required />
                        </div>
                    </div>

                    <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input-field" placeholder="Usage Limit (Optional)" />

                    <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
    );
}
