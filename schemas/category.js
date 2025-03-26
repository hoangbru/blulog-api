import Joi from "joi";

export const categoryValidationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 50 characters.",
    "any.required": "Name is a required field.",
  }),

  description: Joi.string().min(10).max(200).required().messages({
    "string.empty": "Description is required.",
    "string.min": "Description must be at least 10 characters long.",
    "string.max": "Description must not exceed 200 characters.",
    "any.required": "Description is a required field.",
  }),
});
