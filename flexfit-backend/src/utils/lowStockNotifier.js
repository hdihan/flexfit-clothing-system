const Vendor = require('../models/Vendor');
const sendEmail = require('./sendEmail');

/**
 * Send a low-stock alert to the vendor if a size variant has just
 * crossed below the product's lowStockThreshold.
 *
 * Fires only on the DOWNWARD crossing to avoid duplicate emails.
 *
 * @returns {Promise<boolean>} true if an email was dispatched
 */
const notifyIfLowStock = async (product, size, oldStock, newStock) => {
    const threshold = product.lowStockThreshold ?? 5;
    const crossedDown = oldStock >= threshold && newStock < threshold;

    if (!crossedDown) return false;

    try {
        const vendor = await Vendor.findById(product.vendor).populate('user', 'email name');
        if (!vendor) {
            console.warn(`[low-stock] Vendor not found for product ${product._id}`);
            return false;
        }
        if (!vendor.user?.email) {
            console.warn(`[low-stock] Vendor ${vendor.storeName} has no user email — skipping alert`);
            return false;
        }

        const message =
            `Hello ${vendor.storeName},\n\n` +
            `⚠️  Low Stock Alert\n\n` +
            `Product : ${product.name}\n` +
            `Size    : ${size}\n` +
            `Previous stock : ${oldStock}\n` +
            `Current stock  : ${newStock}\n` +
            `Threshold      : ${threshold}\n\n` +
            `Please log in to your vendor dashboard to replenish inventory before you run out.\n\n` +
            `— FlexFit Team`;

        await sendEmail({
            email: vendor.user.email,
            subject: `⚠️ Low Stock: ${product.name} (${size})`,
            message,
        });

        console.log(`✅ [low-stock] Alert sent to ${vendor.user.email} for ${product.name} (${size})`);
        return true;
    } catch (err) {
        console.error('[low-stock] Failed to send alert:', err.message);
        return false;
    }
};

/**
 * Return every size variant across a vendor's products that is currently
 * at or below its lowStockThreshold. Used for the dashboard banner.
 */
const getLowStockVariants = async (vendorId) => {
    const Product = require('../models/Product');

    const products = await Product.find({ vendor: vendorId, isActive: true })
        .select('name category images sizes lowStockThreshold totalStock')
        .lean();

    const alerts = [];

    for (const p of products) {
        const threshold = p.lowStockThreshold ?? 5;
        for (const s of p.sizes || []) {
            if (s.stock < threshold) {
                alerts.push({
                    productId: p._id,
                    name: p.name,
                    category: p.category,
                    image: p.images?.[0] || null,
                    size: s.size,
                    stock: s.stock,
                    threshold,
                    severity: s.stock === 0 ? 'out' : 'low',
                });
            }
        }
    }

    // Out-of-stock first, then by lowest stock
    alerts.sort((a, b) => {
        if (a.severity !== b.severity) return a.severity === 'out' ? -1 : 1;
        return a.stock - b.stock;
    });

    return alerts;
};

module.exports = { notifyIfLowStock, getLowStockVariants };