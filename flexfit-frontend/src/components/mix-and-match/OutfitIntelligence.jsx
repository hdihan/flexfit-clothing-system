import { Sparkles, CheckCircle2, Circle, Plus, Lightbulb } from 'lucide-react';
import { analyzeOutfitHarmony } from '../../data/mixMatchData';
import { getColorHex } from '../ColorPicker';

export default function OutfitIntelligence({
                                               canvasGarments = [],
                                               fullCatalog = [],
                                               onAddSuggestedGarment,
                                           }) {
    const analysis = analyzeOutfitHarmony(canvasGarments, fullCatalog);
    const { score, status, grade, advice, colors, missingEssentials, pairSuggestions } =
        analysis;

    let strokeColor = '#ec4899';
    if (score >= 90) strokeColor = '#10b981';
    else if (score >= 75) strokeColor = '#3b82f6';
    else if (score >= 50) strokeColor = '#f59e0b';

    const categories = new Set(canvasGarments.map((g) => g.category));
    const hasTopOrDress = categories.has('Tops') || categories.has('Dresses');
    const hasBottom = categories.has('Bottoms') || categories.has('Dresses');
    const hasFootwear = categories.has('Footwear');
    const hasOuterOrAcc = categories.has('Outerwear') || categories.has('Accessories');

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Sparkles size={15} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">
                        Outfit Harmony &amp; AI Stylist
                    </h3>
                </div>
                {canvasGarments.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {grade}
                    </span>
                )}
            </div>

            {/* Harmony score gauge */}
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-rose-50/40 rounded-xl border border-purple-100/80">
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-gray-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            strokeDasharray={`${score}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke={strokeColor}
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-extrabold text-gray-900 leading-none">
                            {score}%
                        </span>
                        <span className="text-[8px] uppercase tracking-tighter text-gray-500 mt-0.5">
                            Match
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">{status}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-snug line-clamp-2">
                        {advice}
                    </p>
                </div>
            </div>

            {/* Completeness checklist */}
            <div>
                <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">
                    Completeness Checklist
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                        className={`flex items-center gap-1.5 p-2 rounded-lg border ${
                            hasTopOrDress
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                    >
                        {hasTopOrDress ? (
                            <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                        ) : (
                            <Circle size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">Top / Dress</span>
                    </div>

                    <div
                        className={`flex items-center gap-1.5 p-2 rounded-lg border ${
                            hasBottom
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                    >
                        {hasBottom ? (
                            <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                        ) : (
                            <Circle size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">Bottoms</span>
                    </div>

                    <div
                        className={`flex items-center gap-1.5 p-2 rounded-lg border ${
                            hasFootwear
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                    >
                        {hasFootwear ? (
                            <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                        ) : (
                            <Circle size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">Footwear</span>
                    </div>

                    <div
                        className={`flex items-center gap-1.5 p-2 rounded-lg border ${
                            hasOuterOrAcc
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                    >
                        {hasOuterOrAcc ? (
                            <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                        ) : (
                            <Circle size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">Outer / Acc</span>
                    </div>
                </div>
            </div>

            {/* Active color palette */}
            {colors.length > 0 && (
                <div>
                    <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
                        Outfit Color Harmony
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {colors.map((c, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px]"
                            >
                                <span
                                    style={{ backgroundColor: getColorHex(c.name) }}
                                    className="w-3 h-3 rounded-full border border-gray-300 shadow-inner"
                                />
                                <span className="font-medium text-gray-700">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pair suggestions */}
            {pairSuggestions?.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider flex items-center gap-1">
                            <Lightbulb size={12} /> Stylist Recommendations:
                        </span>
                        <span className="text-[10px] text-gray-400">
                            Complete this look
                        </span>
                    </div>

                    <div className="space-y-2">
                        {pairSuggestions.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-brand-50/50 border border-gray-100 hover:border-brand-200 transition group"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                        src={item.cutout || item.images?.[0]}
                                        alt={item.name}
                                        className="w-10 h-10 object-cover rounded-lg bg-white border border-gray-200"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {item.category} • LKR{' '}
                                            {item.price?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onAddSuggestedGarment(item)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white text-brand-600 border border-brand-200 hover:bg-brand-600 hover:text-white transition flex items-center gap-1 shadow-sm whitespace-nowrap"
                                >
                                    <Plus size={13} /> Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}