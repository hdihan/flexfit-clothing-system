import { useState, useRef, useEffect } from 'react';
import {
    Trash2, RotateCw, RotateCcw, ZoomIn, ZoomOut,
    Sparkles, RefreshCw, Download, ArrowUp, ArrowDown, Check,
} from 'lucide-react';
import { getColorHex } from '../ColorPicker';

const LIGHT_COLORS = ['white', 'cream', 'beige', 'blush pink', 'mint', 'sky blue'];

export default function OutfitCanvas({
                                         canvasItems = [],
                                         selectedItemId,
                                         onSelectItem,
                                         onRemoveItem,
                                         onUpdateItem,
                                         onDropGarment,
                                         canvasMode = 'mannequin', // 'mannequin' | 'freeform'
                                         canvasTheme = 'studio', // 'studio' | 'blush' | 'loft' | 'dark'
                                         silhouetteType = 'female', // 'female' | 'male' | 'neutral'
                                         onClearCanvas,
                                     }) {
    const canvasRef = useRef(null);
    const [dragOverZone, setDragOverZone] = useState(null);
    const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Pointer-based dragging state for freeform mode
    const [draggingItem, setDraggingItem] = useState(null);
    const dragStartPos = useRef({ x: 0, y: 0, itemX: 0, itemY: 0 });

    const selectedItem = canvasItems.find((item) => item._id === selectedItemId);

    // Background styles per theme
    const themeStyles = {
        studio:
            'bg-gradient-to-b from-slate-50 via-gray-100 to-slate-200 border-gray-300 text-gray-900',
        blush:
            'bg-gradient-to-b from-pink-50/80 via-rose-50/40 to-amber-50/60 border-pink-200 text-gray-900',
        loft:
            'bg-gradient-to-b from-zinc-100 via-stone-100 to-neutral-200 border-stone-300 text-gray-900 shadow-inner',
        dark:
            'bg-gradient-to-b from-zinc-950 via-neutral-900 to-black border-zinc-800 text-white',
    };

    // Global pointer move & up for smooth freeform dragging
    useEffect(() => {
        const handlePointerMove = (e) => {
            if (!draggingItem || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const deltaX = ((e.clientX - dragStartPos.current.x) / rect.width) * 100;
            const deltaY = ((e.clientY - dragStartPos.current.y) / rect.height) * 100;

            const newX = Math.max(10, Math.min(90, dragStartPos.current.itemX + deltaX));
            const newY = Math.max(8, Math.min(92, dragStartPos.current.itemY + deltaY));

            onUpdateItem(draggingItem._id, {
                freeformPos: { x: Math.round(newX), y: Math.round(newY) },
            });
        };

        const handlePointerUp = () => {
            if (draggingItem) setDraggingItem(null);
        };

        if (draggingItem) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [draggingItem, onUpdateItem]);

    const handlePointerDown = (e, item) => {
        if (canvasMode !== 'freeform') return;
        e.stopPropagation();
        onSelectItem(item._id);
        const rect = canvasRef.current.getBoundingClientRect();
        const currentPos = item.freeformPos || item.silhouettePos || { x: 50, y: 50 };
        dragStartPos.current = {
            x: e.clientX,
            y: e.clientY,
            itemX: currentPos.x,
            itemY: currentPos.y,
        };
        setDraggingItem(item);
    };

    // HTML5 drag & drop handlers for dropping garments from the wardrobe
    const handleCanvasDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (!isCanvasDragOver) setIsCanvasDragOver(true);
    };

    const handleCanvasDragLeave = (e) => {
        if (!canvasRef.current?.contains(e.relatedTarget)) {
            setIsCanvasDragOver(false);
            setDragOverZone(null);
        }
    };

    const handleCanvasDrop = (e) => {
        e.preventDefault();
        setIsCanvasDragOver(false);
        setDragOverZone(null);

        try {
            const raw = e.dataTransfer.getData('application/json');
            if (!raw) return;
            const garment = JSON.parse(raw);
            const rect = canvasRef.current.getBoundingClientRect();
            const dropX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            const dropY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

            onDropGarment(garment, { dropX, dropY, targetZone: dragOverZone });
        } catch (err) {
            console.error('Drop parsing error', err);
        }
    };

    const handleZoneDragEnter = (zone) => setDragOverZone(zone);

    // Download / export Lookbook Card via HTML5 Canvas
    const exportLookbookCard = async () => {
        if (!canvasItems.length) return;
        setIsExporting(true);

        try {
            const exportCanvas = document.createElement('canvas');
            const width = 1200;
            const height = 1500;
            exportCanvas.width = width;
            exportCanvas.height = height;
            const ctx = exportCanvas.getContext('2d');

            // 1. Background gradient
            const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
            if (canvasTheme === 'dark') {
                bgGrad.addColorStop(0, '#0f172a');
                bgGrad.addColorStop(1, '#020617');
            } else if (canvasTheme === 'blush') {
                bgGrad.addColorStop(0, '#fff1f2');
                bgGrad.addColorStop(1, '#fef3c7');
            } else {
                bgGrad.addColorStop(0, '#f8fafc');
                bgGrad.addColorStop(1, '#e2e8f0');
            }
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // 2. Border framing
            ctx.strokeStyle = canvasTheme === 'dark' ? '#334155' : '#cbd5e1';
            ctx.lineWidth = 4;
            ctx.strokeRect(30, 30, width - 60, height - 60);

            // 3. Header
            ctx.fillStyle = canvasTheme === 'dark' ? '#f8fafc' : '#0f172a';
            ctx.font = 'bold 44px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('F L E X F I T', width / 2, 90);

            ctx.font = '500 20px Inter, sans-serif';
            ctx.fillStyle = '#db2777';
            ctx.fillText('VIRTUAL MIX & MATCH STUDIO LOOKBOOK', width / 2, 125);

            ctx.fillStyle = canvasTheme === 'dark' ? '#94a3b8' : '#64748b';
            ctx.font = '16px Inter, sans-serif';
            const dateStr = new Date().toLocaleDateString('en-US', {
                dateStyle: 'long',
            });
            ctx.fillText(
                `Curated on ${dateStr} • Styled Outfit Preview`,
                width / 2,
                155
            );

            // 4. Render images sorted by zIndex
            const sortedItems = [...canvasItems].sort(
                (a, b) => (a.zIndex || 20) - (b.zIndex || 20)
            );

            for (const item of sortedItems) {
                const pos =
                    canvasMode === 'freeform'
                        ? item.freeformPos || item.silhouettePos || { x: 50, y: 50 }
                        : item.silhouettePos || { x: 50, y: 50 };
                const scale = item.scale || 1.0;
                const rotation = item.rotation || 0;

                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = item.cutout || item.images?.[0];
                });

                if (img.width && img.height) {
                    const drawWidth = 320 * scale;
                    const drawHeight = 320 * (img.height / img.width) * scale;
                    const targetX = (pos.x / 100) * width;
                    const targetY = 220 + (pos.y / 100) * (height - 520);

                    ctx.save();
                    ctx.translate(targetX, targetY);
                    if (rotation) ctx.rotate((rotation * Math.PI) / 180);

                    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
                    ctx.shadowBlur = 18;
                    ctx.shadowOffsetY = 10;

                    ctx.drawImage(
                        img,
                        -drawWidth / 2,
                        -drawHeight / 2,
                        drawWidth,
                        drawHeight
                    );
                    ctx.restore();
                }
            }

            // 5. Bottom itemized summary
            const footerY = height - 220;
            ctx.fillStyle =
                canvasTheme === 'dark'
                    ? 'rgba(30, 41, 59, 0.85)'
                    : 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(50, footerY, width - 100, 160);
            ctx.strokeStyle = canvasTheme === 'dark' ? '#334155' : '#e2e8f0';
            ctx.strokeRect(50, footerY, width - 100, 160);

            const total = canvasItems.reduce((sum, i) => sum + i.price, 0);
            ctx.fillStyle = canvasTheme === 'dark' ? '#f8fafc' : '#0f172a';
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(
                `Assembled Outfit (${canvasItems.length} Pieces)`,
                80,
                footerY + 50
            );

            const itemListNames = canvasItems
                .map((i) => i.name)
                .slice(0, 3)
                .join(' • ');
            ctx.font = '18px Inter, sans-serif';
            ctx.fillStyle = canvasTheme === 'dark' ? '#cbd5e1' : '#64748b';
            ctx.fillText(
                itemListNames +
                (canvasItems.length > 3
                    ? ` +${canvasItems.length - 3} more`
                    : ''),
                80,
                footerY + 90
            );

            ctx.textAlign = 'right';
            ctx.fillStyle = '#db2777';
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.fillText(`LKR ${total.toLocaleString()}`, width - 80, footerY + 60);

            ctx.font = '500 16px Inter, sans-serif';
            ctx.fillStyle = canvasTheme === 'dark' ? '#94a3b8' : '#64748b';
            ctx.fillText('Available on FlexFit', width - 80, footerY + 95);

            // 6. Trigger download
            const dataUrl = exportCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `FlexFit-Outfit-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Top toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-b-0 border-gray-200 rounded-t-2xl shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        View:
                    </span>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg">
                        <button
                            type="button"
                            onClick={() => onSelectItem(null)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                                canvasMode === 'mannequin'
                                    ? 'bg-white shadow-sm text-brand-700 font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            👗 Mannequin Fit
                        </button>
                        <button
                            type="button"
                            onClick={() => onSelectItem(null)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                                canvasMode === 'freeform'
                                    ? 'bg-white shadow-sm text-brand-700 font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            🎨 Freeform Board
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canvasItems.length > 0 && (
                        <button
                            type="button"
                            onClick={exportLookbookCard}
                            disabled={isExporting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                            title="Export and download outfit lookbook image"
                        >
                            {isExporting ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <Download size={14} />
                            )}
                            Lookbook Snapshot
                        </button>
                    )}

                    {canvasItems.length > 0 && (
                        <button
                            type="button"
                            onClick={onClearCanvas}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Clear all garments from canvas"
                        >
                            <Trash2 size={13} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Main canvas viewport */}
            <div
                ref={canvasRef}
                onDragOver={handleCanvasDragOver}
                onDragLeave={handleCanvasDragLeave}
                onDrop={handleCanvasDrop}
                onClick={() => onSelectItem(null)}
                className={`relative flex-1 min-h-[580px] lg:min-h-[660px] rounded-b-2xl border transition-all duration-300 overflow-hidden select-none flex items-center justify-center ${
                    themeStyles[canvasTheme] || themeStyles.studio
                } ${
                    isCanvasDragOver ? 'ring-4 ring-brand-500/50 border-brand-500' : ''
                }`}
            >
                {/* Subtle fashion grid / watermark */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Mannequin silhouette (only in mannequin mode) */}
                {canvasMode === 'mannequin' && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <svg
                            viewBox="0 0 400 700"
                            className={`h-[92%] max-w-[85%] transition-opacity duration-300 ${
                                canvasTheme === 'dark'
                                    ? 'text-zinc-800'
                                    : 'text-gray-300/80'
                            }`}
                            fill="currentColor"
                        >
                            {silhouetteType === 'female' ? (
                                <g opacity="0.65">
                                    <circle cx="200" cy="80" r="32" />
                                    <path d="M190 110 h20 v35 h-20 z" />
                                    <path d="M135 155 C165 145 235 145 265 155 C250 210 240 250 250 300 C255 320 255 330 245 350 C235 370 215 375 200 375 C185 375 165 370 155 350 C145 330 145 320 150 300 C160 250 150 210 135 155 Z" />
                                    <path d="M135 155 C120 220 115 280 110 350 C108 370 115 372 122 360 C128 310 135 240 145 170 Z" />
                                    <path d="M265 155 C280 220 285 280 290 350 C292 370 285 372 278 360 C272 310 265 240 255 170 Z" />
                                    <path d="M155 355 C165 410 170 480 175 580 C178 630 172 650 168 665 H195 C198 640 196 580 195 480 C194 430 196 385 198 375 Z" />
                                    <path d="M245 355 C235 410 230 480 225 580 C222 630 228 650 232 665 H205 C202 640 204 580 205 480 C206 430 204 385 202 375 Z" />
                                    <ellipse cx="200" cy="675" rx="70" ry="12" opacity="0.3" />
                                </g>
                            ) : (
                                <g opacity="0.65">
                                    <circle cx="200" cy="75" r="34" />
                                    <path d="M188 108 h24 v38 h-24 z" />
                                    <path d="M120 150 C155 142 245 142 280 150 C270 220 265 270 260 330 C255 360 240 375 200 375 C160 375 145 360 140 330 C135 270 130 220 120 150 Z" />
                                    <path d="M150 375 C158 440 162 520 165 620 L160 665 H195 L192 500 L195 375 Z" />
                                    <path d="M250 375 C242 440 238 520 235 620 L240 665 H205 L208 500 L205 375 Z" />
                                    <ellipse cx="200" cy="675" rx="80" ry="14" opacity="0.3" />
                                </g>
                            )}
                        </svg>
                    </div>
                )}

                {/* Anatomical drop zones (visible while dragging) */}
                {isCanvasDragOver && canvasMode === 'mannequin' && (
                    <div className="absolute inset-0 pointer-events-none z-40 bg-brand-500/10 backdrop-blur-[1px] flex flex-col justify-between p-6">
                        <div
                            onDragEnter={() => handleZoneDragEnter('accessories')}
                            className={`h-20 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                                dragOverZone === 'accessories'
                                    ? 'border-brand-600 bg-brand-500/20 text-brand-700 font-bold scale-[1.02]'
                                    : 'border-brand-300 bg-white/40 text-brand-600'
                            }`}
                        >
                            <span className="text-xs uppercase tracking-wide">
                                ✨ Headwear & Accessories Zone
                            </span>
                        </div>

                        <div
                            onDragEnter={() => handleZoneDragEnter('tops')}
                            className={`h-40 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                                dragOverZone === 'tops' || dragOverZone === 'outerwear'
                                    ? 'border-brand-600 bg-brand-500/20 text-brand-700 font-bold scale-[1.02]'
                                    : 'border-brand-300 bg-white/40 text-brand-600'
                            }`}
                        >
                            <span className="text-xs uppercase tracking-wide">
                                👕 Tops / Outerwear / Dresses Zone
                            </span>
                        </div>

                        <div
                            onDragEnter={() => handleZoneDragEnter('bottoms')}
                            className={`h-40 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                                dragOverZone === 'bottoms'
                                    ? 'border-brand-600 bg-brand-500/20 text-brand-700 font-bold scale-[1.02]'
                                    : 'border-brand-300 bg-white/40 text-brand-600'
                            }`}
                        >
                            <span className="text-xs uppercase tracking-wide">
                                👖 Pants / Skirts / Bottoms Zone
                            </span>
                        </div>

                        <div
                            onDragEnter={() => handleZoneDragEnter('footwear')}
                            className={`h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                                dragOverZone === 'footwear'
                                    ? 'border-brand-600 bg-brand-500/20 text-brand-700 font-bold scale-[1.02]'
                                    : 'border-brand-300 bg-white/40 text-brand-600'
                            }`}
                        >
                            <span className="text-xs uppercase tracking-wide">
                                👟 Shoes & Footwear Zone
                            </span>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {canvasItems.length === 0 && (
                    <div className="z-10 text-center max-w-sm p-6 pointer-events-none">
                        <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-md border border-gray-200 flex items-center justify-center mx-auto mb-4 text-brand-600">
                            <Sparkles size={28} className="animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Your Outfit Canvas
                        </h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Drag &amp; drop garments here from your wardrobe rack or click{' '}
                            <span className="font-semibold text-brand-600">+ Add</span> to
                            start mixing and matching!
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-gray-200 text-[11px] font-medium text-gray-600 shadow-sm">
                            <span>💡 Tip:</span> Layer tops with jackets, shoes, and
                            accessories
                        </div>
                    </div>
                )}

                {/* Garments on canvas */}
                {canvasItems.map((item) => {
                    const isSelected = item._id === selectedItemId;
                    const pos =
                        canvasMode === 'freeform'
                            ? item.freeformPos || item.silhouettePos || { x: 50, y: 50 }
                            : item.silhouettePos || { x: 50, y: 50 };

                    const scale = item.scale || 1.0;
                    const rotation = item.rotation || 0;
                    const zIndex = item.zIndex || 20;

                    let sizeClass = 'w-44 md:w-56';
                    if (item.category === 'Accessories') sizeClass = 'w-24 md:w-32';
                    if (item.category === 'Outerwear') sizeClass = 'w-52 md:w-64';
                    if (item.category === 'Dresses') sizeClass = 'w-48 md:w-60';
                    if (item.category === 'Footwear') sizeClass = 'w-36 md:w-44';

                    return (
                        <div
                            key={item._id}
                            style={{
                                position: 'absolute',
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                                zIndex: isSelected ? 50 : zIndex,
                                touchAction: 'none',
                            }}
                            onPointerDown={(e) => handlePointerDown(e, item)}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectItem(item._id);
                            }}
                            className={`group cursor-grab active:cursor-grabbing transition-transform duration-150 ${sizeClass}`}
                        >
                            <div
                                className={`relative rounded-xl transition-all duration-200 ${
                                    isSelected
                                        ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-transparent shadow-2xl'
                                        : 'hover:ring-1 hover:ring-brand-300'
                                }`}
                            >
                                <img
                                    src={item.cutout || item.images?.[0]}
                                    alt={item.name}
                                    draggable={false}
                                    className="w-full h-auto object-contain filter drop-shadow-xl select-none pointer-events-none"
                                />

                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 bg-brand-600 text-white rounded-full p-1 shadow-md">
                                        <Check size={12} />
                                    </div>
                                )}
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none shadow-md">
                                {item.name}
                            </div>
                        </div>
                    );
                })}

                {/* Floating on-canvas toolbar for selected garment */}
                {selectedItem && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-3 flex flex-wrap items-center gap-3 max-w-[94%] text-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    >
                        {/* Name + price */}
                        <div className="flex items-center gap-2 border-r border-gray-200 pr-3">
                            <span className="text-xs font-bold text-gray-900 truncate max-w-[130px]">
                                {selectedItem.name}
                            </span>
                            <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                                LKR {selectedItem.price?.toLocaleString()}
                            </span>
                        </div>

                        {/* Size picker */}
                        {selectedItem.sizes?.length > 0 && (
                            <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
                                <span className="text-[10px] uppercase font-bold text-gray-400">
                                    Size:
                                </span>
                                <div className="flex gap-1">
                                    {selectedItem.sizes.map((s) => (
                                        <button
                                            key={s.size}
                                            type="button"
                                            onClick={() =>
                                                onUpdateItem(selectedItem._id, {
                                                    selectedSize: s.size,
                                                })
                                            }
                                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                                (
                                                    selectedItem.selectedSize ||
                                                    selectedItem.sizes[0]?.size
                                                ) === s.size
                                                    ? 'bg-brand-600 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {s.size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color selector — uses getColorHex */}
                        {selectedItem.colors?.length > 0 && (
                            <div className="flex items-center gap-1.5 border-r border-gray-200 pr-3">
                                <span className="text-[10px] uppercase font-bold text-gray-400">
                                    Color:
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {selectedItem.colors.map((c) => {
                                        const hex = getColorHex(c);
                                        const isCurrent =
                                            (
                                                selectedItem.selectedColor ||
                                                selectedItem.colors[0]
                                            ) === c;
                                        const isLight = LIGHT_COLORS.includes(
                                            c.toLowerCase()
                                        );
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() =>
                                                    onUpdateItem(selectedItem._id, {
                                                        selectedColor: c,
                                                    })
                                                }
                                                title={c}
                                                aria-label={c}
                                                style={{ backgroundColor: hex }}
                                                className={`w-5 h-5 rounded-full border relative transition-transform ${
                                                    isCurrent
                                                        ? 'ring-2 ring-brand-500 ring-offset-1 scale-110 border-white'
                                                        : 'border-gray-300 hover:scale-105'
                                                } ${isLight ? 'shadow-inner' : ''}`}
                                            >
                                                {isCurrent && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                isLight
                                                                    ? 'bg-gray-700'
                                                                    : 'bg-white'
                                                            }`}
                                                        />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Zoom / scale */}
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
                            <button
                                type="button"
                                onClick={() => {
                                    const currentScale = selectedItem.scale || 1.0;
                                    onUpdateItem(selectedItem._id, {
                                        scale: Math.max(0.75, currentScale - 0.08),
                                    });
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title="Scale down"
                            >
                                <ZoomOut size={15} />
                            </button>
                            <span className="text-[11px] font-mono w-9 text-center text-gray-500">
                                {Math.round((selectedItem.scale || 1.0) * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const currentScale = selectedItem.scale || 1.0;
                                    onUpdateItem(selectedItem._id, {
                                        scale: Math.min(1.4, currentScale + 0.08),
                                    });
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title="Scale up"
                            >
                                <ZoomIn size={15} />
                            </button>
                        </div>

                        {/* Rotation */}
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
                            <button
                                type="button"
                                onClick={() => {
                                    const r = (selectedItem.rotation || 0) - 8;
                                    onUpdateItem(selectedItem._id, { rotation: r });
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title="Rotate counter-clockwise"
                            >
                                <RotateCcw size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    onUpdateItem(selectedItem._id, { rotation: 0 })
                                }
                                className="text-[10px] px-1.5 py-0.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                                title="Reset rotation"
                            >
                                0°
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const r = (selectedItem.rotation || 0) + 8;
                                    onUpdateItem(selectedItem._id, { rotation: r });
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title="Rotate clockwise"
                            >
                                <RotateCw size={15} />
                            </button>
                        </div>

                        {/* Layer ordering */}
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
                            <button
                                type="button"
                                onClick={() => {
                                    const currentZ = selectedItem.zIndex || 20;
                                    onUpdateItem(selectedItem._id, {
                                        zIndex: currentZ + 1,
                                    });
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title="Bring layer forward"
                            >
                                <ArrowUp size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const currentZ = selectedItem.zIndex || 20;
                                    onUpdateItem(selectedItem._id, {
                                        zIndex: Math.max(5, currentZ - 1),
                                    });
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                title="Send layer backward"
                            >
                                <ArrowDown size={15} />
                            </button>
                        </div>

                        {/* Remove */}
                        <button
                            type="button"
                            onClick={() => onRemoveItem(selectedItem._id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition ml-auto"
                            title="Remove from outfit"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}