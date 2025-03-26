import Joi from "joi";

export const postValidationSchema = Joi.object({
  title: Joi.string().trim().min(10).max(255).required().messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least 10 characters long",
    "string.max": "Title cannot exceed 255 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().min(20).max(500).required().messages({
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least 20 characters long",
    "string.max": "Description cannot exceed 500 characters",
    "any.required": "Description is required",
  }),
  content: Joi.string().min(50).required().messages({
    "string.empty": "Content cannot be empty",
    "string.min": "Content must be at least 50 characters long",
    "any.required": "Content is required",
  }),
  thumbnail: Joi.string().uri().allow("").messages({
    "string.uri": "Thumbnail must be a valid URL",
  }),
  category: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid category",
      "any.required": "Category is required",
    }),
  tags: Joi.array().items(Joi.string().trim().max(30)).messages({
    "array.includes": "Each tag must be a valid string",
    "string.max": "Each tag cannot exceed 30 characters",
  }),
  author: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid author",
      "any.required": "Author is required",
    }),
});
