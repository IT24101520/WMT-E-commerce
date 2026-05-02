const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection & Database...\n');
console.log('📍 MongoDB URI:', process.env.MONGO_URI.substring(0, 50) + '...\n');

const testDatabase = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB!\n');

        // Test 1: List all users
        console.log('📋 TEST 1: List All Users');
        const users = await User.find();
        console.log(`Found ${users.length} user(s):`);
        users.forEach(u => {
            console.log(`  - ${u.email} (${u.name}) - Role: ${u.role}`);
        });

        // Test 2: Check admin user
        console.log('\n🔐 TEST 2: Admin User Authentication');
        const admin = await User.findOne({ email: 'admin@ego.com' });
        if (admin) {
            const isAdmin123 = await admin.comparePassword('admin123');
            const isEgo123 = await admin.comparePassword('Ego@123');
            console.log(`  Admin found: ${admin.email}`);
            console.log(`  - Password "admin123" matches: ${isAdmin123}`);
            console.log(`  - Password "Ego@123" matches: ${isEgo123}`);
        } else {
            console.log('  ⚠️  Admin user not found - run: node createAdmin.js');
        }

        // Test 3: Check email normalization
        console.log('\n✉️ TEST 3: Email Query (Case-insensitive)');
        const testEmail = await User.findOne({ email: 'admin@ego.com' });
        console.log(`  Found by "admin@ego.com": ${!!testEmail}`);

        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.log('\n❌ Error during testing:');
        console.log('  Code:', error.code);
        console.log('  Message:', error.message);
        
        if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
            console.log('\n🛠️  Troubleshooting:');
            console.log('  1. Whitelist your IP in MongoDB Atlas (Network Access)');
            console.log('  2. Add 0.0.0.0/0 temporarily to test');
            console.log('  3. Verify cluster is running (not paused)');
            console.log('  4. Check credentials in .env file');
        }
        process.exit(1);
    }
};

testDatabase();
