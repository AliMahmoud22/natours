import multer from 'multer';
import sharp from 'sharp';
import AppError from '../utils/AppError.js';
import Tour from './../Model/tourModel.js';
import catchAsync from './../utils/catchAsync.js';
import * as factory from './factoryHandler.js';
import { v2 as cloudinary } from 'cloudinary';




//routing handeling
export const getAllTours = factory.getAll(Tour);
export const getTour = factory.getOne(Tour, { path: 'reviews' });
export const createTour = factory.createOne(Tour);
export const updateTour = factory.updateOne(Tour);
export const deleteTour = factory.deleteOne(Tour);
export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, long] = latlng.split(',');
  if (!lat || !long)
    next(new AppError('please provide the latitude and longitude!', 400));

  const multiplier = unit === 'mil' ? 0.000621371 : 0.001;
  //geoNear must be the first stage at all otherwise will give error!
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [long * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    length: distances.length,
    data: {
      data: distances,
    },
  });
});
export const tourWithin = catchAsync(async (req, res, next) => {
  const { distance, lnglat, unit } = req.params;
  const [lat, long] = lnglat.split(',');
  const radius = unit === 'mil' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !long)
    next(new AppError('please provide the latitude and longitude!', 400));
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: {
      data: tours,
    },
  });
});
export const getstats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        number: { $sum: 1 },
      },
    },
    { $sort: { number: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    result: stats,
  });
});
export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numberTours: { $sum: 1 },
        tourNames: { $push: '$name' },
      },
    },
    { $sort: { numberTours: -1 } },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
  ]);
  res.status(200).json({
    status: 'success',
    result: plan,
  });
});
export const top_5_cheap = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};
const multerStorage = multer.memoryStorage();
const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else cb(new AppError('please upload image only', 400), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFileFilter });
export const uploadTourImage = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
export const resizeTourImage = catchAsync(async (req, res, next) => {
  if (req.files) {
    if (req.files.imageCover) {
      const imageCoverName = `tour-${req.body.name}-${Date.now()}-cover.jpeg`;
      const buffer = await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toBuffer();
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'tours',
            public_id: imageCoverName,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              reject(new AppError('Failed to upload image to Cloudinary', 500));
            } else resolve(result);
          },
        );
        uploadStream.end(buffer);
      });

      // Save the Cloudinary URL to req.body.imageCover
      req.body.imageCover = result.secure_url;
    }
    //resize images
    if (req.files.images) {
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (img, i) => {
          const imgName = `tour-${req.body.name}-${Date.now()}-${i + 1}.jpeg`;
          const buffer = await sharp(img.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toBuffer();
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'tours', public_id: imgName, resource_type: 'image' },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary Upload Error:', error);
                  reject(
                    new AppError('Failed to upload image to Cloudinary', 500),
                  );
                } else resolve(result);
              },
            );
            uploadStream.end(buffer);
          });
          req.body.images.push(result.secure_url);
        }),
      );
    }
   
  }
  next();
});
