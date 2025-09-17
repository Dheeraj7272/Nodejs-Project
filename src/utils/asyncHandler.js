const asyncHandler = (requestHandler) => async (req, res, next) => {
  return (req, res, next) => {Promise.resolve(requestHandler(req, res, next)).catch(error => next(error))};
};

export default asyncHandler;