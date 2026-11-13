import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Loader2, Save, Calendar, Megaphone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from './Loader';
import { useConfirm } from '../context/ConfirmContext';

const GRADIENTS = [
    { label: 'Christmas Red/Green', value: 'from-red-600 to-emerald-700' },
    { label: 'Festive Purple/Pink', value: 'from-purple-600 to-pink-600' },
    { label: 'Black Friday Dark', value: 'from-gray-900 to-black' },
    { label: 'Summer Orange/Yellow', value: 'from-amber-500 to-orange-600' },
    { label: 'Brand Pink/Purple', value: 'from-brand-600 to-purple-700' },
    { label: 'Ocean Blue/Cyan', value: 'from-blue-600 to-cyan-500' },
];

export default function PromoBannersTab() {
    const confirm = useConfirm();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/banners/manage');
            setBanners(data.banners);
        } catch {
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const del = async (id) => {
        const ok = await confirm({
            title: 'Delete Banner?',
            message: 'This promotional banner will be permanently removed from the customer site.',
            confirmLabel: 'Delete Banner',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/banners/${id}`);
            toast.success('Banner deleted');
            load();
        } catch {
            toast.error('Failed to delete banner');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="card p-6">
            <div className="flex justify-between mb-4 items-center">
                <div>
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Megaphone size={20} className="text-brand-600" /> Promotional Banners ({banners.length})
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Seasonal offers displayed on the homepage</p>
                </div>
                <button onClick={() => setEditing({})} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={16} /> Create Banner
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="p-3">Preview</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Schedule</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {banners.map((b) => {
                        const isLive = b.isActive && new Date(b.startDate) <= new Date() && new Date(b.endDate) >= new Date();
                        return (
                            <tr key={b._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    <div className={`w-24 h-12 rounded-lg bg-gradient-to-r ${b.bgGradient} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                                        {b.emoji} {b.title.slice(0, 10)}...
                                    </div>
                                </td>
                                <td className="p-3 font-medium">{b.title}</td>
                                <td className="p-3 text-xs text-gray-600">
                                    {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                    {isLive ? (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">● LIVE</span>
                                    ) : b.isActive ? (
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">● Scheduled</span>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">● Inactive</span>
                                    )}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => setEditing(b)} className="text-blue-600 hover:text-blue-800">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => del(b._id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {banners.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center p-8 text-gray-500">
                                No banners created yet. Click "Create Banner" to launch a seasonal offer!
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {editing && (
                <BannerModal banner={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
            )}
        </div>
    );
}

function BannerModal({ banner, onClose, onSaved }) {
    const isEdit = !!banner?._id;
    const [form, setForm] = useState({
        title: banner?.title || '',
        subtitle: banner?.subtitle || '',
        ctaText: banner?.ctaText || 'Shop Now',
        ctaLink: banner?.ctaLink || '/products',
        bgGradient: banner?.bgGradient || GRADIENTS[0].value,
        emoji: banner?.emoji || '🎉',
        isActive: banner?.isActive ?? true,
        priority: banner?.priority || 0,
        startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // default 7 days
    });
    const [saving, setSaving] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/banners/${banner._id}`, form);
                toast.success('Banner updated');
            } else {
                await api.post('/banners', form);
                toast.success('Banner created');
            }
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save banner');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold">{isEdit ? 'Edit Banner' : 'Create Promotional Banner'}</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Live Preview */}
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${form.bgGradient} text-white text-center shadow-inner`}>
                        <div className="text-3xl mb-1">{form.emoji}</div>
                        <h4 className="font-bold text-lg">{form.title || 'Banner Title'}</h4>
                        {form.subtitle && <p className="text-xs text-white/80">{form.subtitle}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1 block">Title</label>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Christmas Sale!" required />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Emoji</label>
                            <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="input-field text-center" placeholder="🎄" maxLength={2} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium mb-1 block">Subtitle</label>
                        <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" placeholder="Up to 50% off on all winter wear" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1 block">Button Text</label>
                            <input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="input-field" placeholder="Shop Now" />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Button Link</label>
                            <input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="input-field" placeholder="/products" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium mb-1 block">Background Theme</label>
                        <select value={form.bgGradient} onChange={(e) => setForm({ ...form, bgGradient: e.target.value })} className="input-field">
                            {GRADIENTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium mb-1 block">Start Date</label>
                            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">End Date</label>
                            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" required />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-brand-600 rounded" />
                            <span className="font-medium">Active</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 font-medium">Priority:</label>
                            <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="input-field w-16 text-center py-1" title="Higher number shows first" />
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center items-center gap-2 mt-4">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save Banner'}
                    </button>
                </form>
            </div>
        </div>
    );
}