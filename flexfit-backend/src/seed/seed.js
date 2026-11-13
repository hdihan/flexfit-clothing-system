const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');

const sampleProducts = [
    { name: 'Cotton Oversized Tee', category: 'Tops', price: 2500, colors: ['Black', 'White', 'Beige'], image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
    { name: 'Vintage Denim Jacket', category: 'Outerwear', price: 8900, colors: ['Blue', 'Black'], image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600' },
    { name: 'Floral Midi Dress', category: 'Dresses', price: 5500, colors: ['Pink', 'White'], image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600' },
    { name: 'Slim Fit Chinos', category: 'Bottoms', price: 4200, colors: ['Beige', 'Black'], image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600' },
    { name: 'Leather Ankle Boots', category: 'Footwear', price: 12000, colors: ['Black'], image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600' },
    { name: 'Silk Scarf', category: 'Accessories', price: 1800, colors: ['Red', 'Pink', 'Blue'], image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600' },
    { name: 'Linen Summer Shirt', category: 'Tops', price: 3200, colors: ['White', 'Beige'], image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600' },
    { name: 'Pleated Midi Skirt', category: 'Bottoms', price: 4500, colors: ['Green', 'Black'], image: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=600' },
    { name: 'Knit Cardigan', category: 'Outerwear', price: 6500, colors: ['Beige', 'Pink'], image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600' },
    { name: 'Canvas Sneakers', category: 'Footwear', price: 5800, colors: ['White', 'Black'], image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600' },
    { name: 'Wide-Leg Trousers', category: 'Bottoms', price: 4800, colors: ['Beige', 'Blue'], image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600' },
    { name: 'Statement Earrings', category: 'Accessories', price: 1200, colors: ['Red', 'Green'], image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600' },
];

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected for seeding');

    await Promise.all([User.deleteMany({}), Vendor.deleteMany({}), Product.deleteMany({})]);
    console.log('🗑️  Cleared all');

    // 👑 Admin user — for demoing user/product management
    await User.create({
        name: 'Admin',
        email: 'admin@flexfit.com',
        password: 'admin123',
        role: 'admin',
    });
    console.log('👑 Created admin: admin@flexfit.com / admin123');

    // 🏪 Demo vendor
    const vendorUser = await User.create({
        name: 'Demo Vendor',
        email: 'vendor@flexfit.com',
        password: 'vendor123',
        role: 'vendor',
    });

    const vendor = await Vendor.create({
        user: vendorUser._id,
        storeName: 'Urban Threads',
        businessRegNo: 'BR-2026-001',
        description: 'Modern streetwear for the Sri Lankan fashion scene',
        status: 'approved',
        bankDetails: { accountName: 'Demo Vendor', accountNumber: '1234567890', bankName: 'Commercial Bank', branch: 'Kandy' },
    });
    console.log(`🏪 Created vendor: ${vendor.storeName}`);

    const sizes = [
        { size: 'XS', stock: 5 }, { size: 'S', stock: 10 }, { size: 'M', stock: 15 },
        { size: 'L', stock: 12 }, { size: 'XL', stock: 8 }, { size: 'XXL', stock: 4 },
    ];

    for (const p of sampleProducts) {
        await Product.create({
            vendor: vendor._id,
            name: p.name,
            description: `${p.name} — premium quality, ethically sourced.`,
            category: p.category,
            price: p.price,
            images: [p.image],
            colors: p.colors,
            sizes: sizes.map((s) => ({ ...s })),
            lowStockThreshold: 5,
        });
    }
    console.log(`👕 Created ${sampleProducts.length} products`);

    console.log('\n📧 Demo Accounts:');
    console.log('   👑 Admin:    admin@flexfit.com  / admin123');
    console.log('   🏪 Vendor:   vendor@flexfit.com / vendor123');

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });