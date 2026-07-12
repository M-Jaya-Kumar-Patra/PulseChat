export const errorHandler = (error, req, res, next) => {
  const status = error.statusCode || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: error.message || 'Something went wrong.'
  });
};
