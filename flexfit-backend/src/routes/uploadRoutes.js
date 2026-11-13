const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/upload
// @desc    Upload a single image to Cloudinary, returns the public CDN URL
router.post('/', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // req.file.path     → Cloudinary secure_url (https://res.cloudinary.com/...)
    // req.file.filename → Cloudinary public_id
    res.json({
        success: true,
        url: req.file.path,   // permanent CDN URL — visible to all team members
        filename: req.file.filename,
        size: req.file.size,
    });
});

module.exports = router;