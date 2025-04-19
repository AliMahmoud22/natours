import express from 'express';
import * as authController from '../controller/authController.js';
import * as bookingController from '../controller/bookingController.js';

const router = express.Router();

router.use(authController.protect);
router.get('/checkout/:tourId', bookingController.checkout);
router.use(authController.restrict('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
export default router;
