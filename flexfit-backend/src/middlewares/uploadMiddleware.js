const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Store images directly in Cloudinary under the "flexfit/products" folder.
// All team members share the same Cloudinary account, so anyone who runs
// the app can see images uploaded by anyone else.
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'flexfit/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
        public_id: (req, file) =>
            `product-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const mimeOk = allowed.test(file.mimetype);
    if (mimeOk) cb(null, true);
    else cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;