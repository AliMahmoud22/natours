import AppError from './../utils/AppError.js';

const sendMessageDev = (err, req, res) => {
  //A) /API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      err,
      message: err.message,
      stack: err.stack,
    });
  }
  //B) WEBSITE
  console.error('error!💥', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendMessageProd = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('error!💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong ❗',
    });
  }
  //B) WEBSITE
  else {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    }
    //Unkonw Programming Error Or Unknow Error
    console.error('error!💥', err);
    return res.status(500).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.',
    });
  }
};

const handleCastErrorDB = (err) => {
  return new AppError(`invalid ${err.path}: ${err.value}`, 400);
};

const handleValidationErrorDB = (err) => {
  let messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(`${messages.join('. ')}`, 400);
};

const handleDuplicateKeyDB = (err) => {
  let value = `${err.errmsg}`.match(/"([^\\"]*)"/g)[0];
  return new AppError(
    `Duplicate field value :${value}. please use another value.`,
    400,
  );
};

const handleJWTError = () => {
  return new AppError('invalid token! please log in again.', 401);
};

const handleTokenExpiredError = () => {
  return new AppError('token expired! please login again.', 401);
};
const handleJwtMalformed = () => {
  return new AppError('Token is invaild, please login again.', 401);
};
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendMessageDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = new Object(err);
    //another way to create copy or the error
    // let error = { ...err };
    // error.message = err.message;
    if (error.name == 'jwt malformed') error = handleJwtMalformed(error);
    if (error.name == 'CastError') error = handleCastErrorDB(error);
    if (error.name == 'ValidationError') error = handleValidationErrorDB(error);
    if (error.code == 11000) error = handleDuplicateKeyDB(error);
    if (error.name == 'JsonWebTokenError') error = handleJWTError();
    if (error.name == 'TokenExpiredError') error = handleTokenExpiredError();
    sendMessageProd(error, req, res);
  }
};
