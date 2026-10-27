const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('PASTE_YOUR_MONGODB_URI_HERE')) {
      console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: MONGODB_URI is not configured in server/.env yet.');
      console.warn('\x1b[36m%s\x1b[0m', '👉 Please open server/.env and paste your MongoDB connection string to enable full database persistence.');
      return;
    }

    const conn = await mongoose.connect(uri);
    console.log(`\x1b[32m✔ MongoDB Connected Successfully: ${conn.connection.host} [Database: ${conn.connection.name}]\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m✖ MongoDB Connection Error: ${error.message}\x1b[0m`);
    // Do not exit process in development to allow server to provide clear diagnostics
  }
};

module.exports = connectDB;
