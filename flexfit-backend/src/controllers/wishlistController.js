const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Small helper: owner check
const assertOwner = (wishlist, userId) =>
    wishlist.user.toString() === userId.toString();

// @desc   Create a wishlist folder
// @route  POST /api/wishlists
// @access Private
exports.createWishlist = async (req, res, next) => {
    try {
        const { name, description, isPublic } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Wishlist name is required' });
        }

        const wishlist = await Wishlist.create({
            user: req.user._id,
            name: name.trim(),
            description: description || '',
            isPublic: !!isPublic,
        });

        res.status(201).json({ success: true, wishlist });
    } catch (err) {
        next(err);
    }
};

// @desc   Get current user's wishlists
// @route  GET /api/wishlists
// @access Private
exports.getMyWishlists = async (req, res, next) => {
    try {
        const wishlists = await Wishlist.find({ user: req.user._id })
            .populate('items.product', 'name price images category totalStock ratings')
            .sort({ updatedAt: -1 });

        res.json({ success: true, count: wishlists.length, wishlists });
    } catch (err) {
        next(err);
    }
};

// @desc   Get single wishlist (owner only)
// @route  GET /api/wishlists/:id
// @access Private
exports.getWishlistById = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findById(req.params.id).populate(
            'items.product',
            'name price images category totalStock ratings'
        );
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
        if (!assertOwner(wishlist, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json({ success: true, wishlist });
    } catch (err) {
        next(err);
    }
};

// @desc   Update name / description / isPublic
// @route  PUT /api/wishlists/:id
// @access Private
exports.updateWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findById(req.params.id);
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
        if (!assertOwner(wishlist, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (req.body.name !== undefined) {
            if (!req.body.name.trim()) {
                return res.status(400).json({ message: 'Name cannot be empty' });
            }
            wishlist.name = req.body.name.trim();
        }
        if (req.body.description !== undefined) wishlist.description = req.body.description;
        if (req.body.isPublic !== undefined) {
            wishlist.isPublic = !!req.body.isPublic;
            // shareToken generation handled in pre-save hook
            if (!wishlist.isPublic) wishlist.shareToken = undefined;
        }

        await wishlist.save();
        await wishlist.populate('items.product', 'name price images category totalStock');
        res.json({ success: true, wishlist });
    } catch (err) {
        next(err);
    }
};

// @desc   Delete wishlist
// @route  DELETE /api/wishlists/:id
// @access Private
exports.deleteWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findById(req.params.id);
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
        if (!assertOwner(wishlist, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await wishlist.deleteOne();
        res.json({ success: true, message: 'Wishlist deleted' });
    } catch (err) {
        next(err);
    }
};

// @desc   Add a product to a wishlist
// @route  POST /api/wishlists/:id/items
// @access Private
exports.addItemToWishlist = async (req, res, next) => {
    try {
        const { productId, note = '' } = req.body;
        const wishlist = await Wishlist.findById(req.params.id);
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
        if (!assertOwner(wishlist, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const exists = wishlist.items.some((i) => i.product.toString() === productId);
        if (exists) {
            return res.status(400).json({ message: 'Product already in this wishlist' });
        }

        wishlist.items.push({ product: productId, note });
        await wishlist.save();
        await wishlist.populate('items.product', 'name price images category totalStock');

        res.status(201).json({ success: true, wishlist });
    } catch (err) {
        next(err);
    }
};

// @desc   Remove a product from a wishlist
// @route  DELETE /api/wishlists/:id/items/:productId
// @access Private
exports.removeItemFromWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findById(req.params.id);
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
        if (!assertOwner(wishlist, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        wishlist.items = wishlist.items.filter(
            (i) => i.product.toString() !== req.params.productId
        );
        await wishlist.save();
        await wishlist.populate('items.product', 'name price images category totalStock');

        res.json({ success: true, wishlist });
    } catch (err) {
        next(err);
    }
};

// @desc   Toggle public sharing (auto-generates shareToken)
// @route  PATCH /api/wishlists/:id/share
// @access Private
exports.toggleShare = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findById(req.params.id);
        if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
        if (!assertOwner(wishlist, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        wishlist.isPublic = !wishlist.isPublic;
        if (!wishlist.isPublic) wishlist.shareToken = undefined;
        await wishlist.save();

        res.json({ success: true, wishlist });
    } catch (err) {
        next(err);
    }
};

// @desc   View a public wishlist by share token
// @route  GET /api/wishlists/shared/:token
// @access Public
exports.getSharedWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({
            shareToken: req.params.token,
            isPublic: true,
        })
            .populate('user', 'name')
            .populate('items.product', 'name price images category totalStock ratings');

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found or no longer public' });
        }

        wishlist.views += 1;
        await wishlist.save();

        res.json({ success: true, wishlist });
    } catch (err) {
        next(err);
    }
};