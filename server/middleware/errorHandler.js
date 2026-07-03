const { AppError } = require('../utils/AppError');

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already in use`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpired = () =>
  new AppError('Token expired. Please log in again.', 401);

module.exports = (err, req, res, next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status,
      message: error.message,
      stack: error.stack,
      error,
    });
  }

  // Production: don't leak stack traces
  res.status(statusCode).json({
    status,
    message: error.isOperational ? error.message : 'Something went wrong',
  });
};
