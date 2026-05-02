const Media = require('../models/Media');
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('image');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        const media = new Media({
            fileName: req.file.filename,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype
        });
        await media.save();

        res.status(201).json({ url: media.fileUrl, media });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
