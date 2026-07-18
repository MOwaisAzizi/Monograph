 const globalErrorHandler = async (err, req, res, _next) => {
  console.log('err:', err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });};
  
export default globalErrorHandler;