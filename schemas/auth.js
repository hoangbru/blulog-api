import Joi from "joi";

export const registerValidationSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).trim().optional().messages({
    "string.base": "Fullname must be a string",
    "string.empty": "Fullname cannot be empty",
    "string.min": "Fullname must be at least 3 characters long",
    "string.max": "Fullname cannot exceed 100 characters",
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  address: Joi.string().trim().optional().messages({
    "string.base": "Address must be a string",
  }),
  avatar: Joi.string()
    .uri()
    .optional()
    .default(
      "https://static1.s123-cdn-static-a.com/uploads/3107639/800_5e9de73574b25.png"
    )
    .messages({
      "string.uri": "Avatar must be a valid URI",
    }),
  role: Joi.string().valid("user", "admin").default("user").messages({
    "any.only": "Role must be either 'user' or 'admin'",
  }),
  status: Joi.string().valid("active", "inactive").default("active").messages({
    "any.only": "Status must be either 'active' or 'inactive'",
  }),
});

export const loginValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
});
