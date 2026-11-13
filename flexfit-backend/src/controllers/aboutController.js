const About = require('../models/About');

// Default seed content, applied once on first fetch
const DEFAULT_ABOUT = {
    key: 'main',
    title: 'About FlexFit',
    tagline: 'AI-powered fashion, crafted for you',
    story:
        'FlexFit is a next-generation fashion marketplace built for the modern shopper. ' +
        'We combine artificial intelligence, a multi-vendor platform, and a rich virtual ' +
        'styling studio to help you discover outfits that genuinely fit your style, size, ' +
        'and budget.\n\n' +
        'Founded with a simple belief — that shopping for clothes should feel personal, ' +
        'not overwhelming — FlexFit brings together boutique vendors from across Sri Lanka ' +
        'under one elegant roof.',
    mission:
        'To make fashion personal again by giving every shopper the tools, guidance, and ' +
        'confidence to build a wardrobe that feels like theirs.',
    vision:
        'To become South Asia\'s most trusted AI-driven fashion ecosystem, where every ' +
        'purchase feels made-to-measure.',
    values: [
        {
            title: 'Fit First',
            description:
                'Our AI size advisor and virtual mix-and-match studio exist for one reason: helping you find clothes that actually fit.',
            icon: '📐',
        },
        {
            title: 'Local Craft',
            description:
                'We partner with independent Sri Lankan vendors to bring boutique quality to every order.',
            icon: '🇱🇰',
        },
        {
            title: 'Sustainable Choices',
            description:
                'Fewer returns, smarter sizing, and durable pieces — good for your wardrobe and the planet.',
            icon: '🌿',
        },
        {
            title: 'Customer Obsession',
            description:
                'Every feature we build starts with a real shopper problem. If it doesn\'t help you, we don\'t ship it.',
            icon: '💗',
        },
    ],
    teamMembers: [
        {
            name: 'Hansaja',
            role: 'Lead Developer',
            bio: 'Leading the full-stack architecture, payment gateway engineering, and AI fashion intelligence at FlexFit.',
        },
    ],
    contact: {
        email: 'support@flexfit.lk',
        phone: '+94 11 234 5678',
        address: 'Colombo, Sri Lanka',
    },
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
    },
};

// Helper: fetch the singleton About doc, creating it with defaults if missing
const getOrCreate = async () => {
    let about = await About.findOne({ key: 'main' });
    if (!about) {
        about = await About.create(DEFAULT_ABOUT);
    } else {
        const hasHansaja = about.teamMembers?.some(
            (m) => m.name && m.name.toLowerCase().includes('hansaja')
        );
        if (!hasHansaja) {
            about.teamMembers = [
                {
                    name: 'Hansaja',
                    role: 'Lead Developer',
                    bio: 'Leading the full-stack architecture, payment gateway engineering, and AI fashion intelligence at FlexFit.',
                },
                ...(about.teamMembers || []),
            ];
            await about.save();
        }
    }
    return about;
};

// @desc    Get the About page content
// @route   GET /api/about
// @access  Public
exports.getAbout = async (req, res, next) => {
    try {
        const about = await getOrCreate();
        res.json({ success: true, about });
    } catch (err) {
        next(err);
    }
};

// @desc    Update the About page content
// @route   PUT /api/about
// @access  Admin only
exports.updateAbout = async (req, res, next) => {
    try {
        const about = await getOrCreate();

        // Whitelist-editable fields — anything else is ignored
        const editable = [
            'title',
            'tagline',
            'heroImage',
            'story',
            'mission',
            'vision',
            'values',
            'teamMembers',
            'contact',
            'social',
        ];

        editable.forEach((field) => {
            if (req.body[field] !== undefined) {
                about[field] = req.body[field];
            }
        });

        about.updatedBy = req.user._id;
        await about.save();

        res.json({ success: true, about });
    } catch (err) {
        next(err);
    }
};

// @desc    Reset the About page to defaults
// @route   POST /api/about/reset
// @access  Admin only
exports.resetAbout = async (req, res, next) => {
    try {
        await About.deleteOne({ key: 'main' });
        const about = await getOrCreate();
        res.json({ success: true, about });
    } catch (err) {
        next(err);
    }
};