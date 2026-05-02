const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});
app.options('(.*)', cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/customs', require('./routes/customizationRoutes'));
app.use('/api/promos', require('./routes/promoRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));

// Static Folders
app.use('/uploads', express.static('uploads'));

// Health Check Endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'EGO Personalized E-Commerce API is healthy',
        timestamp: new Date().toISOString()
    });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.send('EGO Personalized E-Commerce API is running...');
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
    });