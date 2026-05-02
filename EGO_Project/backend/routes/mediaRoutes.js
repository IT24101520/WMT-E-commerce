const express = require('express');
const router = express.Router();
const controller = require('../controllers/mediaController');
const auth = require('../middleware/authMiddleware');

router.post('/upload', auth, controller.uploadMiddleware, controller.uploadImage);

module.exports = router;
