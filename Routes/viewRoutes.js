import express from 'express';
import * as viewController from '../controller/viewController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router.use(viewController.alerts);
router.use(authController.isLoggedIn);
router.route('/').get(viewController.getOverview);
router.route('/tour/:tourSlug').get(viewController.getTour);
router.route('/login').get(viewController.login);
router.route('/signup').get(viewController.signup);

router.route('/me').get(authController.protect, viewController.account);
router
  .route('/my-tours')
  .get(authController.protect, viewController.getMyTours);
router
  .route('/my-reviews')
  .get(authController.protect, viewController.getMyReviews);
//update user data without api
router
  .route('/submit-user-data')
  .post(authController.protect, viewController.updateUserData);

router
  .route('/manage-tours')
  .get(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    viewController.manageTours,
  );
router
  .route('/manage-users')
  .get(
    authController.protect,
    authController.restrict('admin'),
    viewController.manageUsers,
  );
router
  .route('/manage-reviews')
  .get(
    authController.protect,
    authController.restrict('admin'),
    viewController.manageReviews,
  );
router
  .route('/manage-bookings')
  .get(
    authController.protect,
    authController.restrict('admin'),
    viewController.manageBookings,
  );
export default router;
