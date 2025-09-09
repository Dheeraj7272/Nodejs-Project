const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res
      .status(error.code || 500)
      .json({
        message: "Something went wrong",
        success: false,
        error: error.message || error,
      });
    console.error("Got error in async handler", error);
  }
};
