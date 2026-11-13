import { useState } from 'react';
import { Search, Sparkles, Plus, Check, Filter, X, GripVertical } from 'lucide-react';
import { getColorHex } from '../ColorPicker';

const CATEGORIES = [
    { label: 'All', value: 'All' },
    { label: 'Tops', value: 'Tops', icon: '👕' },
    { label: 'Bottoms', value: 'Bottoms', icon: '👖' },
    { label: 'Dresses', value: 'Dresses', icon: '👗' },
    { label: 'Outerwear', value: 'Outerwear', icon: '🧥' },
    { label: 'Footwear', value: 'Footwear', icon: '👟' },
    { label: 'Accessories', value: 'Accessories', icon: '👜' },
];

// Colors that need an inner shadow so they don't disappear on white bg
const LIGHT_COLORS = ['white', 'cream', 'beige', 'blush pink', 'mint', 'sky blue'];

export default function GarmentCatalog({
                                           garments = [],
                                           activeGarmentIds = new Set(),
                                           onAddGarment,
                                           onRemoveGarment,
                                       }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    // Extract unique colors for filter
    const availableColors = Array.from(
        new Set(garments.flatMap((g) => g.colors || []))
    ).slice(0, 10);

    const filteredGarments = garments.filter((g) => {
        const matchesCategory =
            selectedCategory === 'All' || g.category === selectedCategory;
        const matchesSearch =
            !searchQuery ||
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.styleTags?.some((t) =>
                t.toLowerCase().includes(searchQuery.toLowerCase())
            );
        const matchesColor = !selectedColor || g.colors?.includes(selectedColor);
        return matchesCategory && matchesSearch && matchesColor;
    });

    const handleDragStart = (e, garment) => {
        e.dataTransfer.setData('application/json', JSON.stringify(garment));
        e.dataTransfer.effectAllowed = 'copy';

        // Custom drag ghost preview
        const dragGhost = document.createElement('div');
        dragGhost.style.position = 'absolute';
        dragGhost.style.top = '-1000px';
        dragGhost.style.padding = '8px 14px';
        dragGhost.style.background = '#18181b';
        dragGhost.style.color = '#ffffff';
        dragGhost.style.borderRadius = '9999px';
        dragGhost.style.fontSize = '12px';
        dragGhost.style.fontWeight = '600';
        dragGhost.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.4)';
        dragGhost.textContent = `✨ Dragging ${garment.name}`;
        document.body.appendChild(dragGhost);
        e.dataTransfer.setDragImage(dragGhost, 20, 20);
        setTimeout(() => document.body.removeChild(dragGhost), 0);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header & Search */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/70">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                            <Sparkles size={14} />
                        </div>
                        <h2 className="font-bold text-gray-900 text-sm">
                            Wardrobe Catalog
                        </h2>
                    </div>
                    <span className="text-[11px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {filteredGarments.length} pieces
                    </span>
                </div>

                {/* Search Input */}
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={15}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search garments, styles..."
                        className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.value;
                        return (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition flex items-center gap-1 ${
                                    isSelected
                                        ? 'bg-brand-600 text-white shadow-sm'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {cat.icon && <span>{cat.icon}</span>}
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Color Filter Chips */}
                {availableColors.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                        <span className="text-[10px] uppercase font-bold text-gray-400 mr-1 flex items-center gap-0.5">
                            <Filter size={10} /> Color:
                        </span>
                        {selectedColor && (
                            <button
                                type="button"
                                onClick={() => setSelectedColor('')}
                                className="text-[10px] text-brand-600 hover:underline mr-1 font-semibold"
                            >
                                All
                            </button>
                        )}
                        {availableColors.map((color) => {
                            const isSelected = selectedColor === color;
                            const hex = getColorHex(color);
                            const isLight = LIGHT_COLORS.includes(color.toLowerCase());
                            return (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(isSelected ? '' : color)}
                                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition flex items-center gap-1 ${
                                        isSelected
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <span
                                        style={{ backgroundColor: hex }}
                                        className={`w-2.5 h-2.5 rounded-full border border-gray-300 inline-block ${
                                            isLight ? 'shadow-inner' : ''
                                        }`}
                                    />
                                    {color}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Drag & Drop Hint */}
            <div className="bg-brand-50/70 border-b border-brand-100/60 px-3 py-1.5 flex items-center justify-between text-[11px] text-brand-700">
                <span className="flex items-center gap-1">
                    <GripVertical size={13} className="text-brand-500 animate-pulse" />
                    <strong>Drag</strong> item onto canvas or click <strong>+</strong>
                </span>
                <span className="text-[10px] bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded font-mono">
                    Live Drop
                </span>
            </div>

            {/* Garment Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-gray-100">
                {filteredGarments.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <p className="text-gray-400 text-xs">
                            No garments match your filters
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory('All');
                                setSearchQuery('');
                                setSelectedColor('');
                            }}
                            className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    filteredGarments.map((garment) => {
                        const isOnCanvas = activeGarmentIds.has(garment._id);

                        return (
                            <div
                                key={garment._id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, garment)}
                                className={`pt-2.5 first:pt-0 group flex items-center gap-3 p-2 rounded-xl transition-all cursor-grab active:cursor-grabbing border ${
                                    isOnCanvas
                                        ? 'bg-brand-50/40 border-brand-200 ring-1 ring-brand-300'
                                        : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50/80 hover:shadow-sm'
                                }`}
                            >
                                {/* Drag handle */}
                                <div className="text-gray-300 group-hover:text-gray-500 cursor-grab transition">
                                    <GripVertical size={16} />
                                </div>

                                {/* Thumbnail */}
                                <div className="relative w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200/80">
                                    <img
                                        src={garment.cutout || garment.images?.[0]}
                                        alt={garment.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    {isOnCanvas && (
                                        <div className="absolute inset-0 bg-brand-600/20 backdrop-blur-[0.5px] flex items-center justify-center">
                                            <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md">
                                                <Check size={12} />
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Garment details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                            {garment.category}
                                        </span>
                                        {isOnCanvas && (
                                            <span className="text-[9px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.2 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-xs font-semibold text-gray-900 truncate mt-0.5">
                                        {garment.name}
                                    </h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs font-bold text-brand-600">
                                            LKR {garment.price?.toLocaleString()}
                                        </span>

                                        {/* Mini color previews — uses real hex lookup */}
                                        {garment.colors?.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                {garment.colors
                                                    .slice(0, 3)
                                                    .map((col) => {
                                                        const hex = getColorHex(col);
                                                        const isLight =
                                                            LIGHT_COLORS.includes(
                                                                col.toLowerCase()
                                                            );
                                                        return (
                                                            <span
                                                                key={col}
                                                                title={col}
                                                                style={{
                                                                    backgroundColor: hex,
                                                                }}
                                                                className={`w-2.5 h-2.5 rounded-full border border-gray-300 inline-block ${
                                                                    isLight
                                                                        ? 'shadow-inner'
                                                                        : ''
                                                                }`}
                                                            />
                                                        );
                                                    })}
                                                {garment.colors.length > 3 && (
                                                    <span className="text-[9px] text-gray-400 font-medium">
                                                        +{garment.colors.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Add / Remove action */}
                                <div>
                                    {isOnCanvas ? (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveGarment(garment._id)}
                                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition text-xs"
                                            title="Remove from canvas"
                                        >
                                            <X size={15} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => onAddGarment(garment)}
                                            className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white flex items-center justify-center transition shadow-sm text-xs"
                                            title="Add to canvas"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}