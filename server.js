import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

process.on('uncaughtException', (err) => {
  console.log('unhandeled exception caught! \n Error 💥');
  console.log(err);
  console.log('shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
import { v2 as cloudinary } from 'cloudinary';
import app from './app.js';
import connectToDatabase from './utils/database.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let server;
(async () => {
  try {
    await connectToDatabase(); // Connect to the database
    console.log('Database connected successfully.');
    const port = process.env.PORT || 4000;
    server = app.listen(port, () => {
      console.log(`listening on port ${port}.........`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
})();

process.on('unhandledRejection', async (err) => {
  console.log(err.name, '\n', err.message);
  console.log('shutting down...');
  await mongoose.connection.close();
  server.close(() => {
    process.exit(1);
  });
});
export default server;
