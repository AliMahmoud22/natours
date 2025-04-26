import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import ratelimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: './config.env' });
import Stripe from 'stripe';

import globalErrorHandler from './controller/globalErrorHandle.js';
import AppError from './utils/AppError.js';
import userRoute from './Routes/userRoutes.js';
import tourRoute from './Routes/tourRoutes.js';
import reviewRoute from './Routes/reviewRoutes.js';
import viewRoute from './Routes/viewRoutes.js';
import bookingRoute from './Routes/bookingRoutes.js';
import * as bookingController from './controller/bookingController.js';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
//to allow other sites to use APIs
app.use(cors());
app.options('*', cors());
app.enable('trust proxy');
// app.enable({ trustproxy: false });
if (process.env.DB_CLIENT)
  mongoose
    // .connect(process.env.LOCAL_DATABASE)
    .connect(
      process.env.HOSTED_DATABASE.replace(
        '<db_password>',
        process.env.DB_PASSWORD,
      ),
    )
    .then(() => {
      process.env.DB_CLIENT = true;
      console.log('DataBase connected!!');
    })
    .catch((er) => console.log(er));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://cdnjs.cloudflare.com',
  'https://js.stripe.com',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'ws:',
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
  'https://checkout.stripe.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// Global Middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", "'unsafe-eval'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ['https://js.stripe.com'],
    },
  }),
);
//logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //an hour
  message: 'too many requests. please try again later',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

app.use(
  express.json({
    limit: '10kb',
  }),
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

app.use('/', viewRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/bookings', bookingRoute);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);

process.on('uncaughtException', (err) => {
  console.log('unhandeled exception caught! \n Error 💥');
  console.log(err);
  console.log('shutting down...');
  process.exit(1);
});

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

export default app;
