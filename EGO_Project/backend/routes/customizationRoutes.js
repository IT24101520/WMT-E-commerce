const express = require('express');
const router = express.Router();
const controller = require('../controllers/customizationController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', auth, upload.single('image'), controller.createCustomization);
router.get('/mycustoms', auth, controller.getUserCustomizations);
router.get('/:orderId', auth, controller.getCustomizationByOrder);

module.exports = router;
