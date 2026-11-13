const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

const registerRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];

const loginRules = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
];

const productRules = [
    body('name').trim().notEmpty().withMessage('Product name required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('category').notEmpty().withMessage('Category required'),
];

module.exports = { validate, registerRules, loginRules, productRules };