import Joi from "joi";

export const commentValidationSchema = Joi.object({
  post: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid post ID",
      "any.required": "Post ID is required",
    }),
  user: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID",
      "any.required": "User ID is required",
    }),
  content: Joi.string().trim().min(1).max(1000).required().messages({
    "string.empty": "Comment cannot be empty",
    "string.min": "Comment must be at least 1 character long",
    "string.max": "Comment cannot exceed 1000 characters",
    "any.required": "Comment is required",
  }),
  parentComment: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      "string.pattern.base": "Invalid parent comment ID",
    }),
});
