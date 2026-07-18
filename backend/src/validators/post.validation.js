import { body, param } from "express-validator";

// CREATE POST
const createPostValidator = () => {
  return [
    body("caption")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Caption cannot exceed 500 characters"),

    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location cannot exceed 100 characters"),

    body("tags")
      .optional()
      .isArray({ max: 20 })
      .withMessage("Tags must be an array with at most 20 items"),

    body("tags.*")
      .optional()
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage("Each tag must be between 1 and 30 characters"),
  ];
};

// UPDATE POST
const updatePostValidator = () => {
  return [
    body("caption")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Caption cannot exceed 500 characters"),

    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location cannot exceed 100 characters"),
  ];
};

// ADD COMMENT
const addCommentValidator = () => {
  return [
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Comment text is required")
      .isLength({ max: 300 })
      .withMessage("Comment cannot exceed 300 characters"),
  ];
};

// PARAM VALIDATORS
const postIdValidator = () => {
  return [
    param("postId")
      .trim()
      .isMongoId()
      .withMessage("Invalid post id"),
  ];
};

const commentIdValidator = () => {
  return [
    param("commentId")
      .trim()
      .isMongoId()
      .withMessage("Invalid comment id"),
  ];
};

export {
  createPostValidator,
  updatePostValidator,
  addCommentValidator,
  postIdValidator,
  commentIdValidator,
};