import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

/**
 * Common fashion colors. `hex` is only used for the swatch preview —
 * the DB stores just the name as a string.
 */
export const PRESET_COLORS = [
    { name: 'Black',        hex: '#0f172a' },
    { name: 'Charcoal',     hex: '#334155' },
    { name: 'Gray',         hex: '#9ca3af' },
    { name: 'White',        hex: '#ffffff' },
    { name: 'Cream',        hex: '#fffdd0' },
    { name: 'Beige',        hex: '#f5f5dc' },
    { name: 'Sand',         hex: '#e6cca0' },
    { name: 'Tan',          hex: '#d2b48c' },
    { name: 'Brown',        hex: '#78350f' },
    { name: 'Chocolate',    hex: '#5a3825' },
    { name: 'Navy',         hex: '#1e3a8a' },
    { name: 'Sky Blue',     hex: '#0ea5e9' },
    { name: 'Denim Blue',   hex: '#3b82f6' },
    { name: 'Teal',         hex: '#0d9488' },
    { name: 'Olive',        hex: '#65a30d' },
    { name: 'Emerald Green',hex: '#047857' },
    { name: 'Sage',         hex: '#9caf88' },
    { name: 'Mint',         hex: '#a7f3d0' },
    { name: 'Yellow',       hex: '#eab308' },
    { name: 'Mustard',      hex: '#d97706' },
    { name: 'Orange',       hex: '#ea580c' },
    { name: 'Crimson',      hex: '#991b1b' },
    { name: 'Red',          hex: '#dc2626' },
    { name: 'Dusty Rose',   hex: '#d88198' },
    { name: 'Blush Pink',   hex: '#fbcfe8' },
    { name: 'Pink',         hex: '#ec4899' },
    { name: 'Lavender',     hex: '#c4b5fd' },
    { name: 'Purple',       hex: '#9333ea' },
];

/**
 * Look up the hex for a given color name — used by the swatch preview
 * anywhere in the app (chip, thumbnail, product card, etc).
 * Falls back to neutral gray for custom names we don't recognize.
 */
export const getColorHex = (name) => {
    if (!name) return '#cbd5e1';
    const found = PRESET_COLORS.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    return found?.hex || '#cbd5e1';
};

export default function ColorPicker({ colors = [], onChange, max = 8 }) {
    const [customName, setCustomName] = useState('');

    const isSelected = (name) =>
        colors.some((c) => c.toLowerCase() === name.toLowerCase());

    const togglePreset = (name) => {
        if (isSelected(name)) {
            onChange(colors.filter((c) => c.toLowerCase() !== name.toLowerCase()));
        } else if (colors.length < max) {
            onChange([...colors, name]);
        }
    };

    const addCustom = (e) => {
        e.preventDefault();
        const name = customName.trim();
        if (!name) return;
        if (colors.length >= max) return;
        if (isSelected(name)) {
            setCustomName('');
            return;
        }
        onChange([...colors, name]);
        setCustomName('');
    };

    const remove = (name) =>
        onChange(colors.filter((c) => c !== name));

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">
                    Available Colors{' '}
                    <span className="text-gray-400">
                        ({colors.length}/{max})
                    </span>
                </label>
                {colors.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onChange([])}
                        className="text-[11px] text-red-500 hover:underline font-medium"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Selected chips */}
            {colors.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {colors.map((c) => (
                        <span
                            key={c}
                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full pl-1 pr-2 py-1 text-xs font-medium text-gray-800 shadow-sm"
                        >
                            <span
                                style={{ backgroundColor: getColorHex(c) }}
                                className="w-4 h-4 rounded-full border border-gray-300 shadow-inner"
                            />
                            {c}
                            <button
                                type="button"
                                onClick={() => remove(c)}
                                className="text-gray-400 hover:text-red-500 transition"
                                title={`Remove ${c}`}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic mb-2">
                    No colors selected — pick from the palette below or add a custom one.
                </p>
            )}

            {/* Preset palette */}
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {PRESET_COLORS.map(({ name, hex }) => {
                    const selected = isSelected(name);
                    return (
                        <button
                            key={name}
                            type="button"
                            onClick={() => togglePreset(name)}
                            title={name}
                            disabled={!selected && colors.length >= max}
                            style={{ backgroundColor: hex }}
                            className={`relative aspect-square rounded-lg border-2 transition-all hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 ${
                                selected
                                    ? 'border-brand-600 ring-2 ring-brand-300'
                                    : 'border-gray-300 hover:border-gray-500'
                            } ${name === 'White' || name === 'Cream' ? 'shadow-inner' : ''}`}
                        >
                            {selected && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <Check
                                        size={14}
                                        className={
                                            name === 'White' || name === 'Cream'
                                                ? 'text-gray-700'
                                                : 'text-white'
                                        }
                                        strokeWidth={3}
                                    />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Custom color input */}
            <form onSubmit={addCustom} className="flex gap-2 mt-2">
                <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Custom color, e.g. Dusty Lavender"
                    maxLength={30}
                    className="input-field text-sm flex-1"
                    disabled={colors.length >= max}
                />
                <button
                    type="submit"
                    disabled={!customName.trim() || colors.length >= max}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
                >
                    <Plus size={14} /> Add
                </button>
            </form>
        </div>
    );
}