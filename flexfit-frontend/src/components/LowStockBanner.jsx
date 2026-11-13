import { useState } from 'react';
import { AlertTriangle, PackageX, ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LowStockBanner({ alerts = [], onDismiss }) {
    const [expanded, setExpanded] = useState(false);

    if (!alerts.length) return null;

    const outCount = alerts.filter((a) => a.severity === 'out').length;
    const lowCount = alerts.length - outCount;
    const hasOut = outCount > 0;

    // Show at most 3 items when collapsed, all when expanded
    const visible = expanded ? alerts : alerts.slice(0, 3);

    return (
        <div
            className={`rounded-2xl border p-4 mb-6 ${
                hasOut
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            hasOut ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}
                    >
                        {hasOut ? <PackageX size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3
                            className={`font-bold text-sm ${
                                hasOut ? 'text-red-900' : 'text-amber-900'
                            }`}
                        >
                            {hasOut
                                ? `⚠️ ${outCount} size${outCount > 1 ? 's' : ''} out of stock`
                                : `Low stock on ${lowCount} variant${lowCount > 1 ? 's' : ''}`}
                            {hasOut && lowCount > 0 && ` • ${lowCount} running low`}
                        </h3>
                        <p
                            className={`text-xs mt-0.5 ${
                                hasOut ? 'text-red-700' : 'text-amber-700'
                            }`}
                        >
                            Replenish soon to avoid losing sales.
                        </p>

                        {/* Alert list */}
                        <div className="mt-3 space-y-1.5">
                            {visible.map((a) => (
                                <div
                                    key={`${a.productId}-${a.size}`}
                                    className="flex items-center gap-2.5 bg-white/70 border border-white rounded-lg p-2"
                                >
                                    {a.image ? (
                                        <img
                                            src={a.image}
                                            alt={a.name}
                                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-900 truncate">
                                            {a.name}
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            Size <strong>{a.size}</strong> • stock{' '}
                                            <strong
                                                className={
                                                    a.severity === 'out'
                                                        ? 'text-red-600'
                                                        : 'text-amber-600'
                                                }
                                            >
                                                {a.stock}
                                            </strong>{' '}
                                            (threshold {a.threshold})
                                        </p>
                                    </div>
                                    <Link
                                        to="/vendor"
                                        className="text-[11px] font-semibold text-brand-600 hover:underline whitespace-nowrap flex items-center gap-0.5"
                                    >
                                        Edit <ExternalLink size={10} />
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Expand / collapse */}
                        {alerts.length > 3 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-2 text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1"
                            >
                                {expanded ? (
                                    <>
                                        <ChevronUp size={13} /> Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={13} /> Show {alerts.length - 3} more
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-lg flex-shrink-0"
                        title="Dismiss"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}