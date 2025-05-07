import mongoose from 'mongoose';

let cachedDb = null; // Cache the database connection

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection.');
    return cachedDb;
  }

  if (mongoose.connection.readyState === 1) {
    console.log('Database already connected.');
    return mongoose.connection;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Use connection pooling
    });
    cachedDb = db; // Cache the connection
    console.log('New database connection established.');
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export default connectToDatabase;
