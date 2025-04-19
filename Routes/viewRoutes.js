import express from 'express';
import * as viewController from '../controller/viewController.js';
import * as authController from '../controller/authController.js';
import * as bookingController from '../controller/bookingController.js';
const router = express.Router();

router
  .route('/')
  .get(
    bookingController.createBookingCheckout,
    authController.isLoggedIn,
    viewController.getOverview,
  );
router
  .route('/tour/:tourSlug')
  .get(authController.isLoggedIn, viewController.getTour);
router.route('/login').get(authController.isLoggedIn, viewController.login);
router.route('/me').get(authController.protect, viewController.account);
router
  .route('/my-tours')
  .get(authController.protect, viewController.getMyTours);
//update user data without api
router
  .route('/submit-user-data')
  .post(authController.protect, viewController.updateUserData);
export default router;
