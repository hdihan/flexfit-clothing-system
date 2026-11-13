import { useState } from 'react';
import {
    Heart, Plus, Share2, Lock, Globe, Edit2, Trash2,
    X, Check, Copy, ExternalLink, Loader2,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';
import { useConfirm } from '../context/ConfirmContext';

export default function Wishlist() {
    const confirm = useConfirm();
    const {
        wishlists, loading, createWishlist, deleteWishlist,
        updateWishlist, removeItem, toggleShare,
    } = useWishlist();

    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [togglingId, setTogglingId] = useState(null);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        await createWishlist({ name: newName.trim() });
        setNewName('');
        setCreating(false);
    };

    const handleRename = async (id) => {
        if (!editName.trim()) return;
        await updateWishlist(id, { name: editName.trim() });
        setEditingId(null);
    };

    const handleShare = async (w) => {
        setTogglingId(w._id);
        try {
            const updated = await toggleShare(w._id);
            if (updated.isPublic && updated.shareToken) {
                const url = `${window.location.origin}/wishlist/shared/${updated.shareToken}`;
                try {
                    await navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard!');
                } catch {
                    toast.success('Sharing enabled');
                }
            } else {
                toast('Sharing disabled', { icon: '🔒' });
            }
        } finally {
            setTogglingId(null);
        }
    };

    const copyLink = async (token) => {
        const url = `${window.location.origin}/wishlist/shared/${token}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied!');
        } catch {
            toast.error('Copy failed — copy manually');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: 'Shop', to: '/products' },
                    { label: 'My Wishlists' },
                ]}
                fallbackTo="/products"
                backLabel="Back to Shop"
            />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Heart className="text-brand-600" /> My Wishlists
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {wishlists.length} folder{wishlists.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> New Folder
                </button>
            </div>

            {creating && (
                <form onSubmit={handleCreate} className="card p-4 mb-6 flex gap-2">
                    <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Folder name (e.g. Party Outfits, Winter Capsule)"
                        className="input-field flex-1"
                        maxLength={60}
                    />
                    <button type="submit" className="btn-primary">Create</button>
                    <button type="button" onClick={() => setCreating(false)} className="btn-secondary">
                        Cancel
                    </button>
                </form>
            )}

            {wishlists.length === 0 ? (
                <div className="card p-12 text-center">
                    <Heart size={60} className="text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4">No wishlists yet</p>
                    <button onClick={() => setCreating(true)} className="btn-primary mt-4">
                        Create your first folder
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {wishlists.map((w) => {
                        const itemCount = w.items?.length || 0;
                        return (
                            <div key={w._id} className="card p-5">
                                <div className="flex items-center justify-between pb-3 border-b gap-3 flex-wrap">
                                    <div className="min-w-0">
                                        {editingId === w._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="input-field text-sm py-1.5"
                                                    maxLength={60}
                                                />
                                                <button onClick={() => handleRename(w._id)} className="text-emerald-600">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-gray-400">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <h3 className="font-bold text-lg flex items-center gap-2 flex-wrap">
                                                {w.name}
                                                {w.isPublic ? (
                                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                                        <Globe size={11} /> Public
                                                    </span>
                                                ) : (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                                        <Lock size={11} /> Private
                                                    </span>
                                                )}
                                            </h3>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                                            {w.isPublic && ` • ${w.views || 0} view${w.views === 1 ? '' : 's'}`}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {w.isPublic && w.shareToken && (
                                            <>
                                                <a
                                                    href={`/wishlist/shared/${w.shareToken}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center gap-1 transition"
                                                >
                                                    <ExternalLink size={13} /> Preview
                                                </a>
                                                <button
                                                    onClick={() => copyLink(w.shareToken)}
                                                    className="text-xs px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium flex items-center gap-1 transition"
                                                >
                                                    <Copy size={13} /> Copy Link
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleShare(w)}
                                            disabled={togglingId === w._id}
                                            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition disabled:opacity-50 ${
                                                w.isPublic
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {togglingId === w._id ? (
                                                <Loader2 size={13} className="animate-spin" />
                                            ) : (
                                                <Share2 size={13} />
                                            )}
                                            {w.isPublic ? 'Unshare' : 'Share'}
                                        </button>
                                        <button
                                            onClick={() => { setEditingId(w._id); setEditName(w.name); }}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                                            title="Rename"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: `Delete "${w.name}"?`,
                                                    message: 'This wishlist and all its items will be permanently deleted.',
                                                    confirmLabel: 'Delete Wishlist',
                                                    variant: 'danger',
                                                });
                                                if (ok) deleteWishlist(w._id);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                {itemCount === 0 ? (
                                    <p className="text-sm text-gray-500 py-6 text-center">
                                        Empty folder — add products from the shop.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                                        {w.items.map((item) => {
                                            const p = item.product;
                                            if (!p) return null;
                                            return (
                                                <div key={item._id} className="group relative">
                                                    <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                                                        <img
                                                            src={p.images?.[0]}
                                                            alt={p.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <p className="text-sm font-medium mt-2 truncate">{p.name}</p>
                                                    <p className="text-brand-600 font-bold text-sm">
                                                        LKR {p.price?.toLocaleString()}
                                                    </p>
                                                    {item.note && (
                                                        <p className="text-xs text-gray-500 italic mt-1">"{item.note}"</p>
                                                    )}
                                                    <button
                                                        onClick={() => removeItem(w._id, p._id)}
                                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 hover:bg-red-50 text-red-600 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition"
                                                        title="Remove"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}