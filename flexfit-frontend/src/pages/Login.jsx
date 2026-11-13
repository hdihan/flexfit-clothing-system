import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!form.email) e.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
        if (!form.password) e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const data = await login(form.email, form.password);
            if (data.role === 'admin') navigate('/admin');
            else if (data.role === 'vendor') navigate('/vendor');
            else navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left decorative panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-purple-700 items-center justify-center p-12">
                {/* Animated blobs */}
                <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-brand-300/20 rounded-full blur-2xl animate-pulse delay-500" />

                <div className="relative z-10 text-white text-center max-w-sm">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30">
                        <span className="text-4xl font-black text-white">F</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4 leading-tight">
                        Welcome back to<br />
                        <span className="text-brand-200">FlexFit</span>
                    </h2>
                    <p className="text-white/70 text-lg leading-relaxed">
                        Your premium fashion marketplace — where style meets convenience.
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                        {[['500+', 'Products'], ['50+', 'Vendors'], ['10K+', 'Happy Customers']].map(([num, label]) => (
                            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <p className="text-2xl font-black text-white">{num}</p>
                                <p className="text-xs text-white/60 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Back to store navigation */}
                    <div className="mb-6">
                        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors group">
                            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
                            Back to Store
                        </Link>
                    </div>

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-xl font-black text-white">F</span>
                        </div>
                        <span className="text-2xl font-black text-gray-900">FlexFit</span>
                    </div>

                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-brand-100">
                            <Sparkles size={12} />
                            Welcome back
                        </div>
                        <h1 className="text-3xl font-black text-gray-900">Sign in to your account</h1>
                        <p className="text-gray-500 mt-2">Don't have an account?{' '}
                            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                                Create one free →
                            </Link>
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        id="login-email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium ${
                                            errors.email
                                                ? 'border-red-400 focus:border-red-500'
                                                : 'border-gray-200 focus:border-brand-500'
                                        }`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span>⚠</span> {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                                    <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="login-password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium ${
                                            errors.password
                                                ? 'border-red-400 focus:border-red-500'
                                                : 'border-gray-200 focus:border-brand-500'
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span>⚠</span> {errors.password}
                                    </p>
                                )}
                            </div>

                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-lg shadow-brand-200 hover:shadow-brand-300 hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed mt-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}