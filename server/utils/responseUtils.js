
export const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    statusCode,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}
