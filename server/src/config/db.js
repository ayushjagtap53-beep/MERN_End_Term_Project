const mongoose = require('mongoose');

/**
 * Sanitizes MongoDB connection URIs by URL-encoding special characters in the password.
 * E.g., 'mongodb+srv://user:pass@123@cluster.mongodb.net/' -> 'mongodb+srv://user:pass%40123@cluster.mongodb.net/'
 */
function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;

  const match = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^@\/]+)(\/.*)?$/);
  if (!match) return rawUri;

  const [, protocol, username, rawPassword, host, rest] = match;

  // Safely encode password without double-encoding
  let cleanPassword = rawPassword;
  try {
    cleanPassword = decodeURIComponent(rawPassword);
  } catch (e) {
    // Already raw
  }
  const encodedPassword = encodeURIComponent(cleanPassword);

  let pathAndParams = rest || '/mediflow?retryWrites=true&w=majority';
  if (pathAndParams === '/' || pathAndParams === '') {
    pathAndParams = '/mediflow?retryWrites=true&w=majority';
  }

  return `${protocol}${username}:${encodedPassword}@${host}${pathAndParams}`;
}

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('PASTE_YOUR_MONGODB_URI_HERE')) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: MONGODB_URI is not configured in server/.env yet.');
    console.warn('\x1b[36m%s\x1b[0m', '👉 Please open server/.env and paste your MongoDB connection string to enable full database persistence.');
    return null;
  }

  // Auto-sanitize password if it contains unescaped special characters
  const sanitizedUri = sanitizeMongoUri(uri);

  try {
    console.log('\x1b[34mℹ Attempting MongoDB connection...\x1b[0m');
    const conn = await mongoose.connect(sanitizedUri);
    console.log(`\x1b[32m✔ MongoDB Connected Successfully: ${conn.connection.host} [Database: ${conn.connection.name}]\x1b[0m`);
    return conn;
  } catch (error) {
    console.error(`\x1b[31m✖ MongoDB Connection Error: ${error.message}\x1b[0m`);

    if (error.message.includes('authentication failed')) {
      console.warn('\x1b[33m%s\x1b[0m', '👉 Authentication Failed Tips:');
      console.warn('\x1b[33m%s\x1b[0m', '   1. Check MongoDB Atlas -> Database Access -> Database Users.');
      console.warn('\x1b[33m%s\x1b[0m', '   2. Ensure the user exists and reset the password to verify it matches server/.env.');
      console.warn('\x1b[33m%s\x1b[0m', '   3. Check that the user has "Read and write to any database" privileges.');
    }

    // Try in-memory fallback if available
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('\x1b[33m⚡ Starting In-Memory MongoDB Server fallback for development...\x1b[0m');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`\x1b[32m✔ Connected to In-Memory MongoDB: ${memUri}\x1b[0m`);
      return conn;
    } catch (memErr) {
      // Memory server not installed or failed to start
      console.log('\x1b[33mℹ In-memory fallback not available. Please verify your Atlas credentials.\x1b[0m');
    }

    return null;
  }
};

module.exports = connectDB;
module.exports.sanitizeMongoUri = sanitizeMongoUri;
