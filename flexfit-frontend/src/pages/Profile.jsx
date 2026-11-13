import { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Lock, Save, Loader2,
    Shield, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

import { SRI_LANKA_PROVINCES } from '../data/locations';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Profile() {
    const { user, updateUser } = useAuth();

    // Loading states
    const [fetching, setFetching] = useState(true);
    const [savingPersonal, setSavingPersonal] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Form states
    const [personalForm, setPersonalForm] = useState({
        name: '',
        phone: '',
        preferredSize: 'M',
    });

    const [addressForm, setAddressForm] = useState({
        street: '',
        city: '',
        district: 'Colombo',
        postalCode: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fetch latest profile details from server
    const loadProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setPersonalForm({
                name: data.name || '',
                phone: data.phone || '',
                preferredSize: data.preferredSize || 'M',
            });
            setAddressForm({
                street: data.address?.street || '',
                city: data.address?.city || '',
                district: data.address?.district || 'Colombo',
                postalCode: data.address?.postalCode || '',
            });
            // Sync context if fields differ
            updateUser({
                name: data.name,
                phone: data.phone,
                address: data.address,
                preferredSize: data.preferredSize
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // ─────────────────────────────────────────────────────────
    // Save Personal Information
    // ─────────────────────────────────────────────────────────
    const handleSavePersonal = async (e) => {
        e.preventDefault();
        if (!personalForm.name.trim()) {
            return toast.error('Name cannot be empty');
        }
        setSavingPersonal(true);
        try {
            const { data } = await api.put('/auth/profile', {
                name: personalForm.name.trim(),
                phone: personalForm.phone.trim(),
                preferredSize: personalForm.preferredSize,
            });
            updateUser(data);
            toast.success('Personal information updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update personal details');
        } finally {
            setSavingPersonal(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // Save Saved Shipping Address
    // ─────────────────────────────────────────────────────────
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSavingAddress(true);
        try {
            const { data } = await api.put('/auth/profile', {
                address: addressForm,
            });
            updateUser(data);
            toast.success('Shipping address saved!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save address');
        } finally {
            setSavingAddress(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // Password Management
    // ─────────────────────────────────────────────────────────
    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (!passwordForm.currentPassword) {
            return toast.error('Please enter your current password');
        }
        if (passwordForm.newPassword.length < 6) {
            return toast.error('New password must be at least 6 characters');
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        setSavingPassword(true);
        try {
            await api.put('/auth/profile', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Password changed successfully!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setSavingPassword(false);
        }
    };

    if (fetching) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: 'Shop', to: '/products' },
                    { label: 'Profile Settings' },
                ]}
                fallbackTo="/"
                backLabel="Back"
            />

            {/* ── Page Header & Profile Card ── */}
            <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-inner flex-shrink-0">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h1>
                            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                {user?.role || 'Customer'}
                            </span>
                        </div>
                        <p className="text-brand-100 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                            <Mail size={14} /> {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* ── Section 1: Personal Information ── */}
                <div className="card p-6">
                    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                            <User size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Personal Information</h2>
                            <p className="text-xs text-gray-500">Update your public identity and contact details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSavePersonal} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={personalForm.name}
                                onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                                className="input-field"
                                placeholder="e.g. Alex Johnson"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed directly for security reasons.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="tel"
                                    value={personalForm.phone}
                                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                                    className="input-field pl-10"
                                    placeholder="e.g. 077 123 4567"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Preferred Fit / Size
                            </label>
                            <select
                                value={personalForm.preferredSize}
                                onChange={(e) => setPersonalForm({ ...personalForm, preferredSize: e.target.value })}
                                className="input-field"
                            >
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={savingPersonal}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                        >
                            {savingPersonal ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {savingPersonal ? 'Saving Details...' : 'Save Personal Info'}
                        </button>
                    </form>
                </div>

                {/* ── Section 2: Saved Shipping Address ── */}
                <div className="card p-6">
                    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Saved Shipping Address</h2>
                            <p className="text-xs text-gray-500">Auto-filled during checkout for swift orders</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveAddress} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Street Address
                            </label>
                            <input
                                type="text"
                                value={addressForm.street}
                                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                className="input-field"
                                placeholder="123 Peradeniya Road"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    className="input-field"
                                    placeholder="Kandy"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    District
                                </label>
                                <select
                                    value={addressForm.district}
                                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Select District</option>
                                    {SRI_LANKA_PROVINCES.map((p) => (
                                        <optgroup key={p.province} label={`${p.province} Province`}>
                                            {p.districts.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Postal / Zip Code
                            </label>
                            <input
                                type="text"
                                value={addressForm.postalCode}
                                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                className="input-field"
                                placeholder="20000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={savingAddress}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
                        >
                            {savingAddress ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {savingAddress ? 'Saving Address...' : 'Save Shipping Address'}
                        </button>
                    </form>
                </div>

                {/* ── Section 3: Password Management ── */}
                <div className="card p-6 md:col-span-2">
                    <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Lock size={18} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Password Management & Security</h2>
                            <p className="text-xs text-gray-500">Ensure your account is protected with a strong password</p>
                        </div>
                    </div>

                    <form onSubmit={handleSavePassword} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="input-field pr-10"
                                    placeholder="Enter your current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="input-field pr-10"
                                        placeholder="Min 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="input-field pr-10"
                                        placeholder="Repeat new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={savingPassword}
                            className="btn-primary flex items-center justify-center gap-2 mt-4"
                        >
                            {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                            {savingPassword ? 'Updating Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
