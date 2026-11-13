const Promotion = require('../models/Promotion');
const Cart = require('../models/Cart');
const Vendor = require('../models/Vendor');

exports.createPromotion = async (req, res, next) => {
    try {
        const { code, description, discountType, discountValue, validFrom, validUntil, usageLimit, category } = req.body;
        
        let vendorId = null;
        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
            vendorId = vendor._id;
        }

        const promo = await Promotion.create({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            validFrom: validFrom || Date.now(),
            validUntil,
            usageLimit,
            category: category || 'All',
            vendor: vendorId,
            createdBy: req.user._id,
        });

        res.status(201).json({ success: true, promotion: promo });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Promotion code already exists' });
        }
        next(err);
    }
};

exports.getPromotions = async (req, res, next) => {
    try {
        let filter = {};
        if (req.user.role === 'vendor') {
            filter.createdBy = req.user._id;
        }
        const promotions = await Promotion.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, promotions });
    } catch (err) {
        next(err);
    }
};

exports.updatePromotion = async (req, res, next) => {
    try {
        const promo = await Promotion.findById(req.params.id);
        if (!promo) return res.status(404).json({ message: 'Promotion not found' });

        if (req.user.role === 'vendor' && promo.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { code, description, discountType, discountValue, validFrom, validUntil, usageLimit, category, isActive } = req.body;
        
        if (code) promo.code = code.toUpperCase();
        if (description !== undefined) promo.description = description;
        if (discountType) promo.discountType = discountType;
        if (discountValue !== undefined) promo.discountValue = discountValue;
        if (validFrom) promo.validFrom = validFrom;
        if (validUntil) promo.validUntil = validUntil;
        if (usageLimit !== undefined) promo.usageLimit = usageLimit;
        if (category) promo.category = category;
        if (isActive !== undefined) promo.isActive = isActive;

        await promo.save();
        res.json({ success: true, promotion: promo });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Promotion code already exists' });
        }
        next(err);
    }
};

exports.deletePromotion = async (req, res, next) => {
    try {
        const promo = await Promotion.findById(req.params.id);
        if (!promo) return res.status(404).json({ message: 'Promotion not found' });

        if (req.user.role === 'vendor' && promo.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Promotion.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Promotion deleted' });
    } catch (err) {
        next(err);
    }
};

exports.validatePromotion = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: 'Code is required' });

        const promo = await Promotion.findOne({ code: code.toUpperCase(), isActive: true });

        if (!promo) return res.status(404).json({ message: 'Invalid or inactive promotion code' });

        const now = new Date();
        if (now < new Date(promo.validFrom)) {
            return res.status(400).json({ message: 'Promotion code is not active yet' });
        }
        if (now > new Date(promo.validUntil)) {
            return res.status(400).json({ message: 'Promotion code has expired' });
        }

        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            return res.status(400).json({ message: 'Promotion code usage limit reached' });
        }

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let eligibleTotal = 0;
        
        let eligibleItems = cart.items;
        
        if (promo.category && promo.category !== 'All') {
            eligibleItems = eligibleItems.filter(item => item.product.category === promo.category);
        }

        if (eligibleItems.length === 0) {
            return res.status(400).json({ message: 'This promotion code does not apply to any items in your cart' });
        }

        eligibleTotal = eligibleItems.reduce((s, i) => s + i.price * i.quantity, 0);

        let discountAmount = 0;
        if (promo.discountType === 'percentage') {
            discountAmount = eligibleTotal * (promo.discountValue / 100);
        } else if (promo.discountType === 'fixed') {
            discountAmount = promo.discountValue;
            if (discountAmount > eligibleTotal) discountAmount = eligibleTotal;
        }

        res.json({
            success: true,
            promotion: {
                _id: promo._id,
                code: promo.code,
                discountAmount: Number(discountAmount.toFixed(2))
            }
        });
    } catch (err) {
        next(err);
    }
};
