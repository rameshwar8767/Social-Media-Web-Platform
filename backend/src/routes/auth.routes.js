import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  userRegistrationValidator,
  userLoginValidator,
} from "../validators/auth.validation.js";

const router = Router();

/* AUTH */
router.post("/register", userRegistrationValidator(), validate, registerUser);
router.post("/login", userLoginValidator(), validate, loginUser);
router.post("/logout", verifyJWT, logoutUser);

/* EMAIL */
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

/* PASSWORD */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", verifyJWT, changePassword);

/* PROFILE */
router.get("/me", verifyJWT, getUserProfile);
router.patch("/me", verifyJWT, updateUserProfile);

/* TOKEN */
router.post("/refresh-token", refreshAccessToken);

export default router;
