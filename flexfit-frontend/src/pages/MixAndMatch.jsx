import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Sparkles, Undo2, Redo2, Bookmark, Palette, X,
} from 'lucide-react';
import api from '../services/api';
import GarmentCatalog from '../components/mix-and-match/GarmentCatalog';
import OutfitCanvas from '../components/mix-and-match/OutfitCanvas';
import OutfitIntelligence from '../components/mix-and-match/OutfitIntelligence';
import OutfitSummary from '../components/mix-and-match/OutfitSummary';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';
import { useConfirm } from '../context/ConfirmContext';

export default function MixAndMatch() {
    const confirm = useConfirm();
    const [searchParams] = useSearchParams();
    const initialGarmentId = searchParams.get('item');

    // Real backend products only
    const [garments, setGarments] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Items active on the virtual canvas
    const [canvasGarments, setCanvasGarments] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);

    // Studio settings
    const [canvasMode, setCanvasMode] = useState('mannequin');
    const [canvasTheme, setCanvasTheme] = useState('studio');
    const [silhouetteType, setSilhouetteType] = useState('female');

    // History for undo / redo
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    // Saved looks
    const [savedLooks, setSavedLooks] = useState([]);
    const [showSavedModal, setShowSavedModal] = useState(false);

    // Mobile tab
    const [mobileTab, setMobileTab] = useState('canvas');

    // Load saved looks from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('flexfit_saved_looks');
            if (stored) setSavedLooks(JSON.parse(stored));
        } catch { /* silent */ }
    }, []);

    // Fetch backend products — this is the ONLY source of truth now
    useEffect(() => {
        const fetchBackendProducts = async () => {
            setLoadingProducts(true);
            try {
                const { data } = await api.get('/products', {
                    params: { limit: 60 },
                });
                if (data?.products?.length > 0) {
                    const formatted = data.products.map((p) => {
                        let defaultZone = 'tops';
                        if (p.category === 'Bottoms') defaultZone = 'bottoms';
                        if (p.category === 'Dresses') defaultZone = 'dresses';
                        if (p.category === 'Outerwear') defaultZone = 'outerwear';
                        if (p.category === 'Footwear') defaultZone = 'footwear';
                        if (p.category === 'Accessories') defaultZone = 'accessories';

                        const defaultPos = {
                            tops: { x: 50, y: 32, scale: 1.0, zIndex: 20 },
                            bottoms: { x: 50, y: 58, scale: 1.0, zIndex: 15 },
                            dresses: { x: 50, y: 44, scale: 1.08, zIndex: 18 },
                            outerwear: { x: 50, y: 35, scale: 1.15, zIndex: 25 },
                            footwear: { x: 50, y: 88, scale: 0.95, zIndex: 12 },
                            accessories: { x: 50, y: 15, scale: 0.8, zIndex: 30 },
                        }[defaultZone] || { x: 50, y: 50, scale: 1.0, zIndex: 20 };

                        return {
                            _id: p._id,
                            name: p.name,
                            category: p.category,
                            price: p.price,
                            images: p.images || [],
                            cutout:
                                p.images?.[0] ||
                                'https://via.placeholder.com/400x533?text=No+Image',
                            colors: p.colors || [],
                            sizes: p.sizes || [{ size: 'M', stock: 10 }],
                            defaultZone,
                            silhouettePos: defaultPos,
                            styleTags: [p.category, 'New Arrival'],
                            description: p.description,
                        };
                    });
                    setGarments(formatted);
                } else {
                    setGarments([]);
                }
            } catch {
                setGarments([]);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchBackendProducts();
    }, []);

    // Auto-add product if ?item=<id> was passed in the URL
    useEffect(() => {
        if (initialGarmentId && garments.length > 0) {
            const found = garments.find(
                (g) =>
                    g._id === initialGarmentId ||
                    g.name.toLowerCase().includes(initialGarmentId.toLowerCase())
            );
            if (found && !canvasGarments.some((c) => c._id === found._id)) {
                handleAddGarmentToCanvas(found);
            }
        }
    }, [initialGarmentId, garments]);

    // ── History ──────────────────────────────────────────────
    const pushHistory = (newCanvas) => {
        setHistory((prev) => [...prev.slice(-15), canvasGarments]);
        setRedoStack([]);
        setCanvasGarments(newCanvas);
    };

    const handleUndo = () => {
        if (!history.length) return;
        const previous = history[history.length - 1];
        setRedoStack((prev) => [...prev, canvasGarments]);
        setHistory((prev) => prev.slice(0, -1));
        setCanvasGarments(previous);
    };

    const handleRedo = () => {
        if (!redoStack.length) return;
        const next = redoStack[redoStack.length - 1];
        setHistory((prev) => [...prev, canvasGarments]);
        setRedoStack((prev) => prev.slice(0, -1));
        setCanvasGarments(next);
    };

    // ── Add garment to canvas ────────────────────────────────
    const handleAddGarmentToCanvas = (garment, dropMeta = null) => {
        if (canvasGarments.some((i) => i._id === garment._id)) {
            setSelectedItemId(garment._id);
            toast('Item already on canvas', { icon: '✨' });
            return;
        }

        const category = garment.category;

        let pos = garment.silhouettePos || { x: 50, y: 50, scale: 1.0, zIndex: 20 };
        if (dropMeta && canvasMode === 'freeform') {
            pos = { x: dropMeta.dropX, y: dropMeta.dropY };
        }

        const newCanvasItem = {
            ...garment,
            selectedSize: garment.sizes?.[0]?.size || 'M',
            selectedColor: garment.colors?.[0] || 'Default',
            scale: garment.silhouettePos?.scale || 1.0,
            rotation: 0,
            zIndex: garment.silhouettePos?.zIndex || 20,
            silhouettePos: garment.silhouettePos || { x: 50, y: 50 },
            freeformPos: dropMeta
                ? { x: dropMeta.dropX, y: dropMeta.dropY }
                : garment.silhouettePos || { x: 50, y: 50 },
        };

        // In mannequin mode, replace overlapping categories
        let updated = [...canvasGarments];
        if (canvasMode === 'mannequin') {
            if (category === 'Dresses') {
                updated = updated.filter(
                    (i) =>
                        i.category !== 'Tops' &&
                        i.category !== 'Bottoms' &&
                        i.category !== 'Dresses'
                );
            } else if (category === 'Tops' || category === 'Bottoms') {
                updated = updated.filter((i) => i.category !== 'Dresses');
                updated = updated.filter((i) => i.category !== category);
            } else {
                updated = updated.filter((i) => i.category !== category);
            }
        }

        updated.push(newCanvasItem);
        pushHistory(updated);
        setSelectedItemId(garment._id);
        toast.success(`Styled with ${garment.name}`);

        if (window.innerWidth < 1024) setMobileTab('canvas');
    };

    const handleRemoveGarment = (id) => {
        const updated = canvasGarments.filter((i) => i._id !== id);
        pushHistory(updated);
        if (selectedItemId === id) setSelectedItemId(null);
    };

    const handleUpdateGarment = (id, updates) => {
        setCanvasGarments((prev) =>
            prev.map((item) => (item._id === id ? { ...item, ...updates } : item))
        );
    };

    const handleClearCanvas = async () => {
        if (!canvasGarments.length) return;
        const ok = await confirm({
            title: 'Clear Canvas?',
            message: 'All garments will be removed from your canvas. Your saved looks will not be affected.',
            confirmLabel: 'Clear Canvas',
            cancelLabel: 'Keep',
            variant: 'warning',
        });
        if (ok) {
            pushHistory([]);
            setSelectedItemId(null);
            toast('Canvas cleared');
        }
    };

    // ── Save / restore looks ─────────────────────────────────
    const handleSaveLook = (name) => {
        const newLook = {
            id: `look-${Date.now()}`,
            name,
            date: new Date().toLocaleDateString(),
            items: canvasGarments,
            totalPrice: canvasGarments.reduce((s, i) => s + i.price, 0),
        };
        const updated = [newLook, ...savedLooks];
        setSavedLooks(updated);
        localStorage.setItem('flexfit_saved_looks', JSON.stringify(updated));
    };

    const handleRestoreLook = (look) => {
        pushHistory(look.items);
        setSelectedItemId(look.items[0]?._id || null);
        setShowSavedModal(false);
        toast.success(`Restored look: ${look.name}`);
    };

    const handleDeleteSavedLook = (id) => {
        const updated = savedLooks.filter((l) => l.id !== id);
        setSavedLooks(updated);
        localStorage.setItem('flexfit_saved_looks', JSON.stringify(updated));
        toast('Saved look removed');
    };

    const activeGarmentIds = new Set(canvasGarments.map((g) => g._id));

    return (
        <div className="min-h-screen bg-gray-50/60 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
                <Breadcrumbs
                    items={[
                        { label: 'Shop', to: '/products' },
                        { label: 'Mix & Match Studio' },
                    ]}
                    fallbackTo="/products"
                    backLabel="Back to Shop"
                    className="mb-2 py-1.5"
                />
            </div>

            {/* ── Top studio header ────────────────────────── */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                                        Virtual Mix &amp; Match Studio
                                    </h1>
                                    <span className="text-[10px] uppercase font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                                        Interactive Preview
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 hidden sm:block">
                                    Drag, snap, and assemble complementary outfits before checkout.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Undo / Redo */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mr-2">
                                <button
                                    type="button"
                                    onClick={handleUndo}
                                    disabled={history.length === 0}
                                    className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 rounded transition"
                                    title="Undo"
                                >
                                    <Undo2 size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRedo}
                                    disabled={redoStack.length === 0}
                                    className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 rounded transition"
                                    title="Redo"
                                >
                                    <Redo2 size={16} />
                                </button>
                            </div>

                            {/* Silhouette toggle */}
                            <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded-lg text-xs">
                                <button
                                    type="button"
                                    onClick={() => setSilhouetteType('female')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                                        silhouetteType === 'female'
                                            ? 'bg-white text-brand-700 shadow-sm font-semibold'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Female Model
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSilhouetteType('male')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                                        silhouetteType === 'male'
                                            ? 'bg-white text-brand-700 shadow-sm font-semibold'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Male Model
                                </button>
                            </div>

                            {/* Backdrop selector */}
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <Palette size={14} className="text-gray-400 ml-1" />
                                {[
                                    { id: 'studio', color: '#f1f5f9', title: 'Studio' },
                                    { id: 'blush', color: '#ffe4e6', title: 'Blush' },
                                    { id: 'loft', color: '#e7e5e4', title: 'Loft' },
                                    { id: 'dark', color: '#18181b', title: 'Editorial Dark' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setCanvasTheme(t.id)}
                                        title={t.title}
                                        style={{ backgroundColor: t.color }}
                                        className={`w-5 h-5 rounded-full border transition ${
                                            canvasTheme === t.id
                                                ? 'ring-2 ring-brand-500 scale-110 border-white'
                                                : 'border-gray-300 opacity-70 hover:opacity-100'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Saved looks */}
                            {savedLooks.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowSavedModal(true)}
                                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                                >
                                    <Bookmark size={14} className="text-brand-600" />
                                    <span>Saved ({savedLooks.length})</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile tabs */}
                    <div className="lg:hidden flex items-center justify-between border-t border-gray-100 mt-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setMobileTab('wardrobe')}
                            className={`flex-1 py-1.5 text-xs font-semibold text-center border-b-2 transition ${
                                mobileTab === 'wardrobe'
                                    ? 'border-brand-600 text-brand-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            👕 Wardrobe ({garments.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab('canvas')}
                            className={`flex-1 py-1.5 text-xs font-semibold text-center border-b-2 transition ${
                                mobileTab === 'canvas'
                                    ? 'border-brand-600 text-brand-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            👗 Canvas ({canvasGarments.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab('stylist')}
                            className={`flex-1 py-1.5 text-xs font-semibold text-center border-b-2 transition ${
                                mobileTab === 'stylist'
                                    ? 'border-brand-600 text-brand-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            ✨ Stylist &amp; Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main workspace ───────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {loadingProducts ? (
                    <div className="py-32">
                        <Loader />
                        <p className="text-center text-sm text-gray-500 -mt-8">
                            Loading your wardrobe...
                        </p>
                    </div>
                ) : garments.length === 0 ? (
                    <div className="py-20 text-center">
                        <Sparkles size={48} className="text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">
                            No products available yet
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                            The Mix &amp; Match studio pulls products directly from the
                            live catalog. Ask a vendor to add products, or check back soon.
                        </p>
                        <Link
                            to="/products"
                            className="btn-primary inline-block mt-6"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Wardrobe */}
                        <div
                            className={`lg:col-span-3 h-[750px] lg:sticky lg:top-36 ${
                                mobileTab === 'wardrobe' ? 'block' : 'hidden lg:block'
                            }`}
                        >
                            <GarmentCatalog
                                garments={garments}
                                activeGarmentIds={activeGarmentIds}
                                onAddGarment={handleAddGarmentToCanvas}
                                onRemoveGarment={handleRemoveGarment}
                            />
                        </div>

                        {/* Canvas */}
                        <div
                            className={`lg:col-span-6 flex flex-col ${
                                mobileTab === 'canvas' ? 'block' : 'hidden lg:block'
                            }`}
                        >
                            <OutfitCanvas
                                canvasItems={canvasGarments}
                                selectedItemId={selectedItemId}
                                onSelectItem={setSelectedItemId}
                                onRemoveItem={handleRemoveGarment}
                                onUpdateItem={handleUpdateGarment}
                                onDropGarment={handleAddGarmentToCanvas}
                                canvasMode={canvasMode}
                                canvasTheme={canvasTheme}
                                silhouetteType={silhouetteType}
                                onClearCanvas={handleClearCanvas}
                            />
                        </div>

                        {/* Stylist */}
                        <div
                            className={`lg:col-span-3 space-y-5 lg:sticky lg:top-36 ${
                                mobileTab === 'stylist' ? 'block' : 'hidden lg:block'
                            }`}
                        >
                            <OutfitIntelligence
                                canvasGarments={canvasGarments}
                                fullCatalog={garments}
                                onAddSuggestedGarment={handleAddGarmentToCanvas}
                            />

                            <OutfitSummary
                                canvasGarments={canvasGarments}
                                onRemoveItem={handleRemoveGarment}
                                onUpdateItem={handleUpdateGarment}
                                onSaveLook={handleSaveLook}
                                onLoadPreset={() => {}}
                                curatedPresets={[]}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Saved looks modal ────────────────────────── */}
            {showSavedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Bookmark size={18} className="text-brand-600" />
                                <h3 className="font-bold text-gray-900 text-base">
                                    Your Saved Looks
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSavedModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {savedLooks.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">
                                No saved looks yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {savedLooks.map((look) => (
                                    <div
                                        key={look.id}
                                        className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-brand-300 transition flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm truncate">
                                                {look.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {look.items.length} pieces • LKR{' '}
                                                {look.totalPrice?.toLocaleString()} •{' '}
                                                {look.date}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                {look.items.slice(0, 4).map((item) => (
                                                    <img
                                                        key={item._id}
                                                        src={item.cutout || item.images?.[0]}
                                                        alt={item.name}
                                                        className="w-8 h-8 rounded-md object-cover border border-gray-200 bg-white"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleRestoreLook(look)}
                                                className="btn-primary text-xs px-3 py-1.5"
                                            >
                                                Load on Canvas
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteSavedLook(look.id)
                                                }
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition"
                                                title="Delete look"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}