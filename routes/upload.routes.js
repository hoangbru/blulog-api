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
 * @swagger
 * tags:
 *   name: Uploads
 *   description: API for uploading and managing images
 */

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post("/upload/images", protect, upload.array("images"), uploadImages);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload a single image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */
router.post("/upload/image", protect, upload.single("image"), uploadImage);

/**
 * @swagger
 * /api/upload/images/{filename}:
 *   delete:
 *     summary: Delete an image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: filename
 *         in: path
 *         required: true
 *         description: The name of the image file to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Image not found
 *       500:
 *         description: Internal server error
 */
router.delete("/upload/images/:filename", protect, deleteImage);

export default router;
