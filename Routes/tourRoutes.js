import express from 'express';
import * as authController from '../controller/authController.js';
import * as tourController from '../controller/tourController.js';
import reviewRouter from './reviewRoutes.js';

const Router = express.Router();

Router.use('/:tourId/reviews', reviewRouter);

Router.route('/top-5-cheap').get(
  tourController.top_5_cheap,
  tourController.getAllTours,
);
Router.route('/get-stats').get(tourController.getstats);
Router.route('/getmonthlyplan/:year').get(
  authController.protect,
  authController.restrict('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan,
);
Router.route('/tours-within/distance/:distance/center/:lnglat/unit/:unit').get(
  tourController.tourWithin,
);

Router.route('/tour-distances/distance/:latlng/unit/:unit').get(
  tourController.getDistances,
);
Router.route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.uploadTourImage,
    tourController.resizeTourImage,
    tourController.createTour,
  );
Router.route('/:name/:id?')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.uploadTourImage,
    tourController.resizeTourImage,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.deleteTour,
  );

export default Router;
