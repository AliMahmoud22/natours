import express from 'express';
import * as reviewController from '../controller/reviewController.js';
import * as authController from '../controller/authController.js';

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrict('user'),
    reviewController.setTourIdAndUserId,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrict('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrict('user', 'admin'),
    reviewController.deleteReview,
  );

export default router;
