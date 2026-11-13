const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    updateProfile,
    deleteProfile,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validate, registerRules, loginRules } = require('../middlewares/validationMiddleware');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

// ── Password reset (public) ─────────────────────────────
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router
    .route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile)
    .delete(protect, deleteProfile);

module.exports = router;