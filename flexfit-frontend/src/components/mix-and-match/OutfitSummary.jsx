import { useState } from 'react';
import { ShoppingBag, Bookmark, Trash2, Check, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OutfitSummary({
    canvasGarments = [],
    onRemoveItem,
    onUpdateItem,
    onSaveLook,
    onLoadPreset,
    curatedPresets = [],
}) {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addingToCart, setAddingToCart] = useState(false);
    const [savedLookName, setSavedLookName] = useState('');
    const [showSaveInput, setShowSaveInput] = useState(false);

    const subtotal = canvasGarments.reduce((sum, item) => sum + (item.price || 0), 0);

    const handleAddEntireOutfit = async () => {
        if (!canvasGarments.length) {
            toast.error('Your canvas is empty! Add garments to assemble an outfit.');
            return;
        }

        if (!user) {
            // Save state in localStorage so after logging in, shopper doesn't lose outfit
            localStorage.setItem('pendingOutfit', JSON.stringify(canvasGarments));
            toast('Please sign in to add your outfit to cart', { icon: '🔐' });
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        try {
            for (const item of canvasGarments) {
                const chosenSize = item.selectedSize || item.sizes?.[0]?.size || 'M';
                const chosenColor = item.selectedColor || item.colors?.[0] || 'Default';
                await addToCart(item._id, chosenSize, chosenColor, 1);
            }
            toast.success(`✨ All ${canvasGarments.length} outfit pieces added to your cart!`);
        } catch (err) {
            console.error('Batch cart add error', err);
            toast.error('Failed to add some items to cart.');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleSaveLookSubmit = (e) => {
        e.preventDefault();
        if (!savedLookName.trim()) return;
        onSaveLook(savedLookName.trim());
        setSavedLookName('');
        setShowSaveInput(false);
        toast.success('Outfit saved to your curated looks!');
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                        <ShoppingBag size={15} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Outfit Breakdown</h3>
                        <p className="text-[11px] text-gray-500">
                            {canvasGarments.length} item{canvasGarments.length !== 1 ? 's' : ''} on canvas
                        </p>
                    </div>
                </div>

                {canvasGarments.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowSaveInput(!showSaveInput)}
                        className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition"
                    >
                        <Bookmark size={13} /> Save Look
                    </button>
                )}
            </div>

            {/* Save Look Input Form */}
            {showSaveInput && (
                <form onSubmit={handleSaveLookSubmit} className="p-3 bg-brand-50/50 rounded-xl border border-brand-200 space-y-2">
                    <label className="text-xs font-semibold text-gray-700 block">Name your saved outfit:</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={savedLookName}
                            onChange={(e) => setSavedLookName(e.target.value)}
                            placeholder="e.g. Saturday Night City Look"
                            className="input-field text-xs py-1.5 flex-1"
                            autoFocus
                        />
                        <button type="submit" className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
                            Save
                        </button>
                    </div>
                </form>
            )}

            {/* Assembled Garment Items List */}
            {canvasGarments.length === 0 ? (
                <div className="text-center py-6 px-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 font-medium">No garments selected yet</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                        Drag items from the left rack to see their breakdown and pricing here.
                    </p>
                </div>
            ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {canvasGarments.map((item) => {
                        const chosenSize = item.selectedSize || item.sizes?.[0]?.size || 'M';
                        const chosenColor = item.selectedColor || item.colors?.[0] || 'Default';

                        return (
                            <div
                                key={item._id}
                                className="flex items-center gap-3 p-2 bg-gray-50/80 rounded-xl border border-gray-100 group"
                            >
                                <img
                                    src={item.cutout || item.images?.[0]}
                                    alt={item.name}
                                    className="w-11 h-11 object-cover rounded-lg bg-white border border-gray-200 flex-shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold text-gray-900 truncate">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                                        {/* Size dropdown */}
                                        {item.sizes?.length > 0 ? (
                                            <select
                                                value={chosenSize}
                                                onChange={(e) => onUpdateItem(item._id, { selectedSize: e.target.value })}
                                                className="bg-white border border-gray-200 rounded px-1 py-0.5 text-[10px] font-semibold text-gray-700"
                                            >
                                                {item.sizes.map((s) => (
                                                    <option key={s.size} value={s.size}>
                                                        Size {s.size}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>One Size</span>
                                        )}

                                        <span>•</span>

                                        {/* Color dropdown */}
                                        {item.colors?.length > 0 ? (
                                            <select
                                                value={chosenColor}
                                                onChange={(e) => onUpdateItem(item._id, { selectedColor: e.target.value })}
                                                className="bg-white border border-gray-200 rounded px-1 py-0.5 text-[10px] font-semibold text-gray-700 truncate max-w-[90px]"
                                            >
                                                {item.colors.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>Standard</span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <span className="text-xs font-bold text-gray-900 block">
                                        LKR {item.price?.toLocaleString()}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveItem(item._id)}
                                        className="text-gray-400 hover:text-red-500 transition mt-1 inline-block"
                                        title="Remove item"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Total & Bundle Promo */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Outfit Subtotal:</span>
                    <span className="font-semibold text-gray-900">LKR {subtotal.toLocaleString()}</span>
                </div>

                {canvasGarments.length >= 2 && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800">
                        <Sparkles size={15} className="text-emerald-600 flex-shrink-0" />
                        <span>
                            <strong>Mix & Match Bundle:</strong> Free shipping + guaranteed fit support applied!
                        </span>
                    </div>
                )}

                <div className="flex items-baseline justify-between pt-1">
                    <span className="text-sm font-bold text-gray-900">Total Outfit:</span>
                    <span className="text-xl font-extrabold text-brand-600">
                        LKR {subtotal.toLocaleString()}
                    </span>
                </div>

                {/* Primary Button: Add Complete Outfit to Cart */}
                <button
                    type="button"
                    onClick={handleAddEntireOutfit}
                    disabled={addingToCart || canvasGarments.length === 0}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-brand-500/20 transition-all hover:shadow-lg disabled:opacity-50"
                >
                    {addingToCart ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Adding Outfit...
                        </>
                    ) : (
                        <>
                            <ShoppingBag size={18} />
                            Add Entire Outfit to Cart ({canvasGarments.length})
                        </>
                    )}
                </button>
            </div>

            {/* Curated Presets Quick Selector */}
            {curatedPresets.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-wider">
                        ✨ Quick-Load Curated Styles
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        {curatedPresets.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => onLoadPreset(preset)}
                                className="p-2 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-brand-50 hover:border-brand-300 text-left transition group"
                            >
                                <span className="text-xs font-bold text-gray-800 group-hover:text-brand-700 block truncate">
                                    {preset.name}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-0.5 block truncate">
                                    {preset.vibe} • {preset.harmonyScore}% match
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
