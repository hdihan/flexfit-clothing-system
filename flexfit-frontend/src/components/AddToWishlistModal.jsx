import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, Plus, Check, Loader2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function AddToWishlistModal({ product, onClose }) {
    const { wishlists, addItem, createWishlist } = useWishlist();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [busyId, setBusyId] = useState(null);

    // Guard: not logged in → send to login
    if (!user) {
        onClose?.();
        navigate('/login');
        return null;
    }

    const productId = product._id;
    const alreadyIn = new Set(
        wishlists
            .filter((w) =>
                w.items?.some(
                    (i) => (i.product?._id || i.product)?.toString() === productId
                )
            )
            .map((w) => w._id)
    );

    const handleAdd = async (wishlistId) => {
        setBusyId(wishlistId);
        try { await addItem(wishlistId, productId); onClose(); }
        catch { /* toast in context */ }
        finally { setBusyId(null); }
    };

    const handleCreateAndAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setBusyId('new');
        try {
            const wl = await createWishlist({ name: newName.trim() });
            await addItem(wl._id, productId);
            onClose();
        } catch { /* toast */ }
        finally { setBusyId(null); }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Heart className="text-brand-600" size={20} /> Save to Wishlist
                    </h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                    <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover bg-white"
                    />
                    <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-brand-600 font-bold text-sm">
                            LKR {product.price?.toLocaleString()}
                        </p>
                    </div>
                </div>

                {wishlists.length === 0 && !creating && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No wishlists yet — create your first one below!
                    </p>
                )}

                {wishlists.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {wishlists.map((w) => {
                            const already = alreadyIn.has(w._id);
                            return (
                                <button
                                    key={w._id}
                                    type="button"
                                    disabled={already || busyId === w._id}
                                    onClick={() => handleAdd(w._id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                                        already
                                            ? 'bg-emerald-50 border-emerald-200 cursor-default'
                                            : 'bg-white border-gray-200 hover:border-brand-400 hover:bg-brand-50/40'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{w.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {w.items?.length || 0} item{(w.items?.length || 0) !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    {busyId === w._id ? (
                                        <Loader2 size={18} className="animate-spin text-brand-600" />
                                    ) : already ? (
                                        <Check size={18} className="text-emerald-600" />
                                    ) : (
                                        <Plus size={18} className="text-brand-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {creating ? (
                    <form onSubmit={handleCreateAndAdd} className="flex gap-2">
                        <input
                            autoFocus
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. Summer Capsule"
                            className="input-field flex-1 text-sm"
                            maxLength={60}
                        />
                        <button
                            type="submit"
                            disabled={busyId === 'new'}
                            className="btn-primary text-sm px-3"
                        >
                            {busyId === 'new' ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                        </button>
                    </form>
                ) : (
                    <button
                        type="button"
                        onClick={() => setCreating(true)}
                        className="w-full py-2.5 border-2 border-dashed border-gray-300 hover:border-brand-500 hover:bg-brand-50/50 rounded-xl text-sm font-medium text-gray-700 transition flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> New Wishlist Folder
                    </button>
                )}
            </div>
        </div>
    );
}