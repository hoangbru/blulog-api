import express from "express";
import {
  register,
  login,
  getProfile,
  refreshToken,
  logout,
  list,
  updateStatus,
  update,
  remove,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { protect, authenticate } from "../middleware/protect.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API for authentication and user management
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Passw0rd!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Passw0rd!
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the profile of the logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 64b7c86b5f1b2c3f4a1b2c4d
 *                 fullName:
 *                   type: string
 *                   example: johndoe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 role:
 *                   type: string
 *                   example: user
 *       401:
 *         description: Unauthorized - token is missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/profile", authenticate, getProfile);

/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     summary: Refresh the access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Internal server error
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of users
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list retrieved successfully
 *       500:
 *         description: Error fetching users
 */
router.get("/users", protect, list);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user status
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "inactive"
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user status
 */
router.patch("/users/:id/status", authenticate, updateStatus);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "+84123456789"
 *               address:
 *                 type: string
 *                 example: "123 Main St, Hanoi, Vietnam"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user
 */
router.put("/users/:id", authenticate, update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
router.delete("/users/:id", protect, remove);

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Send a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123resetToken
 *               newPassword:
 *                 type: string
 *                 example: Passw0rd!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or validation error
 *       500:
 *         description: Internal server error
 */
router.post("/reset-password", resetPassword);

export default router;
