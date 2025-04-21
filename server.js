import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import app from './app.js';

dotenv.config({ path: './config.env' });

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

process.on('uncaughtException', (err) => {
  console.log('unhandeled exception caught! \n Error 💥');
  console.log(err);
  console.log('shutting down...');
  process.exit(1);
});

mongoose
  .connect(
    process.env.HOSTED_DATABASE.replace(
      '<db_password>',
      process.env.DB_PASSWORD,
    ),
  )
  // .connect(process.env.LOCAL_DATABASE)
  .then(() => console.log('DataBase connected!!'));

const port = process.env.PORT || 4000;
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
