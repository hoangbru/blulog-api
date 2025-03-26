import express from "express";
import {
  create,
  list,
  show,
  update,
  remove,
} from "../controllers/category.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing categories
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: Category for electronic products
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 * @route POST /api/categories
 * @desc Create a new category
 * @access private (Admin only)
 */
router.post("/categories", protect, create);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get a list of all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Internal server error
 * @route GET /api/categories
 * @desc Get a list of all categories
 * @access public
 */
router.get("/categories", list);

/**
 * @swagger
 * /api/categories/{identifier}:
 *   get:
 *     summary: Get a specific category by ID or slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The category ID or slug
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 * @route GET /api/categories/:identifier
 * @desc Get a specific category by ID or slug
 * @access public
 */
router.get("/categories/:identifier", show);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a specific category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Electronics
 *               description:
 *                 type: string
 *                 example: Updated description for electronics
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 * @route PUT /api/category/:id
 * @desc Update a specific category by ID
 * @access private (Admin only)
 */
router.put("/categories/:id", protect, update);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a specific category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 * @route DELETE /api/category/:id
 * @desc Delete a specific category by ID
 * @access private (Admin only)
 */
router.delete("/categories/:id", protect, remove);

export default router;
