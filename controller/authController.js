import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import AppError from './../utils/AppError.js';
import User from './../Model/userModel.js';
import catchAsync from './../utils/catchAsync.js';
import Email from './../utils/email.js';

const getToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};

const createSendToken = (user, statusCode, message, req, res) => {
  const token = getToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    message,
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, 'New user created.❤️', req, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) check if there password and email
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  //2) check the password and email
  const user = await User.findOne({ email }).select('+password'); // password select is false so to include it put +
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('email or password is wrong', 401));
  //3)send token to user
  createSendToken(user, 200, 'logged in', req, res);
});
export const logout = (req, res) => {
  res.cookie('jwt', ' logged out ', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

export const protect = catchAsync(async (req, res, next) => {
  // 1) check if there is token sent

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //if there is no token send error
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  // 2) verify token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );
  // 3) user still exits and isn't deleted !
  const freshUser = await User.findById(decodedToken.id);
  if (!freshUser) {
    return next(
      new AppError('user belong to this token is no longer exit.', 401),
    );
  }

  // 4) check if passward changed
  if (freshUser.isPasswordChanged(decodedToken.iat)) {
    return next(new AppError('this token is expired. please log in.'));
  }
  res.locals.user = freshUser;
  req.user = freshUser;
  next();
});

export const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you dont have premission to do this action!', 403),
      );
    }
    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  //1) check the email sent in req
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`this email isn't found`, 404));
  }
  //2) get restToken
  const resetToken = user.createForgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  //3 send the token to user email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'email sent!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'there was an error sending the email. please try again later!',
        500,
      ),
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const cryptedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: cryptedToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('invalid token or token is expired!'), 400);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;

  await user.save();
  createSendToken(user, 200, 'password is changed successfuly', req, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id).select('+password');
  if (!currentUser) {
    return next(new AppError('no user is found! please login.', 404));
  }
  if (
    !(await currentUser.correctPassword(
      req.body.password,
      currentUser.password,
    ))
  ) {
    return next(new AppError('password is wrong!', 401));
  }
  currentUser.password = req.body.newPassword;
  currentUser.passwordConfirm = req.body.newPasswordConfirm;
  await currentUser.save();
  createSendToken(currentUser, 200, 'password changed, logged in', req, res);
});

//to render elements only if logged in (such as logout and account) otherwise render another elements(such as login and sign up)
export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //  verify token
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      //  user still exits and isn't deleted !
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return next();
      }

      //  check if passward changed
      if (user.isPasswordChanged(decodedToken.iat)) {
        return next();
      }
      //user logged in
      res.locals.user = user;
    } catch (err) {
      return next();
    }
  }
  next();
};
