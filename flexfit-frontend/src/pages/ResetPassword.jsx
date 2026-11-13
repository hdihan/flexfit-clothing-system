import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        if (password !== confirm) return setError('Passwords do not match');
        setLoading(true);
        try {
            await api.put(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset link is invalid or expired');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = () => {
        if (!password) return null;
        if (password.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-400' };
        if (password.length < 10) return { level: 2, label: 'Fair', color: 'bg-amber-400' };
        return { level: 3, label: 'Strong', color: 'bg-emerald-400' };
    };
    const strength = passwordStrength();

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-brand-50/30">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-brand-500" />
                        <div className="p-8 text-center">
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                                    <CheckCircle2 size={44} className="text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-2">Password reset!</h1>
                            <p className="text-gray-500 text-sm">
                                Your password has been updated successfully.
                                <br />Redirecting you to sign in...
                            </p>
                            <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-brand-500 rounded-full animate-[grow_2.5s_ease-in-out_forwards]" style={{ animation: 'width 2.5s ease-in-out forwards', width: '0%' }} />
                            </div>
                            <Link to="/login" className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand-200 hover:shadow-brand-300 hover:scale-[1.02] transition-all duration-300">
                                Sign in now →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 via-brand-50/30 to-purple-50/30">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors mb-8 group">
                    <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
                    Back to sign in
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-purple-600" />

                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-200 mb-4">
                                <ShieldCheck size={28} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900">Set new password</h1>
                            <p className="text-gray-500 text-sm mt-2 text-center">
                                Choose a strong password you haven't used before.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4 mb-5 flex items-start gap-3">
                                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="reset-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 transition-all outline-none text-sm font-medium"
                                        placeholder="Min 6 characters"
                                        required
                                        minLength={6}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {strength && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex gap-1 flex-1">
                                            {[1, 2, 3].map((l) => (
                                                <div key={l} className={`h-1 flex-1 rounded-full transition-all ${l <= strength.level ? strength.color : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">{strength.label}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="reset-confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium ${
                                            confirm && confirm !== password
                                                ? 'border-red-400 focus:border-red-500'
                                                : confirm && confirm === password
                                                    ? 'border-emerald-400 focus:border-emerald-500'
                                                    : 'border-gray-200 focus:border-brand-500'
                                        }`}
                                        placeholder="Repeat password"
                                        required
                                        minLength={6}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirm && confirm === password && (
                                    <p className="text-emerald-600 text-xs mt-1.5 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Passwords match
                                    </p>
                                )}
                            </div>

                            <button
                                id="reset-submit"
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-lg shadow-brand-200 hover:shadow-brand-300 hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}