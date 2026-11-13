const mongoose = require('mongoose');

const valueSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 60 },
        description: { type: String, required: true, trim: true, maxlength: 300 },
        icon: { type: String, default: '✨' }, // emoji or lucide name
    },
    { _id: true }
);

const teamMemberSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        role: { type: String, required: true, trim: true, maxlength: 80 },
        bio: { type: String, maxlength: 300 },
        image: { type: String, default: '' },
    },
    { _id: true }
);

const aboutSchema = new mongoose.Schema(
    {
        // Single-document anchor — always 'main'
        key: { type: String, default: 'main', unique: true, index: true },

        // Hero
        title: { type: String, default: 'About FlexFit', trim: true, maxlength: 120 },
        tagline: {
            type: String,
            default: 'AI-powered fashion, crafted for you',
            trim: true,
            maxlength: 200,
        },
        heroImage: { type: String, default: '' },

        // Content
        story: { type: String, default: '', maxlength: 3000 },
        mission: { type: String, default: '', maxlength: 1000 },
        vision: { type: String, default: '', maxlength: 1000 },

        // Values grid
        values: { type: [valueSchema], default: [] },

        // Team
        teamMembers: { type: [teamMemberSchema], default: [] },

        // Contact
        contact: {
            email: { type: String, default: 'support@flexfit.lk', trim: true },
            phone: { type: String, default: '', trim: true },
            address: { type: String, default: '', trim: true },
        },

        // Social
        social: {
            facebook: { type: String, default: '', trim: true },
            instagram: { type: String, default: '', trim: true },
            twitter: { type: String, default: '', trim: true },
            linkedin: { type: String, default: '', trim: true },
        },

        // Meta
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('About', aboutSchema);