import AppError from './../utils/AppError.js';
import catchAsync from './../utils/catchAsync.js';
import apiFeatures from './../utils/apiFeatures.js';
import Review from '../Model/reviewModel.js';
import Tour from '../Model/tourModel.js';
import User from '../Model/userModel.js';
export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let doc;
    if (req.params.id) {
      doc = await Model.findByIdAndDelete(req.params.id);
    } else {
      if (Model === Review) {
        const tour = await Tour.findOne({ name: req.params.tourName });
        const user = await User.findOne({ name: req.params.userName });
        if (!tour || !user)
          return next(
            new AppError(
              `No ${Model.modelName} found with that username and tour name !`,
              404,
            ),
          );
        doc = await Model.findOneAndDelete({
          user: user._id,
          tour: tour._id,
        })
          .populate({
            path: 'user',
            select: 'name',
          })
          .populate({
            path: 'tour',
            select: 'name',
          });
      } else if (Model === User)
        doc = await Model.findOneAndDelete({ email: req.params.email });
      else doc = await Model.findOneAndDelete({ name: req.params.name });
    }

    if (!doc) {
      return next(
        new AppError(`No ${Model.modelName} found with that id!`, 404),
      );
    }
    res.status(204).json({
      status: 'success',
      message: `${Model.modelName} is deleted successfully`,
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    prepareData(req);
    const newDocument = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      message: `created successfuly`,
      newDocument,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    prepareData(req);
    let updatedDocument;
    if (req.params.id) {
      updatedDocument = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      if (Model === Review) {
        const tour = await Tour.findOne({ name: req.params.tourName });
        const user = await User.findOne({ name: req.params.userName });
        if (!tour || !user)
          return next(
            new AppError(
              `No Review found with that username and tour name !`,
              404,
            ),
          );
        updatedDocument = await Model.findOneAndUpdate(
          { tour: tour._id, user: user._id },
          req.body,
          {
            runValidators: true,
            new: true,
          },
        )
          .populate('user')
          .populate('tour');
      } else if (Model === Tour) {
        updatedDocument = await Model.findOneAndUpdate(
          { name: req.params.name },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
      } else if (Model === User) {
        updatedDocument = await Model.findOneAndUpdate(
          { email: req.params.email },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
      }
    }

    if (!updatedDocument) {
      return next(
        new AppError(`${Model.modelName} isn't found to update.`, 404),
      );
    }
    res.status(200).json({
      status: 'success',
      updatedDocument,
    });
  });

export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query;
    if (req.params.id) query = Model.findById(req.params.id);
    else {
      //if searching with user email
      if (req.params.email) query = Model.findOne({ email: req.params.email });
      //if searching about review OR booking with tour's name and username
      else if (Model === Review) {
        const tour = await Tour.findOne({ name: req.params.tourName });
        const user = await User.findOne({ name: req.params.userName });
        if (!tour || !user)
          return next(
            new AppError(
              `No ${Model.modelName} found with that username and tour name !`,
              404,
            ),
          );
        query = Model.findOne({
          user: user._id,
          tour: tour._id,
        })
          .populate({ path: 'tour', select: 'name' })
          .populate({ path: 'user', select: 'name' });
      }
    }

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc) {
      return next(
        new AppError(`No ${Model.modelName} found with that id!`, 404),
      );
    }
    res.status(200).json({
      status: `success`,
      message: `${Model.modelName} found`,
      doc,
    });
  });

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //filter is used to get reviews of tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const apiFeaturesobj = new apiFeatures(Model.find(filter), req.query)
      .filter()
      .fields()
      .sort()
      .paginate();
    const allDocuments = await apiFeaturesobj.query;
    res.status(200).json({
      status: 'success',
      results: allDocuments.length,
      data: {
        data: allDocuments,
      },
    });
  });

//parse Json input in body
const prepareData = (req) => {
  if (req.body.locations) {
    req.body.locations = JSON.parse(req.body.locations);
  }
  if (req.body.guides) {
    req.body.guides = JSON.parse(req.body.guides);
  }
  if (req.body.startLocation) {
    req.body.startLocation = JSON.parse(req.body.startLocation);
  }
  // Ensure startDates is an array of Date objects
  if (req.body.startDates) {
    if (Array.isArray(req.body.startDates)) {
      req.body.startDates = req.body.startDates.map((date) => new Date(date));
    } else req.body.startDates = new Date(req.body.startDates);
  }
};
