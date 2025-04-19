import User from './../Model/userModel.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './factoryHandler.js';
import multer from 'multer';
import sharp from 'sharp';

const filterBody = (body, ...filterBody) => {
  const filtered = {};
  Object.keys(body).forEach((el) => {
    if (filterBody.includes(el)) filtered[el] = body[el];
  });
  return filtered;
};
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'starter/public/img/users');
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       `user-${req.user.id}-${Date.now()}.${file.mimetype.split('/')[1]}`,
//     );
//   },
// });
const multerStorage = multer.memoryStorage();
const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else cb(new AppError('please upload image only', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFileFilter });

export const uploadPhoto = upload.single('photo');
export const resizeUserphoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg(90)
    .toFile(`starter/public/img/users/${req.file.filename}`);
  next();
});
export const updateMe = catchAsync(async (req, res, next) => {
  //1) if user try to update password give error
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('you cant update password from here.', 400));
  //2)filter the req.body
  const filteredBody = filterBody(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
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
