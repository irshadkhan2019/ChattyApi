const HTTP_STATUS = require("http-status-code");

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
  statusCode = HTTP_STATUS.BAD_REQUEST;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class JoiRequestValidationError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class NotFoundError extends CustomError {
  statusCode = HTTP_STATUS.NOT_FOUND;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class NotAuthorizedError extends CustomError {
  statusCode = HTTP_STATUS.UNAUTHORIZED;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class FileTooLargeError extends CustomError {
  statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
  status = "error";

  constructor(message) {
    super(message);
  }
}

class ServerError extends CustomError {
  statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
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
