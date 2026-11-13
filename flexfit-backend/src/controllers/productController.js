const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Get all products with filters
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
    try {
        const { keyword, category, size, color, minPrice, maxPrice, sort, vendor, page = 1, limit = 12 } = req.query;

        const query = { isActive: true };

        if (keyword) query.$text = { $search: keyword };
        if (category) query.category = category;
        if (color) query.colors = { $in: [color] };
        if (size) query['sizes.size'] = size;
        if (vendor) query.vendor = vendor;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { ratings: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const [products, count] = await Promise.all([
            Product.find(query)
                .populate('vendor', 'storeName logo')
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(query),
        ]);

        res.json({
            success: true,
            count,
            page: Number(page),
            pages: Math.ceil(count / limit),
            products,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor', 'storeName logo rating');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        next(err);
    }
};

// @desc    Create product (vendor or admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
    try {
        let vendorId;

        if (req.user.role === 'admin') {
            if (!req.body.vendor) {
                return res.status(400).json({ message: 'Vendor is required when admin creates a product' });
            }
            const vendorProfile = await Vendor.findOne({ user: req.body.vendor });
            if (!vendorProfile) {
                return res.status(404).json({ message: 'No vendor profile found for this user' });
            }
            vendorId = vendorProfile._id;
        } else {
            const vendorProfile = await Vendor.findOne({ user: req.user._id });
            if (!vendorProfile) {
                return res.status(403).json({ message: 'Vendor profile required' });
            }
            vendorId = vendorProfile._id;
        }

        const product = await Product.create({ ...req.body, vendor: vendorId });
        res.status(201).json({ success: true, product });
    } catch (err) {
        next(err);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (req.user.role !== 'admin') {
            const vendorProfile = await Vendor.findOne({ user: req.user._id });
            if (!vendorProfile || product.vendor.toString() !== vendorProfile._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to edit this product' });
            }
        }

        const updates = { ...req.body };
        if (req.user.role !== 'admin') delete updates.vendor;

        Object.assign(product, updates);
        const updated = await product.save();
        res.json({ success: true, product: updated });
    } catch (err) {
        next(err);
    }
};

// @desc    Update stock for a size
// @route   PATCH /api/products/:id/stock
exports.updateStock = async (req, res, next) => {
    try {
        const { size, stock } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (req.user.role !== 'admin') {
            const vendorProfile = await Vendor.findOne({ user: req.user._id });
            if (!vendorProfile || product.vendor.toString() !== vendorProfile._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        const sizeEntry = product.sizes.find((s) => s.size === size);
        if (!sizeEntry) return res.status(400).json({ message: `Size ${size} not found` });

        sizeEntry.stock = stock;
        await product.save();

        res.json({ success: true, product, lowStock: product.totalStock < product.lowStockThreshold });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (req.user.role !== 'admin') {
            const vendorProfile = await Vendor.findOne({ user: req.user._id });
            if (!vendorProfile || product.vendor.toString() !== vendorProfile._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        if (req.user.role === 'admin') {
            await product.deleteOne();
            return res.json({ success: true, message: 'Product permanently deleted' });
        }

        product.isActive = false;
        await product.save();
        res.json({ success: true, message: 'Product deactivated' });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
exports.createProductReview = async (req, res, next) => {
    try {
        const { rating, comment, fitFeedback, photos } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
            fitFeedback,
            photos: photos || [],
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.ratings =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ success: true, message: 'Review added' });
    } catch (err) {
        next(err);
    }
};