const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: error.message || 'Internal Server Error',
    },
  });
};

module.exports = errorHandler;