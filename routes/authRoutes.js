import express from "express";
// schemas
import userSchema from "../validations/user.schema.js";
import resetPasswordSchema from "../validations/resetpassword.schema.js";
import loginSchema from "../validations/login.schema.js";
// middleware
import { validationMiddleware } from "../middlewares/validation.js";
import auth from "../middlewares/auth.js";
import { imageUpload } from "../middlewares/imageUpload.js";
// controllers
import {
  register,
  verifyEmail,
  login,
  forgetPassword,
  resetPassword,
  refreshToken,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  getMe,
  logout,
} from "../controllers/authController.js";

const authrouter = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
authrouter.post("/register", validationMiddleware(userSchema), register);

/**
 * @swagger
 * /api/auth/verify/{verifytoken}:
 *   post:
 *     summary: Verify user email address using verification token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: verifytoken
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
authrouter.post("/verify/:verifytoken", verifyEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
authrouter.post("/login", validationMiddleware(loginSchema), login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link sent if user exists
 */
authrouter.post("/forgot-password", forgetPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired reset token
 */
authrouter.post(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  resetPassword,
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change current user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
authrouter.post("/change-password", auth, changePassword);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
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
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid refresh token
 */
authrouter.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get currently logged in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data of authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
authrouter.get("/me", auth, getMe);

/**
 * @swagger
 * /api/auth/image-profile:
 *   post:
 *     summary: Upload user profile image
 *     tags: [Auth]
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
 *         description: Profile image uploaded successfully
 *       400:
 *         description: File upload error
 *   delete:
 *     summary: Delete user profile image
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile image deleted successfully
 */
authrouter.post(
  "/image-profile",
  auth,
  imageUpload.single("image"),
  uploadProfileImage,
);

authrouter.delete("/image-profile", auth, deleteProfileImage);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
authrouter.post("/logout", logout);

export default authrouter;
