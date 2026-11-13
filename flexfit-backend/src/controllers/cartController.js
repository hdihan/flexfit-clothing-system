const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
        res.json({ success: true, cart });
    } catch (err) {
        next(err);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const { productId, size, color, quantity = 1 } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const sizeEntry = product.sizes.find((s) => s.size === size);
        if (!sizeEntry || sizeEntry.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = new Cart({ user: req.user._id, items: [] });

        const existing = cart.items.find(
            (i) => i.product.toString() === productId && i.size === size && i.color === color
        );

        if (existing) existing.quantity += quantity;
        else {
            cart.items.push({
                product: product._id,
                vendor: product.vendor,
                name: product.name,
                image: product.images[0],
                price: product.price,
                size,
                color,
                quantity,
            });
        }

        await cart.save();
        res.json({ success: true, cart });
    } catch (err) {
        next(err);
    }
};

exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (quantity < 1) return res.status(400).json({ message: 'Quantity must be >= 1' });
        item.quantity = quantity;
        await cart.save();
        res.json({ success: true, cart });
    } catch (err) {
        next(err);
    }
};

exports.removeCartItem = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
        await cart.save();
        res.json({ success: true, cart });
    } catch (err) {
        next(err);
    }
};

exports.clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        next(err);
    }
};