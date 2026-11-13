import { useEffect, useState } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import {
    Users, Package, ShoppingBag, RotateCcw,
    Plus, Edit2, Trash2, X, Loader2, Save, Upload, Tag, Megaphone
} from 'lucide-react';
import api, { uploadImages } from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import ColorPicker from '../components/ColorPicker';

const TABS = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'banners', label: 'Banners', icon: Megaphone },
];

import PromotionsTab from '../components/PromotionsTab';
import PromoBannersTab from '../components/PromoBannersTab';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminDashboard() {
    const [tab, setTab] = useState('users');
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Premium Header ── */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Admin Dashboard' },
                        ]}
                        fallbackTo="/"
                        backLabel="Exit to Store"
                        className="border-b border-gray-700/80 mb-5 py-2 text-gray-300 [&_a]:text-gray-300 [&_span]:text-white [&_button]:bg-gray-800 [&_button]:text-gray-200 [&_button]:border-gray-700 [&_button:hover]:bg-gray-700"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-white/20">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                Administrator Panel
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
                            <p className="text-gray-400 mt-1 text-sm">Manage users, products, orders, returns & promotions</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[80px]">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">System</p>
                                <p className="text-sm font-bold text-emerald-400 mt-0.5">Online</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Tab Navigation ── */}
                    <div className="flex gap-1 mt-6 overflow-x-auto scrollbar-none pb-px">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                                    tab === id
                                        ? 'bg-white text-gray-900 shadow-lg shadow-black/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {tab === 'users' && <UsersTab />}
                {tab === 'products' && <ProductsTab />}
                {tab === 'orders' && <OrdersTab />}
                {tab === 'returns' && <ReturnsTab />}
                {tab === 'promotions' && <PromotionsTab />}
                {tab === 'banners' && <PromoBannersTab />}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════
function UsersTab() {
    const confirm = useConfirm();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data.users);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const del = async (id, name) => {
        const ok = await confirm({
            title: 'Delete User Account?',
            message: `"${name}"'s account will be permanently deleted. This action cannot be undone.`,
            confirmLabel: 'Delete User',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const save = async (form) => {
        try {
            if (form._id) await api.put(`/admin/users/${form._id}`, form);
            else await api.post('/admin/users', form);
            toast.success('Saved');
            setEditing(null);
            setCreating(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="card p-6">
            <div className="flex justify-between mb-4">
                <h2 className="font-bold text-lg">All Users ({users.length})</h2>
                <button
                    onClick={() => setCreating(true)}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> Add User
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Created</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => (
                        <tr key={u._id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{u.name}</td>
                            <td className="p-3 text-gray-600">{u.email}</td>
                            <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            u.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : u.role === 'vendor'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {u.role}
                                    </span>
                            </td>
                            <td className="p-3">
                                    <span
                                        className={`text-xs ${
                                            u.isActive ? 'text-green-600' : 'text-red-500'
                                        }`}
                                    >
                                        {u.isActive ? '● Active' : '● Inactive'}
                                    </span>
                            </td>
                            <td className="p-3 text-gray-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-right space-x-2">
                                <button
                                    onClick={() => setEditing(u)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => del(u._id, u.name)}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={u.role === 'admin'}
                                    title={u.role === 'admin' ? 'Admin accounts cannot be deleted' : 'Delete user'}
                                >
                                    <Trash2
                                        size={16}
                                        className={u.role === 'admin' ? 'opacity-30' : ''}
                                    />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {(editing || creating) && (
                <UserModal
                    user={editing}
                    onClose={() => {
                        setEditing(null);
                        setCreating(false);
                    }}
                    onSave={save}
                />
            )}
        </div>
    );
}

function UserModal({ user, onClose, onSave }) {
    const [form, setForm] = useState(
        user || { name: '', email: '', password: '', role: 'customer', isActive: true }
    );
    const [saving, setSaving] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold">{user ? 'Edit User' : 'Create User'}</h3>
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field"
                        placeholder="Name"
                        required
                    />
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-field"
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={form.password || ''}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="input-field"
                        placeholder={user ? 'New password (blank = keep)' : 'Password'}
                        required={!user}
                    />
                    <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="input-field"
                    >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        Active
                    </label>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════
function ProductsTab() {
    const confirm = useConfirm();
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [p, u] = await Promise.all([
                api.get('/admin/products'),
                api.get('/admin/users'),
            ]);
            setProducts(p.data.products);
            setVendors(u.data.users.filter((x) => x.role === 'vendor'));
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const del = async (id, name) => {
        const ok = await confirm({
            title: 'Delete Product?',
            message: `"${name}" will be permanently removed from the catalog.`,
            confirmLabel: 'Delete Product',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast.success('Product deleted successfully');
            load();
        } catch {
            toast.error('Failed to delete product');
        }
    };

    const save = async (form) => {
        try {
            if (form._id) {
                await api.put(`/admin/products/${form._id}`, form);
                toast.success('Product updated');
            } else {
                await api.post('/products', form);
                toast.success('Product created');
            }
            setEditing(null);
            setCreating(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="card p-6">
            <div className="flex justify-between mb-4">
                <h2 className="font-bold text-lg">All Products ({products.length})</h2>
                <button
                    onClick={() => setCreating(true)}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> Add Product
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="p-3">Image</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Vendor</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((p) => (
                        <tr key={p._id} className="border-b hover:bg-gray-50">
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
                            <td className="p-3 font-medium">{p.name}</td>
                            <td className="p-3 text-gray-600">
                                {p.vendor?.storeName || '-'}
                            </td>
                            <td className="p-3">{p.category}</td>
                            <td className="p-3">LKR {p.price.toLocaleString()}</td>
                            <td
                                className={`p-3 font-medium ${
                                    p.totalStock < 5 ? 'text-red-500' : ''
                                }`}
                            >
                                {p.totalStock}
                            </td>
                            <td className="p-3 text-right space-x-2">
                                <button
                                    onClick={() => setEditing(p)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => del(p._id, p.name)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {editing && (
                <ProductEditModal
                    product={editing}
                    onClose={() => setEditing(null)}
                    onSave={save}
                />
            )}
            {creating && (
                <ProductCreateModal
                    vendors={vendors}
                    onClose={() => setCreating(false)}
                    onSave={save}
                />
            )}
        </div>
    );
}

// ─── Shared multi-image uploader hook ───────────────────────────
// Reused by both ProductEditModal and ProductCreateModal
function useMultiImageState(initialImages = []) {
    const [existingImages, setExistingImages] = useState(initialImages);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);

    const totalImages = existingImages.length + newFiles.length;

    const addFiles = (picked) => {
        if (!picked.length) return { accepted: 0, rejected: 0 };

        const tooBig = picked.find((f) => f.size > 5 * 1024 * 1024);
        if (tooBig) {
            toast.error(`"${tooBig.name}" exceeds 5 MB`);
            return { accepted: 0, rejected: picked.length };
        }

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

        return { accepted: accepted.length, rejected: picked.length - accepted.length };
    };

    const removeExisting = (idx) =>
        setExistingImages((prev) => prev.filter((_, i) => i !== idx));

    const removeNew = (idx) => {
        URL.revokeObjectURL(newPreviews[idx]);
        setNewFiles((prev) => prev.filter((_, i) => i !== idx));
        setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const moveExistingToFront = (idx) => {
        const copy = [...existingImages];
        const [moved] = copy.splice(idx, 1);
        setExistingImages([moved, ...copy]);
    };

    const moveNewToFront = (idx) => {
        const filesCopy = [...newFiles];
        const prevCopy = [...newPreviews];
        const [movedFile] = filesCopy.splice(idx, 1);
        const [movedPrev] = prevCopy.splice(idx, 1);
        setNewFiles([movedFile, ...filesCopy]);
        setNewPreviews([movedPrev, ...prevCopy]);
    };

    return {
        existingImages,
        newFiles,
        newPreviews,
        totalImages,
        addFiles,
        removeExisting,
        removeNew,
        moveExistingToFront,
        moveNewToFront,
    };
}

// ─── Reusable multi-image grid UI ───────────────────────────────
function MultiImageUploader({
                                existingImages,
                                newPreviews,
                                totalImages,
                                onAddFiles,
                                onRemoveExisting,
                                onRemoveNew,
                                onMoveExistingToFront,
                                onMoveNewToFront,
                            }) {
    const handleFileChange = (e) => {
        const picked = Array.from(e.target.files || []);
        onAddFiles(picked);
        e.target.value = ''; // allow re-selecting the same file
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">
                    Product Images <span className="text-gray-400">({totalImages}/6)</span>
                </label>
                <span className="text-[11px] text-gray-500">First image is the cover</span>
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
                                        onClick={() => onMoveExistingToFront(idx)}
                                        className="text-[10px] bg-white text-gray-800 px-2 py-1 rounded font-semibold hover:bg-gray-100"
                                        title="Make cover"
                                    >
                                        Set Cover
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onRemoveExisting(idx)}
                                    className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                                    title="Remove"
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
                                {!(existingImages.length === 0 && idx === 0) && (
                                    <button
                                        type="button"
                                        onClick={() => onMoveNewToFront(idx)}
                                        className="text-[10px] bg-white text-gray-800 px-2 py-1 rounded font-semibold hover:bg-gray-100"
                                        title="Make cover"
                                    >
                                        Set Cover
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onRemoveNew(idx)}
                                    className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                                    title="Remove"
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
                            {totalImages === 0 ? 'Click to upload images' : 'Add more images'}
                        </span>
                    </div>
                </label>
            )}
            <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WEBP or GIF • Max 5 MB each • Up to 6 images
            </p>
        </div>
    );
}

// ─── Product Edit Modal ─────────────────────────────────────────
function ProductEditModal({ product, onClose, onSave }) {
    const [form, setForm] = useState({ ...product });
    const [colors, setColors] = useState(product.colors || []);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const img = useMultiImageState(product.images || []);

    const submit = async (e) => {
        e.preventDefault();

        if (colors.length === 0) {
            return toast.error('Please select at least one available color');
        }

        setSaving(true);
        try {
            let uploadedUrls = [];
            if (img.newFiles.length > 0) {
                setUploading(true);
                uploadedUrls = await uploadImages(img.newFiles);
                setUploading(false);
            }

            const allImages = [...img.existingImages, ...uploadedUrls];

            if (allImages.length === 0) {
                toast.error('Please keep at least one image');
                setSaving(false);
                return;
            }

            await onSave({ ...form, images: allImages, colors });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold">Edit Product</h3>
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={submit} className="space-y-3">
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field"
                        required
                    />
                    <textarea
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                        className="input-field"
                        rows="2"
                    />
                    <input
                        type="number"
                        value={form.price}
                        onChange={(e) =>
                            setForm({ ...form, price: Number(e.target.value) })
                        }
                        className="input-field"
                        placeholder="Price (LKR)"
                        required
                    />

                    {/* NEW: Color picker */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <ColorPicker colors={colors} onChange={setColors} max={8} />
                    </div>

                    <MultiImageUploader
                        existingImages={img.existingImages}
                        newPreviews={img.newPreviews}
                        totalImages={img.totalImages}
                        onAddFiles={img.addFiles}
                        onRemoveExisting={img.removeExisting}
                        onRemoveNew={img.removeNew}
                        onMoveExistingToFront={img.moveExistingToFront}
                        onMoveNewToFront={img.moveNewToFront}
                    />

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) =>
                                setForm({ ...form, isActive: e.target.checked })
                            }
                        />
                        Active (visible in catalog)
                    </label>
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {(saving || uploading) && (
                            <Loader2 className="animate-spin" size={18} />
                        )}
                        {uploading
                            ? 'Uploading images...'
                            : saving
                                ? 'Saving...'
                                : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── Product Create Modal ───────────────────────────────────────
function ProductCreateModal({ vendors, onClose, onSave }) {
    const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];
    const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const [form, setForm] = useState({
        name: '',
        description: '',
        category: 'Tops',
        price: '',
        vendorId: '',
    });
    const [sizes, setSizes] = useState(SIZES.map((s) => ({ size: s, stock: 0 })));
    const [colors, setColors] = useState([]);          // ← NEW
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const img = useMultiImageState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.vendorId) return toast.error('Please select a vendor');
        if (img.totalImages === 0) return toast.error('Please add at least one image');
        if (colors.length === 0) return toast.error('Please select at least one color');

        setSaving(true);
        try {
            let uploadedUrls = [];
            if (img.newFiles.length > 0) {
                setUploading(true);
                uploadedUrls = await uploadImages(img.newFiles);
                setUploading(false);
            }

            const allImages = [...img.existingImages, ...uploadedUrls];

            await onSave({
                vendor: form.vendorId,
                name: form.name,
                description: form.description,
                category: form.category,
                price: Number(form.price),
                images: allImages,
                sizes,
                colors,          // ← vendor-controlled
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold">Create Product</h3>
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {vendors.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">
                        No vendors registered yet.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Vendor</label>
                            <select
                                value={form.vendorId}
                                onChange={(e) =>
                                    setForm({ ...form, vendorId: e.target.value })
                                }
                                className="input-field"
                                required
                            >
                                <option value="">-- Select a vendor --</option>
                                {vendors.map((v) => (
                                    <option key={v._id} value={v._id}>
                                        {v.name} ({v.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-field"
                            placeholder="Product name"
                            required
                        />
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className="input-field"
                            rows="2"
                            placeholder="Description"
                            required
                        />

                        <div className="grid grid-cols-2 gap-3">
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
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) =>
                                    setForm({ ...form, price: e.target.value })
                                }
                                className="input-field"
                                placeholder="Price (LKR)"
                                required
                            />
                        </div>

                        {/* NEW: Color picker */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <ColorPicker colors={colors} onChange={setColors} max={8} />
                        </div>

                        <MultiImageUploader
                            existingImages={img.existingImages}
                            newPreviews={img.newPreviews}
                            totalImages={img.totalImages}
                            onAddFiles={img.addFiles}
                            onRemoveExisting={img.removeExisting}
                            onRemoveNew={img.removeNew}
                            onMoveExistingToFront={img.moveExistingToFront}
                            onMoveNewToFront={img.moveNewToFront}
                        />

                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Stock by Size
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {sizes.map((s, i) => (
                                    <div key={s.size}>
                                        <label className="text-xs text-gray-500">
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
                        </div>

                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="btn-primary w-full flex justify-center items-center gap-2"
                        >
                            {(saving || uploading) && (
                                <Loader2 className="animate-spin" size={18} />
                            )}
                            {uploading
                                ? 'Uploading images...'
                                : saving
                                    ? 'Creating...'
                                    : 'Create Product'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// ORDERS TAB
// ═══════════════════════════════════════════════════════════════
function OrdersTab() {
    const confirm = useConfirm();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/orders');
            setOrders(data.orders);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/orders/${id}`, { status });
            toast.success('Order status updated');
            load();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const del = async (id, num) => {
        const ok = await confirm({
            title: 'Delete Order?',
            message: `Order #${num} will be permanently removed. This action cannot be undone.`,
            confirmLabel: 'Delete Order',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/admin/orders/${id}`);
            toast.success('Order deleted successfully');
            load();
        } catch {
            toast.error('Failed to delete order');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">All Orders ({orders.length})</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="p-3">Order #</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map((o) => (
                        <tr key={o._id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{o.orderNumber}</td>
                            <td className="p-3 text-gray-600">{o.user?.name}</td>
                            <td className="p-3">
                                LKR {o.totalPrice.toLocaleString()}
                            </td>
                            <td className="p-3">
                                <select
                                    value={o.status}
                                    onChange={(e) =>
                                        updateStatus(o._id, e.target.value)
                                    }
                                    className="input-field py-1 text-xs"
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
                            </td>
                            <td className="p-3 text-gray-500">
                                {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-right">
                                <button
                                    onClick={() => del(o._id, o.orderNumber)}
                                    className="text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// RETURNS TAB
// ═══════════════════════════════════════════════════════════════
function ReturnsTab() {
    const confirm = useConfirm();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/returns');
            setReturns(data.returns);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const update = async (id, status) => {
        try {
            await api.put(`/admin/returns/${id}`, { status });
            toast.success('Return status updated');
            load();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const del = async (id, num) => {
        const ok = await confirm({
            title: 'Delete Return Request?',
            message: `Return #${num} will be permanently removed. This action cannot be undone.`,
            confirmLabel: 'Delete Return',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/admin/returns/${id}`);
            toast.success('Return deleted successfully');
            load();
        } catch {
            toast.error('Failed to delete return');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">All Returns ({returns.length})</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                    <tr>
                        <th className="p-3">Return #</th>
                        <th className="p-3">Order</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3">Refund</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {returns.map((r) => (
                        <tr key={r._id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{r.returnNumber}</td>
                            <td className="p-3 text-gray-600">
                                {r.order?.orderNumber}
                            </td>
                            <td className="p-3">{r.user?.name}</td>
                            <td className="p-3">{r.reason}</td>
                            <td className="p-3">
                                LKR {r.refundAmount?.toLocaleString()}
                            </td>
                            <td className="p-3">
                                <select
                                    value={r.status}
                                    onChange={(e) => update(r._id, e.target.value)}
                                    className="input-field py-1 text-xs"
                                >
                                    {[
                                        'Requested',
                                        'Approved',
                                        'Rejected',
                                        'In Transit',
                                        'Received',
                                        'Refunded',
                                    ].map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="p-3 text-right">
                                <button
                                    onClick={() => del(r._id, r.returnNumber)}
                                    className="text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}