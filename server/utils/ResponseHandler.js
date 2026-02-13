const ResponseHandler = {
  success: (res, statusCode = 200, message = 'Operation successful', data = null) => {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data
    });
  },

  error: (res, statusCode = 500, message = 'An error occurred', error = null) => {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export default ResponseHandler;
