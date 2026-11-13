const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chatbotController');

router.post('/', ctrl.handleChat);

module.exports = router;
