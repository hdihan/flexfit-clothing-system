import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmContext = createContext(null);

/**
 * Wrap your app with this provider to enable useConfirm() everywhere.
 */
export function ConfirmProvider({ children }) {
    const [state, setState] = useState({
        open: false,
        title: '',
        message: '',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        variant: 'danger',   // 'danger' | 'warning' | 'info'
    });

    const resolverRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        if (!state.open) return;
        const handler = (e) => { if (e.key === 'Escape') handleCancel(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [state.open]);

    const confirm = useCallback(({ title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', variant = 'danger' }) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setState({ open: true, title, message, confirmLabel, cancelLabel, variant });
        });
    }, []);

    const handleConfirm = () => {
        setState(s => ({ ...s, open: false }));
        resolverRef.current?.(true);
    };

    const handleCancel = () => {
        setState(s => ({ ...s, open: false }));
        resolverRef.current?.(false);
    };

    const variantStyles = {
        danger:  { icon: <Trash2 size={22} />,        iconBg: 'bg-red-100',    iconColor: 'text-red-600',    btn: 'bg-red-600 hover:bg-red-700 shadow-red-200' },
        warning: { icon: <AlertTriangle size={22} />, iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' },
        info:    { icon: <AlertTriangle size={22} />, iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' },
    };

    const v = variantStyles[state.variant] || variantStyles.danger;

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}

            {/* ── Modal Overlay ── */}
            {state.open && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ animation: 'cfOverlayIn 0.18s ease' }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={handleCancel}
                    />

                    {/* Dialog Card */}
                    <div
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-gray-900/25 overflow-hidden"
                        style={{ animation: 'cfCardIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top accent bar */}
                        <div className={`h-1 w-full ${state.variant === 'danger' ? 'bg-gradient-to-r from-red-500 to-rose-600' : state.variant === 'warning' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />

                        {/* Close button */}
                        <button
                            onClick={handleCancel}
                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <X size={16} />
                        </button>

                        {/* Body */}
                        <div className="px-6 pt-5 pb-6">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-2xl ${v.iconBg} ${v.iconColor} flex items-center justify-center mb-4`}>
                                {v.icon}
                            </div>

                            {/* Title */}
                            <h2 className="text-base font-bold text-gray-900 mb-1.5">
                                {state.title}
                            </h2>

                            {/* Message */}
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                {state.message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                                >
                                    {state.cancelLabel}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${v.btn}`}
                                >
                                    {state.confirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyframe animations injected once */}
            <style>{`
                @keyframes cfOverlayIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes cfCardIn    { from { opacity: 0; transform: scale(0.88) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
            `}</style>
        </ConfirmContext.Provider>
    );
}

/**
 * Hook — returns an async confirm function.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title: 'Delete Product?', message: '...', variant: 'danger' });
 *   if (!ok) return;
 */
export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
    return ctx;
}
