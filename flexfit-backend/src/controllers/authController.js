const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ═══════════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════════

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password, role });

        res.status(201).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════

// @desc    Authenticate user and return JWT
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════

// @desc    Get current user's profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// @desc    Update profile info (name, phone, address, preferredSize, password)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.body.name !== undefined) user.name = req.body.name;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.address !== undefined) {
            user.address = {
                street: req.body.address.street || '',
                street2: req.body.address.street2 || '',
                city: req.body.address.city || '',
                district: req.body.address.district || '',
                postalCode: req.body.address.postalCode || '',
                country: req.body.address.country || 'Sri Lanka',
            };
        }
        if (req.body.preferredSize !== undefined) user.preferredSize = req.body.preferredSize;

        // If user wants to update password
        if (req.body.newPassword) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isMatch = await user.matchPassword(req.body.currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            if (req.body.newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters' });
            }
            user.password = req.body.newPassword;
        }

        const updated = await user.save();
        res.json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            phone: updated.phone || '',
            address: updated.address || {},
            preferredSize: updated.preferredSize || '',
            token: generateToken(updated._id),
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Soft-delete own account (deactivate)
// @route   DELETE /api/auth/profile
// @access  Private
exports.deleteProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 🛡️ Admin accounts cannot be self-deactivated — prevents lock-out
        if (user.role === 'admin') {
            return res.status(403).json({
                message: 'Admin accounts cannot be deactivated. Contact system owner.',
            });
        }

        user.isActive = false;
        await user.save();
        res.json({ success: true, message: 'Account deactivated' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════════════════
// PASSWORD RESET
// ═══════════════════════════════════════════════════════════════

// @desc    Request a password reset link via email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // ⚠️ Security: always respond with success, even if the user doesn't
        // exist. This prevents attackers from enumerating registered emails.
        if (!user) {
            return res.json({
                success: true,
                message: 'If that email is registered, a reset link has been sent.',
            });
        }

        const rawToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Build the reset URL pointing at the frontend route
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

        const message =
            `Hello ${user.name},\n\n` +
            `You requested a password reset for your FlexFit account.\n\n` +
            `Click the link below to choose a new password:\n` +
            `${resetUrl}\n\n` +
            `This link expires in 15 minutes. If you did not request this, ` +
            `you can safely ignore this email — your password will remain unchanged.\n\n` +
            `— FlexFit Team`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'FlexFit — Password Reset Request',
                message,
            });
        } catch (err) {
            // Roll back the token if the email failed to send
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res
                .status(500)
                .json({ message: 'Could not send email. Try again later.' });
        }

        res.json({
            success: true,
            message: 'If that email is registered, a reset link has been sent.',
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Reset password using token from email
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res
                .status(400)
                .json({ message: 'Password must be at least 6 characters' });
        }

        // Hash the raw token from the URL and look up the user
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Reset link is invalid or has expired' });
        }

        // Set the new password — the pre-save hook will hash it
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful. You can now sign in.',
            token: generateToken(user._id),
        });
    } catch (err) {
        next(err);
    }
};