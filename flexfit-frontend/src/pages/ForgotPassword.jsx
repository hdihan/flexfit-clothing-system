import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 via-brand-50/30 to-purple-50/30">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back link */}
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to sign in
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
                    {/* Top accent bar */}
                    <div className="h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-purple-600" />

                    <div className="p-8">
                        {sent ? (
                            <div className="text-center py-4">
                                {/* Success animation */}
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                                        <CheckCircle2 size={44} className="text-white" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-black text-gray-900 mb-2">Check your inbox!</h1>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    We sent a reset link to <span className="font-bold text-gray-800">{email}</span>.
                                    <br />It expires in <span className="text-brand-600 font-semibold">15 minutes</span>.
                                </p>
                                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                                    <p className="text-xs text-amber-700 font-medium">📧 Didn't receive the email?</p>
                                    <p className="text-xs text-amber-600 mt-1">Check your spam/junk folder or{' '}
                                        <button onClick={() => setSent(false)} className="font-bold underline hover:text-amber-800 transition-colors">
                                            try again with a different email
                                        </button>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Icon header */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-200 mb-4">
                                        <Mail size={28} className="text-white" />
                                    </div>
                                    <h1 className="text-2xl font-black text-gray-900">Forgot your password?</h1>
                                    <p className="text-gray-500 text-sm mt-2 text-center">
                                        No worries! Enter your email and we'll send you a reset link.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="forgot-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 transition-all outline-none text-sm font-medium"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        id="forgot-submit"
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-lg shadow-brand-200 hover:shadow-brand-300 hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <Send size={18} />
                                        )}
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>

                                <p className="text-center text-sm text-gray-500 mt-6">
                                    Remembered it?{' '}
                                    <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}