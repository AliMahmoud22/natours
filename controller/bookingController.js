import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Tour from '../Model/tourModel.js';
import User from '../Model/userModel.js';
import Booking from '../Model/bookingModel.js';
import * as factoryHandler from './factoryHandler.js';
import Stripe from 'stripe';

// import { stripe } from '../app.js';
 const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const checkout = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError('there is no Tour with this ID!', 404));

  let image;
  //if photo stored in cloudinary
  if (tour.imageCover.startsWith('http')) image = `${tour.imageCover}`;
  //if photo stored locally
  else
    image = `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`;
  console.log(image);
  const session = await stripe.checkout.sessions.create({
    client_reference_id: req.params.tourId,
    cancel_url: `${req.protocol}://${req.get('host')}/`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    customer_email: req.user.email,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, //in cents
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },

        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

//function to create booking in the DataBase
const createBookingCheckout = catchAsync(async (session) => {
  const price = session.amount_total / 100;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const tour = session.client_reference_id;
  await Booking.create({ tour, user, price });
});

export const webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`webhook error ${error.message} `);
  }
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);
  res.status(200).json({ received: true });
};
export const createBooking = factoryHandler.createOne(Booking);
export const updateBooking = factoryHandler.updateOne(Booking);
export const deleteBooking = factoryHandler.deleteOne(Booking);
export const getBooking = factoryHandler.getOne(Booking);
export const getAllBookings = factoryHandler.getAll(Booking);
