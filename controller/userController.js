import multer from 'multer';
import sharp from 'sharp';
import User from './../Model/userModel.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './factoryHandler.js';
import { v2 as cloudinary } from 'cloudinary';

const filterBody = (body, ...filterBody) => {
  const filtered = {};
  Object.keys(body).forEach((el) => {
    if (filterBody.includes(el)) filtered[el] = body[el];
  });
  return filtered;
};
const multerStorage = multer.memoryStorage();
const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else cb(new AppError('please upload image only', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFileFilter });

export const uploadPhoto = upload.single('photo');
export const resizeUserphoto = catchAsync(async (req, res, next) => {
  //check if there is image
  if (!req.file) return next();

  //logged in user wants to change photo
  if (req.user) {
    //admin wants to change user's photo
    if (req.user.role == 'admin' && req.body.email !== req.user.email) {
      req.file.filename = `user-${req.body.email}-${Date.now()}.jpeg`;
    }
    //logged in user changing their photo
    else req.file.filename = `user-${req.user.email}-${Date.now()}.jpeg`;
  }
  //user signin up with photo uploaded
  else {
    req.file.filename = `user-${req.body.email}-${Date.now()}.jpeg`;
  }

  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload the image to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'users', public_id: req.file.filename, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          reject(new AppError('Failed to upload image to Cloudinary', 500));
        } else resolve(result);
      },
    );
    uploadStream.end(buffer);
  });

  // Save the Cloudinary URL to req.body.photo
  req.body.photo = result.secure_url;
  // req.file.filename = result.secure_url;
  next();
});
export const updateMe = catchAsync(async (req, res, next) => {
  //1) if user try to update password give error
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('you cant update password from here.', 400));
  //2)filter the req.body

  // const filteredBody = filterBody(req.body, 'name', 'email');
  // console.log('update me filteredBody : ', filteredBody);
  // if (req.file) filteredBody.photo = req.file.filename;
  let filteredBody;
  if (req.file) filteredBody = filterBody(req.body, 'name', 'email', 'photo');
  else filteredBody = filterBody(req.body, 'name', 'email');

  //3) update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  //4)return updated user
  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  if (!(await User.findByIdAndUpdate(req.user.id, { active: false })))
    return next(new AppError('no user found to delete!', 404));
  res.status(204).json({ status: 'success' });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getUser = factory.getOne(User);
export const getAllUsers = factory.getAll(User);
export const createUser = factory.createOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
