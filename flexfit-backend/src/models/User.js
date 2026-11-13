const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: ['customer', 'vendor', 'admin'],
            default: 'customer',
        },
        phone: { type: String, trim: true },
        address: {
            street: String,
            street2: String,
            city: String,
            district: String,
            postalCode: String,
            country: String,
        },
        preferredSize: {
            type: String,
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        },
        isActive: { type: Boolean, default: true },

        // ── Password reset ─────────────────────────────────
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpire: { type: Date, select: false },
    },
    { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT) || 10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash a password reset token.
// The RAW token is returned to the caller (to email to the user).
// Only the HASHED token is stored in the DB — even if the DB leaks,
// the raw token can't be recovered.
userSchema.methods.getResetPasswordToken = function () {
    const rawToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    return rawToken;
};

module.exports = mongoose.model('User', userSchema);