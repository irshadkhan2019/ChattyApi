const { StatusCodes } = require("http-status-codes");

class CustomError extends Error {
  constructor(message) {
    super(message);
  }
  serializeErrors() {
    return {
      message: this.message,
      status: this.status,
      statusCode: this.statusCode,
    };
  }
}

class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class JoiRequestValidationError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class FileTooLargeError extends CustomError {
  statusCode = StatusCodes.REQUEST_TOO_LONG;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class ServerError extends CustomError {
  statusCode = StatusCodes.SERVICE_UNAVAILABLE;
  status = "error";

  constructor(message) {
    super(message);
  }
}

module.exports = {
  CustomError,
  BadRequestError,
  JoiRequestValidationError,
  NotFoundError,
  NotAuthorizedError,
  FileTooLargeError,
  ServerError,
};
