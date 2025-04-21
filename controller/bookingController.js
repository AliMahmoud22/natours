import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Tour from '../Model/tourModel.js';
import Booking from '../Model/bookingModel.js';
import * as factoryHandler from './factoryHandler.js';

import {stripe} from '../index.js';
export const checkout = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError('there is no Tour with this ID!', 404));

  const session = await stripe.checkout.sessions.create({
    client_reference_id: req.params.tourId,
    cancel_url: `${req.protocol}://${req.get('host')}/`,
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
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
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
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

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

export const createBooking = factoryHandler.createOne(Booking);
export const updateBooking = factoryHandler.updateOne(Booking);
export const deleteBooking = factoryHandler.deleteOne(Booking);
export const getBooking = factoryHandler.getOne(Booking);
export const getAllBookings = factoryHandler.getAll(Booking);
