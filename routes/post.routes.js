import express from "express";
import {
  create,
  list,
  show,
  update,
  remove,
} from "../controllers/post.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API for managing posts
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Post Title"
 *               description:
 *                 type: string
 *                 example: "Post description"
 *               content:
 *                 type: string
 *                 example: "Full post content goes here..."
 *               category:
 *                 type: string
 *                 example: "63f5b2a55c1b2b001e3d9c10"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tech", "javascript"]
 *               thumbnail:
 *                 type: string
 *                 example: "https://example.com/thumbnail.jpg"
 *               author:
 *                 type: string
 *                 example: "67e385916e677d16cb9693cf"
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Error creating post
 * @route POST /api/posts
 * @desc Create a new post
 * @access private (Admin only)
 */
router.post("/posts", protect, create);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get a list of all posts (with pagination, search, filters, and sorting)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "JavaScript"
 *         description: Search posts by title
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: "63f5b2a55c1b2b001e3d9c10"
 *         description: Filter posts by category ID
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           example: "tech,cloud"
 *         description: Filter posts by tags (comma-separated values)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date, -date, title, -title, views, -views]
 *           example: "date"
 *         description: Sort posts by date, title, or views (prefix with "-" for descending order)
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       500:
 *         description: Error fetching posts
 * @route GET /api/posts
 * @desc Get a list of all posts
 * @access public
 */
router.get("/posts", list);

/**
 * @swagger
 * /api/posts/{slug}:
 *   get:
 *     summary: Get a specific post by slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 *       500:
 *         description: Error fetching post
 * @route GET /api/posts/:slug
 * @desc Get a specific post by slug
 * @access public
 */
router.get("/posts/:slug", show);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a specific post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Error updating post
 * @route PUT /api/posts/:id
 * @desc Update a specific post by ID
 * @access private (Admin only)
 */
router.put("/posts/:id", protect, update);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a specific post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Error deleting post
 * @route DELETE /api/posts/:id
 * @desc Delete a specific post by ID
 * @access private (Admin only)
 */
router.delete("/posts/:id", protect, remove);

export default router;
