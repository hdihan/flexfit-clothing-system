import { useEffect, useState } from 'react';
import {
    Sparkles, Mail, Phone, MapPin,
    Loader2, Edit3, X, Plus, Trash2,
    Save, RotateCcw, Target, Eye, Heart, Users,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';
import { useConfirm } from '../context/ConfirmContext';

// ═══════════════════════════════════════════════════════════════
// Inline brand icons — lucide-react removed these due to
// trademark restrictions. These are simple SVG paths.
// ═══════════════════════════════════════════════════════════════
const FacebookIcon = ({ size = 16, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const InstagramIcon = ({ size = 16, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

const TwitterIcon = ({ size = 16, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const LinkedinIcon = ({ size = 16, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

export default function About() {
    const { user } = useAuth();
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    const isAdmin = user?.role === 'admin';

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/about');
            setAbout(data.about);
        } catch {
            toast.error('Failed to load About page');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) return <Loader />;
    if (!about) return <div className="p-12 text-center">About page unavailable.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: 'About FlexFit' },
                ]}
                fallbackTo="/"
                backLabel="Back to Home"
            />

            {/* Admin edit button */}
            {isAdmin && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setEditing(true)}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        <Edit3 size={15} /> Edit Page
                    </button>
                </div>
            )}

            {/* ── HERO ─────────────────────────────────── */}
            <section className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-100 to-purple-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-5">
                    <Sparkles size={13} /> Our Story
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {about.title}
                </h1>
                <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                    {about.tagline}
                </p>
            </section>

            {/* ── STORY ────────────────────────────────── */}
            {about.story && (
                <section className="card p-8 mb-12">
                    <h2 className="text-2xl font-bold mb-4">Our Journey</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {about.story}
                    </div>
                </section>
            )}

            {/* ── MISSION & VISION ─────────────────────── */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {about.mission && (
                    <div className="card p-6 border-l-4 border-brand-500">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                                <Target size={18} />
                            </div>
                            <h3 className="text-lg font-bold">Our Mission</h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {about.mission}
                        </p>
                    </div>
                )}
                {about.vision && (
                    <div className="card p-6 border-l-4 border-purple-500">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                                <Eye size={18} />
                            </div>
                            <h3 className="text-lg font-bold">Our Vision</h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {about.vision}
                        </p>
                    </div>
                )}
            </div>

            {/* ── VALUES ───────────────────────────────── */}
            {about.values?.length > 0 && (
                <section className="mb-14">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                            <Heart className="text-brand-600" /> What We Stand For
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            The principles behind every decision we make
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {about.values.map((v, i) => (
                            <div key={v._id || i} className="card p-6 text-center">
                                <div className="text-3xl mb-3">{v.icon}</div>
                                <h3 className="font-bold text-gray-900 text-sm mb-2">
                                    {v.title}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {v.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── TEAM ─────────────────────────────────── */}
            {(() => {
                const members = (about.teamMembers && about.teamMembers.length > 0)
                    ? about.teamMembers
                    : [
                        {
                            name: 'Hansaja',
                            role: 'Lead Developer',
                            bio: 'Leading the full-stack architecture, payment gateway engineering, and AI fashion intelligence at FlexFit.',
                        }
                    ];

                return (
                    <section className="mb-14">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
                                <Users size={13} className="text-brand-600" /> The Minds Behind FlexFit
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Meet the Team
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                                Innovators dedicated to crafting seamless, intelligent fashion shopping.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {members.map((m, i) => (
                                <div key={m._id || i} className="card p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                                    <div className="relative inline-block mx-auto mb-3">
                                        {m.image ? (
                                            <img
                                                src={m.image}
                                                alt={m.name}
                                                className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-brand-200 shadow-md group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto text-3xl font-black shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform">
                                                {m.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                                            <span className="bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                                                {m.role}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="font-extrabold text-lg text-gray-900 mt-3 group-hover:text-brand-600 transition-colors">
                                        {m.name}
                                    </h3>
                                    <p className="text-xs font-bold text-brand-600 mt-0.5">
                                        {m.role}
                                    </p>
                                    {m.bio && (
                                        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                                            {m.bio}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })()}

            {/* ── CONTACT ──────────────────────────────── */}
            <section className="card p-8 bg-gradient-to-br from-brand-50/60 via-white to-purple-50/60">
                <h2 className="text-2xl font-bold text-center mb-6">Get in Touch</h2>
                <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {about.contact?.email && (
                        <a
                            href={`mailto:${about.contact.email}`}
                            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 transition"
                        >
                            <Mail size={20} className="text-brand-600" />
                            <span className="text-xs font-medium text-gray-700 text-center break-all">
                                {about.contact.email}
                            </span>
                        </a>
                    )}
                    {about.contact?.phone && (
                        <a
                            href={`tel:${about.contact.phone}`}
                            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 transition"
                        >
                            <Phone size={20} className="text-brand-600" />
                            <span className="text-xs font-medium text-gray-700 text-center">
                                {about.contact.phone}
                            </span>
                        </a>
                    )}
                    {about.contact?.address && (
                        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200">
                            <MapPin size={20} className="text-brand-600" />
                            <span className="text-xs font-medium text-gray-700 text-center">
                                {about.contact.address}
                            </span>
                        </div>
                    )}
                </div>

                {/* Social */}
                {(about.social?.facebook ||
                    about.social?.instagram ||
                    about.social?.twitter ||
                    about.social?.linkedin) && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        {about.social.facebook && (
                            <a
                                href={about.social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition"
                                aria-label="Facebook"
                            >
                                <FacebookIcon size={16} className="text-brand-600" />
                            </a>
                        )}
                        {about.social.instagram && (
                            <a
                                href={about.social.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition"
                                aria-label="Instagram"
                            >
                                <InstagramIcon size={16} className="text-brand-600" />
                            </a>
                        )}
                        {about.social.twitter && (
                            <a
                                href={about.social.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition"
                                aria-label="Twitter"
                            >
                                <TwitterIcon size={16} className="text-brand-600" />
                            </a>
                        )}
                        {about.social.linkedin && (
                            <a
                                href={about.social.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition"
                                aria-label="LinkedIn"
                            >
                                <LinkedinIcon size={16} className="text-brand-600" />
                            </a>
                        )}
                    </div>
                )}
            </section>

            {/* ── EDITOR MODAL (admin only) ───────────── */}
            {editing && isAdmin && (
                <AboutEditor
                    initial={about}
                    onClose={() => setEditing(false)}
                    onSaved={(updated) => {
                        setAbout(updated);
                        setEditing(false);
                    }}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Admin editor modal
// ═══════════════════════════════════════════════════════════════
function AboutEditor({ initial, onClose, onSaved }) {
    const confirm = useConfirm();
    const [form, setForm] = useState({
        title: initial.title || '',
        tagline: initial.tagline || '',
        story: initial.story || '',
        mission: initial.mission || '',
        vision: initial.vision || '',
        values: initial.values || [],
        teamMembers: initial.teamMembers || [],
        contact: initial.contact || { email: '', phone: '', address: '' },
        social: initial.social || {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
        },
    });
    const [saving, setSaving] = useState(false);

    // ── Value helpers ────────────────────────────────
    const addValue = () =>
        setForm({
            ...form,
            values: [...form.values, { title: '', description: '', icon: '✨' }],
        });
    const updateValue = (idx, key, val) => {
        const next = [...form.values];
        next[idx] = { ...next[idx], [key]: val };
        setForm({ ...form, values: next });
    };
    const removeValue = (idx) =>
        setForm({ ...form, values: form.values.filter((_, i) => i !== idx) });

    // ── Team helpers ─────────────────────────────────
    const addTeam = () =>
        setForm({
            ...form,
            teamMembers: [
                ...form.teamMembers,
                { name: '', role: '', bio: '', image: '' },
            ],
        });
    const updateTeam = (idx, key, val) => {
        const next = [...form.teamMembers];
        next[idx] = { ...next[idx], [key]: val };
        setForm({ ...form, teamMembers: next });
    };
    const removeTeam = (idx) =>
        setForm({
            ...form,
            teamMembers: form.teamMembers.filter((_, i) => i !== idx),
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/about', form);
            toast.success('About page updated');
            onSaved(data.about);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        const ok = await confirm({
            title: 'Reset About Page?',
            message: 'All custom content will be permanently lost and replaced with default values. This action cannot be undone.',
            confirmLabel: 'Reset to Defaults',
            variant: 'warning',
        });
        if (!ok) return;
        try {
            const { data } = await api.post('/about/reset');
            toast.success('About page reset to defaults');
            onSaved(data.about);
        } catch {
            toast.error('Reset failed');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-lg font-bold">Edit About Page</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Update the public content shoppers see
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Hero */}
                    <section>
                        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                            Hero Section
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Page Title
                                </label>
                                <input
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                    className="input-field"
                                    maxLength={120}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Tagline
                                </label>
                                <input
                                    value={form.tagline}
                                    onChange={(e) =>
                                        setForm({ ...form, tagline: e.target.value })
                                    }
                                    className="input-field"
                                    maxLength={200}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Story */}
                    <section>
                        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                            Story
                        </h3>
                        <textarea
                            value={form.story}
                            onChange={(e) =>
                                setForm({ ...form, story: e.target.value })
                            }
                            className="input-field"
                            rows="6"
                            placeholder="Tell the story of your brand…"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Tip: leave blank lines between paragraphs.
                        </p>
                    </section>

                    {/* Mission & Vision */}
                    <section>
                        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                            Mission &amp; Vision
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Mission
                                </label>
                                <textarea
                                    value={form.mission}
                                    onChange={(e) =>
                                        setForm({ ...form, mission: e.target.value })
                                    }
                                    className="input-field"
                                    rows="2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Vision
                                </label>
                                <textarea
                                    value={form.vision}
                                    onChange={(e) =>
                                        setForm({ ...form, vision: e.target.value })
                                    }
                                    className="input-field"
                                    rows="2"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Values */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                                Values ({form.values.length})
                            </h3>
                            <button
                                type="button"
                                onClick={addValue}
                                className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                            >
                                <Plus size={12} /> Add value
                            </button>
                        </div>
                        <div className="space-y-3">
                            {form.values.map((v, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative"
                                >
                                    <button
                                        type="button"
                                        onClick={() => removeValue(i)}
                                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"
                                        title="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        <input
                                            value={v.icon}
                                            onChange={(e) =>
                                                updateValue(i, 'icon', e.target.value)
                                            }
                                            className="input-field text-center text-lg col-span-1"
                                            placeholder="✨"
                                            maxLength={2}
                                        />
                                        <input
                                            value={v.title}
                                            onChange={(e) =>
                                                updateValue(i, 'title', e.target.value)
                                            }
                                            className="input-field col-span-3 text-sm"
                                            placeholder="Value title"
                                            maxLength={60}
                                        />
                                    </div>
                                    <textarea
                                        value={v.description}
                                        onChange={(e) =>
                                            updateValue(
                                                i,
                                                'description',
                                                e.target.value
                                            )
                                        }
                                        className="input-field text-sm"
                                        rows="2"
                                        placeholder="Short description"
                                        maxLength={300}
                                    />
                                </div>
                            ))}
                            {form.values.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-3">
                                    No values yet — click "Add value" to create one.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Team */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                                Team ({form.teamMembers.length})
                            </h3>
                            <button
                                type="button"
                                onClick={addTeam}
                                className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                            >
                                <Plus size={12} /> Add member
                            </button>
                        </div>
                        <div className="space-y-3">
                            {form.teamMembers.map((m, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative"
                                >
                                    <button
                                        type="button"
                                        onClick={() => removeTeam(i)}
                                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"
                                        title="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-2 mb-2 pr-8">
                                        <input
                                            value={m.name}
                                            onChange={(e) =>
                                                updateTeam(i, 'name', e.target.value)
                                            }
                                            className="input-field text-sm"
                                            placeholder="Full name"
                                            maxLength={80}
                                        />
                                        <input
                                            value={m.role}
                                            onChange={(e) =>
                                                updateTeam(i, 'role', e.target.value)
                                            }
                                            className="input-field text-sm"
                                            placeholder="Role"
                                            maxLength={80}
                                        />
                                    </div>
                                    <input
                                        value={m.image}
                                        onChange={(e) =>
                                            updateTeam(i, 'image', e.target.value)
                                        }
                                        className="input-field text-sm mb-2"
                                        placeholder="Image URL (optional)"
                                    />
                                    <textarea
                                        value={m.bio}
                                        onChange={(e) =>
                                            updateTeam(i, 'bio', e.target.value)
                                        }
                                        className="input-field text-sm"
                                        rows="2"
                                        placeholder="Short bio (optional)"
                                        maxLength={300}
                                    />
                                </div>
                            ))}
                            {form.teamMembers.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-3">
                                    No team members yet.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                            Contact
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="email"
                                value={form.contact.email}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        contact: {
                                            ...form.contact,
                                            email: e.target.value,
                                        },
                                    })
                                }
                                className="input-field text-sm"
                                placeholder="support@flexfit.lk"
                            />
                            <input
                                value={form.contact.phone}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        contact: {
                                            ...form.contact,
                                            phone: e.target.value,
                                        },
                                    })
                                }
                                className="input-field text-sm"
                                placeholder="+94 11 234 5678"
                            />
                            <input
                                value={form.contact.address}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        contact: {
                                            ...form.contact,
                                            address: e.target.value,
                                        },
                                    })
                                }
                                className="input-field text-sm"
                                placeholder="Colombo, Sri Lanka"
                            />
                        </div>
                    </section>

                    {/* Social */}
                    <section>
                        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">
                            Social Links
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['facebook', 'instagram', 'twitter', 'linkedin'].map(
                                (k) => (
                                    <input
                                        key={k}
                                        value={form.social[k]}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                social: {
                                                    ...form.social,
                                                    [k]: e.target.value,
                                                },
                                            })
                                        }
                                        className="input-field text-sm capitalize"
                                        placeholder={`${k} URL`}
                                    />
                                )
                            )}
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium flex items-center gap-2"
                        >
                            <RotateCcw size={15} /> Reset to Defaults
                        </button>
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary flex items-center gap-2"
                        >
                            {saving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}