import express from "express";
import {
  create,
  list,
  remove,
  toggleLike,
} from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/protect.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing comments
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post:
 *                 type: string
 *                 example: "63f5b2a55c1b2b001e3d9c10"
 *               content:
 *                 type: string
 *                 example: "This is a comment"
 *               parentComment:
 *                 type: string
 *                 example: "63f5b2a55c1b2b001e3d9c11"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Error creating comment
 */
router.post("/comments", authenticate, create);

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: post
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID to fetch comments for
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       400:
 *         description: Post ID is required
 *       500:
 *         description: Error fetching comments
 */
router.get("/comments", list);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a specific comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Unauthorized (not the owner)
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Error deleting comment
 */
router.delete("/comments/:id", authenticate, remove);

/**
 * @swagger
 * /api/comments/{id}/like:
 *   post:
 *     summary: Toggle like on a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Like status updated successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Error toggling like
 */
router.post("/comments/:id/like", authenticate, toggleLike);

export default router;
