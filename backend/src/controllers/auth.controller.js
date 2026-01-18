import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { sendVerificationEmail } from '../utils/mail.js';  // ✅ Fixed import
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, full_name } = req.body;

  // Input validation
  if (!email || !username || !password || !full_name) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  // Check email uniqueness
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new ApiError(409, "Email already registered");
  }

  // Check username uniqueness
  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    throw new ApiError(409, "Username already taken");
  }

  let newUser;

  try {
    // 1. Create user (Transaction-like safety)
    newUser = await User.create({
      email: normalizedEmail,
      username: normalizedUsername,
      password,
      full_name: full_name.trim()
    });

    // 2. Generate verification token
    const { hashedToken, unHashedToken, tokenExpiry } = newUser.generateTemporaryToken();
    
    newUser.emailVerificationToken = hashedToken;
    newUser.emailVerificationTokenExpiry = tokenExpiry;
    await newUser.save({ validateBeforeSave: false });

    // 3. Send verification email (Safe - rollback on failure)
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${unHashedToken}`;
    
    try {
      await sendVerificationEmail(newUser, unHashedToken);
      console.log('✅ Verification email sent to:', newUser.email);
    } catch (emailError) {
      console.error('❌ Email failed, rolling back tokens:', emailError.message);
      
      // Clean up tokens only (KEEP USER)
      newUser.emailVerificationToken = undefined;
      newUser.emailVerificationTokenExpiry = undefined;
      await newUser.save({ validateBeforeSave: false });
      
      // DON'T delete user - allow manual verification
    }

    // 4. Success response
    return res.status(201).json(
      new ApiResponse(201, {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        full_name: newUser.full_name,
        isVerified: newUser.isVerified
      }, "User registered! Check email to verify (or resend verification).")
    );

  } catch (dbError) {
    // Full rollback on DB error
    console.error('❌ Register DB error:', dbError.message);
    if (newUser?._id) {
      await User.findByIdAndDelete(newUser._id);
    }
    throw new ApiError(500, "Registration failed - please try again");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check verification
  // if (!user.isVerified) {
  //   throw new ApiError(403, "Please verify your email first");
  // }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Update refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  };

  return res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(
      new ApiResponse(200, {
        accessToken,
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          isVerified: user.isVerified
        }
      }, "Login successful")
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: "" }
    });
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  };

  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(404, "Invalid verification token");
  }

  if (user.isVerified) {
    return res.status(200).json(
      new ApiResponse(200, {}, "Email already verified")
    );
  }

  if (user.emailVerificationTokenExpiry < new Date()) {
    throw new ApiError(400, "Verification token expired");
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Email verified successfully!")
  );
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email already verified");
  }

  // Generate new token
  const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${unHashedToken}`;

  try {
    await sendVerificationEmail(user, unHashedToken);
    return res.status(200).json(
      new ApiResponse(200, {}, "Verification email resent")
    );
  } catch (error) {
    // Cleanup on email failure
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Failed to send email - try again");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // Security: Don't reveal email existence
  if (!user) {
    return res.status(200).json(
      new ApiResponse(200, {}, "Reset link sent if account exists")
    );
  }

  // Generate reset token
  const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${unHashedToken}`;

  try {
    await sendResetPasswordEmail(user, unHashedToken);
    return res.status(200).json(
      new ApiResponse(200, {}, "Reset link sent")
    );
  } catch (error) {
    // Cleanup
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Failed to send reset email");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and password required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() }
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // Reset password
  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  user.refreshToken = undefined;  // Logout all sessions
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset successful")
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || 
                       req.headers.authorization?.replace("Bearer ", "");

  if (!incomingToken) {
    throw new ApiError(401, "Refresh token required");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Refresh token invalid");
  }

  // Rotate tokens
  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  return res
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .status(200)
    .json(new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new passwords required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password too short");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isOldPasswordValid = await user.comparePassword(oldPassword);

  if (!isOldPasswordValid) {
    throw new ApiError(400, "Old password incorrect");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different");
  }

  user.password = newPassword;
  user.refreshToken = undefined;  // Logout all devices
  await user.save();

  // Clear cookies (force re-login)
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" };
  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed - please login again"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken -emailVerificationToken -forgotPasswordToken"
  );

  return res.status(200).json(
    new ApiResponse(200, user, "Profile fetched")
  );
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, full_name, bio, location } = req.body;
  const profilePicture = req.file?.path;

  if (!username && !full_name && !bio && !location && !profilePicture) {
    throw new ApiError(400, "At least one field required");
  }

  const user = await User.findById(req.user._id);

  // Username change
  if (username && username.toLowerCase() !== user.username) {
    const exists = await User.findOne({ username: username.toLowerCase().trim() });
    if (exists) throw new ApiError(409, "Username taken");
    user.username = username.toLowerCase().trim();
  }

  // Update fields
  if (full_name) user.full_name = full_name.trim();
  if (bio !== undefined) user.bio = bio || "";
  if (location !== undefined) user.location = location || "";

  // Profile picture
  if (profilePicture) {
    if (user.profile_picture?.public_id) {
      // Delete old image from Cloudinary
      await deleteMedia(user.profile_picture.public_id);
    }
    const result = await uploadImage(profilePicture);
    user.profile_picture = {
      url: result.url,
      public_id: result.public_id
    };
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {
      _id: user._id,
      username: user.username,
      full_name: user.full_name,
      bio: user.bio,
      location: user.location,
      profile_picture: user.profile_picture
    }, "Profile updated")
  );
});

export {
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
  updateUserProfile
};
