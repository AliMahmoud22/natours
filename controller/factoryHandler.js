import AppError from './../utils/AppError.js';
import catchAsync from './../utils/catchAsync.js';
import apiFeatures from './../utils/apiFeatures.js';

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
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
    const newDocument = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      message: `created successfuly`,
      data: newDocument,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDocument = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
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
    //used to get reviews of tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const apiFeaturesobj = new apiFeatures(Model.find(filter), req.query)
      .filter()
      .fields()
      .sort()
      .paginate();
    const allDocuments = await apiFeaturesobj.query;
    // const allDocuments = await apiFeaturesobj.query.explain();
    res.status(200).json({
      status: 'success',
      results: allDocuments.length,
      data: {
        data: allDocuments,
      },
    });
  });
