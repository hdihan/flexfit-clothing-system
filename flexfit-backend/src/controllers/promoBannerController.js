const PromoBanner = require('../models/PromoBanner');
const Vendor = require('../models/Vendor');

// @desc    Get active banners for customers
// @route   GET /api/banners
// @access  Public
exports.getActiveBanners = async (req, res, next) => {
    try {
        const now = new Date();
        const banners = await PromoBanner.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        })
            .sort({ priority: -1, createdAt: -1 })
            .populate('vendorId', 'storeName');

        res.json({ success: true, banners });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all banners (for management)
// @route   GET /api/banners/manage
// @access  Private (Admin/Vendor)
exports.getAllBanners = async (req, res, next) => {
    try {
        let filter = {};

        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
            // Vendors only see their own banners
            filter.vendorId = vendor._id;
        }

        const banners = await PromoBanner.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, banners });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private (Admin/Vendor)
exports.createBanner = async (req, res, next) => {
    try {
        let vendorId = null;
        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
            vendorId = vendor._id;
        }

        const banner = await PromoBanner.create({
            ...req.body,
            createdBy: req.user._id,
            vendorId,
        });

        res.status(201).json({ success: true, banner });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private (Admin/Vendor)
exports.updateBanner = async (req, res, next) => {
    try {
        const banner = await PromoBanner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        // Vendors can only update their own banners
        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (banner.vendorId?.toString() !== vendor._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to edit this banner' });
            }
        }

        const updatedBanner = await PromoBanner.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({ success: true, banner: updatedBanner });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin/Vendor)
exports.deleteBanner = async (req, res, next) => {
    try {
        const banner = await PromoBanner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (banner.vendorId?.toString() !== vendor._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to delete this banner' });
            }
        }

        await banner.deleteOne();
        res.json({ success: true, message: 'Banner deleted' });
    } catch (err) {
        next(err);
    }
};