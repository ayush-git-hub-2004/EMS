const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management', {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      maxPoolSize: 10,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting because MongoDB connection failed in production.');
      process.exit(1);
    } else {
      console.error('\n⚠️  MongoDB is not running or not accessible!');
      console.error('Please:');
      console.error('1. Start MongoDB: sudo systemctl start mongod');
      console.error('2. OR use MongoDB Atlas (cloud): Update MONGODB_URI in .env file');
      console.error('3. Then restart the server\n');
    }
  }
};

module.exports = connectDB;
