class ApiResponse {
  constructor(statusCode = 200, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
  }
}

export { ApiResponse };