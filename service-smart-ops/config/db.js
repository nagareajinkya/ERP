const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_ops_db';
        await mongoose.connect(uri);
    } catch (error) {
        process.exit(1);
    }
};

module.exports = connectDB;
