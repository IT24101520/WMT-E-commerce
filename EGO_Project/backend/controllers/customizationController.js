const Customization = require('../models/Customization');

exports.createCustomization = async (req, res) => {
    try {
        const { productId, personalizedMessage, fontStyle, colorCode, theme } = req.body;
        const customImage = req.file ? `/uploads/${req.file.filename}` : null;

        const customization = new Customization({
            user: req.user.id,
            productId: productId === 'demo_1' ? null : productId, // Handle demo fallback
            personalizedMessage,
            fontStyle,
            colorCode,
            theme,
            customImage
        });

        await customization.save();
        res.status(201).json(customization);
    } catch (error) {
        console.error("Customization error:", error);
        res.status(400).json({ message: error.message });
    }
};

exports.getUserCustomizations = async (req, res) => {
    try {
        const customs = await Customization.find({ user: req.user.id }).populate('productId');
        res.json(customs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCustomizationByOrder = async (req, res) => {
    try {
        const custom = await Customization.findOne({ order: req.params.orderId });
        res.json(custom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
