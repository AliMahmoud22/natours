import AppError from './../utils/AppError.js';
import catchAsync from './../utils/catchAsync.js';
import apiFeatures from './../utils/apiFeatures.js';
import Review from '../Model/reviewModel.js';
export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let doc;
    if (req.params.id) {
      doc = await Model.findByIdAndDelete(req.params.id);
    } else {
      if (Model === Review) {
        doc = await Model.findOneAndDelete()
          .populate({
            path: 'user',
            select: 'name',
            match: { name: req.params.userName },
          })
          .populate({
            path: 'tour',
            select: 'name',
            match: { name: req.params.tourName },
          });
      } else doc = await Model.findOneAndDelete({ name: req.params.name });
    }

    if (!doc) {
      return next(new AppError('no document found with that id!', 404));
    }
    res.status(204).json({
      status: 'success',
      message: 'document is deleted successfully',
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
    console.log(req.params);
    console.log(req.body);
    let updatedDocument;
    if (req.params.id) {
      updatedDocument = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      if (Model === Review) {
        updatedDocument = Model.findOneAndupdate(
          {
            'user.name': req.params.userName,
            'tour.name': req.params.tourName,
          },
          req.body,
          { runValidators: true, new: true },
        )
          .populate({
            path: 'user',
            match: { name: req.params.userName },
          })
          .populate({
            path: 'tour',
            match: { name: req.params.tourName },
          });
      } else {
        updatedDocument = await Model.findOneAndUpdate(
          { name: req.params.name },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );
      }
    }

    if (!updatedDocument) {
      return next(new AppError(`Document isn't found to update.`, 404));
    }
    res.status(200).json({
      status: 'success',
      updatedDocument,
    });
  });

export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc) {
      return next(new AppError('no Document found with that id!', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Document found',
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
