import { body } from "express-validator";


//    REGISTER VALIDATION

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email"),

    body("username")
      .trim()
      .notEmpty().withMessage("Username is required")
      .isLength({ min: 3, max: 16 })
      .withMessage("Username must be between 3 and 16 characters")
      .matches(/^[a-zA-Z0-9_.]+$/)
      .withMessage("Username can contain letters, numbers, _ and . only"),

    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    body("full_name")
      .trim()
      .notEmpty().withMessage("Full name is required")
      .isLength({ min: 2 })
      .withMessage("Full name must be at least 2 characters"),
  ];
};

//    LOGIN VALIDATION

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email"),

    body("password")
      .notEmpty().withMessage("Password is required"),
  ];
};


//    FORGOT PASSWORD VALIDATION

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email"),
  ];
};


//    RESET PASSWORD VALIDATION

const userResetPasswordValidator = () => {
  return [
    body("token")
      .notEmpty().withMessage("Reset token is required"),

    body("newPassword")
      .notEmpty().withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};

export {
  userRegistrationValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetPasswordValidator,
};
