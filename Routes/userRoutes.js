import express from 'express';
import * as usercontroller from '../controller/userController.js';
import * as authController from '../controller/authController.js';

const Router = express.Router();
Router.route('/signup').post(
  usercontroller.uploadPhoto,
  usercontroller.resizeUserphoto,
  authController.signUp,
);
Router.route('/login').post(authController.login);
Router.route('/logout').get(authController.logout);
Router.route('/forgotPassword').post(authController.forgotPassword);
Router.route('/resetPassword/:token').patch(authController.resetPassword);

Router.use(authController.protect);

Router.route('/updatePassword').patch(authController.updatePassword);
Router.route('/me')
  .get(usercontroller.getMe, usercontroller.getUser)
  .patch(
    usercontroller.uploadPhoto,
    usercontroller.resizeUserphoto,
    usercontroller.updateMe,
  )
  .delete(usercontroller.deleteMe);

Router.use(authController.restrict('admin'));

Router.route('/')
  .get(usercontroller.getAllUsers)
  .post(usercontroller.createUser);
Router.route('/:email/:id?')
  .get(usercontroller.getUser)
  .patch(
    usercontroller.uploadPhoto,
    usercontroller.resizeUserphoto,
    usercontroller.updateUser,
  )
  .delete(usercontroller.deleteUser);

export default Router;
