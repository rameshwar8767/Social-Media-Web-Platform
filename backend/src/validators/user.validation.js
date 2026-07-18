import { body, param } from "express-validator";

// USER PARAM VALIDATION
const userIdValidator = () => {
  return [
    param("userId")
      .trim()
      .isMongoId()
      .withMessage("Invalid user id"),
  ];
};

// UPDATE PROFILE VALIDATION
const updateProfileValidator = () => {
  return [
    body("full_name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Full name must be between 2 and 50 characters"),

    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 16 })
      .withMessage("Username must be between 3 and 16 characters")
      .matches(/^[a-zA-Z0-9_.]+$/)
      .withMessage("Username can contain letters, numbers, _ and . only"),

    body("bio")
      .optional()
      .trim()
      .isLength({ max: 160 })
      .withMessage("Bio cannot exceed 160 characters"),

    body("website")
      .optional({ values: "falsy" })
      .trim()
      .isURL({
        protocols: ["http", "https"],
        require_protocol: true,
      })
      .withMessage("Website must be a valid URL"),

    body("gender")
      .optional()
      .trim()
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be male, female, or other"),
  ];
};

// CHANGE PASSWORD VALIDATION
const changePasswordValidator = () => {
  return [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),

    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ];
};

export {
  userIdValidator,
  updateProfileValidator,
  changePasswordValidator,
};