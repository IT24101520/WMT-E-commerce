const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    try {
        const { products, totalAmount, paymentMethod, customizationId } = req.body;
        const order = new Order({
            user: req.user.id,
            products,
            totalAmount,
            paymentMethod,
            customization: customizationId
        });
        await order.save();

        // Also update the customization record to link to this order
        if (customizationId) {
            const Customization = require('../models/Customization');
            await Customization.findByIdAndUpdate(customizationId, { order: order._id });
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('products.product')
            .populate('customization')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('products.product')
            .populate('customization')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
