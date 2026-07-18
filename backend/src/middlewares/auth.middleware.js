import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const extractToken = (req) => {
  const cookieToken = req.cookies?.accessToken;

  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]?.trim()
      : null;

  return cookieToken || bearerToken || null;
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, "Access token is missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry"
  );

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email to continue");
  }

  req.user = user;
  next();
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You are not allowed to access this resource");
    }

    next();
  };
};

export const verifyAdmin = authorizeRoles("admin");