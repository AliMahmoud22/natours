import review from '../Model/reviewModel.js';
import * as factory from './factoryHandler.js';

export const setTourIdAndUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const getReview = factory.getOne(review);
export const getAllReviews = factory.getAll(review);
export const createReview = factory.createOne(review);
export const updateReview = factory.updateOne(review);
export const deleteReview = factory.deleteOne(review);
