import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      location: err.location,
      value: err.value,
    }));

    throw new ApiError(422, "Validation failed", extractedErrors);
  }

  next();
};