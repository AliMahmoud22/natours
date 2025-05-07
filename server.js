import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import app from './app.js';
import mongoose from 'mongoose';
import connectToDatabase from './utils/database.js';
import { v2 as cloudinary } from 'cloudinary';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const port = process.env.PORT || 4000;

(async () => {
  try {
    await connectToDatabase();
    console.log('🌐 MongoDB connected.');

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    process.on('unhandledRejection', async (err) => {
      console.error('Unhandled Rejection! 💥');
      console.error(err);
      await mongoose.connection.close();
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();
