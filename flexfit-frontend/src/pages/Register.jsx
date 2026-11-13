import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ShoppingBag, Store, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'customer' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
        if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
        if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.role);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = () => {
        if (!form.password) return null;
        if (form.password.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-400' };
        if (form.password.length < 10) return { level: 2, label: 'Fair', color: 'bg-amber-400' };
        return { level: 3, label: 'Strong', color: 'bg-emerald-400' };
    };
    const strength = passwordStrength();

    return (
        <div className="min-h-screen flex">
            {/* ── Left decorative panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-700 via-brand-600 to-brand-700 items-center justify-center p-12">
                <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-60px] left-[-60px] w-96 h-96 bg-brand-300/20 rounded-full blur-3xl animate-pulse delay-700" />

                <div className="relative z-10 text-white text-center max-w-sm">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30">
                        <span className="text-4xl font-black text-white">F</span>
                    </div>
                    <h2 className="text-4xl font-black mb-4 leading-tight">
                        Join the<br />
                        <span className="text-brand-200">FlexFit</span> family
                    </h2>
                    <p className="text-white/70 text-lg leading-relaxed mb-10">
                        Whether you're shopping or selling, FlexFit is the place to be.
                    </p>

                    <div className="space-y-4 text-left">
                        {[
                            'Access to 500+ premium fashion items',
                            'Exclusive deals and promotions',
                            'Easy returns & refunds',
                            'Real-time order tracking',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                                <CheckCircle2 size={16} className="text-brand-200 flex-shrink-0" />
                                <span className="text-sm text-white/90">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Back to store navigation */}
                    <div className="mb-6">
                        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors group">
                            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
                            Back to Store
                        </Link>
                    </div>

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-xl font-black text-white">F</span>
                        </div>
                        <span className="text-2xl font-black text-gray-900">FlexFit</span>
                    </div>

                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-brand-100">
                            <Sparkles size={12} />
                            Free to join
                        </div>
                        <h1 className="text-3xl font-black text-gray-900">Create your account</h1>
                        <p className="text-gray-500 mt-2">Already have an account?{' '}
                            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                                Sign in →
                            </Link>
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
                        {/* Role selector */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { value: 'customer', label: 'Shopper', icon: ShoppingBag, desc: 'Browse & buy' },
                                { value: 'vendor', label: 'Vendor', icon: Store, desc: 'Sell products' },
                            ].map(({ value, label, icon: Icon, desc }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setForm({ ...form, role: value })}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                                        form.role === value
                                            ? 'border-brand-500 bg-gradient-to-b from-brand-50 to-white shadow-md shadow-brand-100'
                                            : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        form.role === value ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`font-bold text-sm ${form.role === value ? 'text-brand-700' : 'text-gray-700'}`}>{label}</span>
                                    <span className="text-xs text-gray-400">{desc}</span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="register-name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium ${
                                            errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'
                                        }`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="register-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium ${
                                            errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'
                                        }`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="register-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium ${
                                            errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'
                                        }`}
                                        placeholder="Min 6 characters"
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
                                {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password}</p>}
                            </div>

                            {/* Confirm */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="register-confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={form.confirm}
                                        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                        className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium ${
                                            errors.confirm ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-brand-500'
                                        }`}
                                        placeholder="Repeat password"
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirm && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.confirm}</p>}
                            </div>

                            <button
                                id="register-submit"
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-lg shadow-brand-200 hover:shadow-brand-300 hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed mt-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}