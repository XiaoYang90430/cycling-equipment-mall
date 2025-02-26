class Response {
  static success(data = null, message = "success") {
    return {
      code: 0,
      message,
      data,
    };
  }

  static error(message = "error", code = -1) {
    return {
      code,
      message,
      data: null,
    };
  }
}

module.exports = Response;
