import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
  console.log('unhandeled exception caught! \n Error 💥');
  console.log(err);
  console.log('shutting down...');
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });

mongoose
  .connect(process.env.LOCAL_DATABASE)
  .then(() => console.log('Local DataBase connected!!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}.........`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, '\n', err.message);
  console.log('shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
