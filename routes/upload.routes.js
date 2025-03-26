import express from "express";
import {
  uploadImages,
  uploadImage,
  deleteImage,
} from "../controllers/upload.controller.js";
import upload from "../utils/upload.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

/**
 * @route POST /api/upload/images
 * @desc Upload list of images
 * @access private (Admin only)
 */
router.post("/upload/images", protect, upload.array("images"), uploadImages);

/**
 * @route POST /api/upload/images
 * @desc Upload an image
 * @access private (Admin only)
 */
router.post("/upload/image", protect, upload.single("image"), uploadImage);

/**
 * @route DELETE /api/upload/images/:filename
 * @desc Delete an image
 * @access private (Admin only)
 */
router.delete("/upload/images/:filename", protect, deleteImage);

export default router;
