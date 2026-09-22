import express from "express";
// controllers
import {
  createOrganization,
  updateOrganization,
  getAllOrganization,
  getAllActiveOrganization,
  specifiedOrganization,
  ownerSpecifiedOrganization,
  deleteOrganization,
  AllStudentsOfOrganization,
  joinOrganization,
  uploadOrganizationImage,
  deleteOrganizationImage,
} from "../controllers/organizationController.js";
// middlewares
import { validationMiddleware } from "../middlewares/validation.js";
import protectedRoute from "../middlewares/protected.js";
import auth from "../middlewares/auth.js";
import { imageUpload } from "../middlewares/imageUpload.js";
// schema
import { organizationSchema } from "../validations/organization.schema.js";
const organizationRouter = express.Router();

/**
 * @swagger
 * /api/organization:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get all active organizations (Public)
 *     tags: [Organization]
 *     responses:
 *       200:
 *         description: List of active organizations
 */
organizationRouter.post(
  "/",
  auth,
  protectedRoute,
  validationMiddleware(organizationSchema),
  createOrganization,
);

organizationRouter.get("/", getAllActiveOrganization);

/**
 * @swagger
 * /api/organization/all:
 *   get:
 *     summary: Get all organizations (Admin/Protected)
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all organizations
 */
organizationRouter.get("/all", auth, protectedRoute, getAllOrganization);

/**
 * @swagger
 * /api/organization/join:
 *   post:
 *     summary: Join an organization using join code
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - joinCode
 *             properties:
 *               joinCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully joined organization
 *       400:
 *         description: Invalid join code
 */
organizationRouter.post("/join", auth, joinOrganization);

/**
 * @swagger
 * /api/organization/owner/{organizationId}:
 *   get:
 *     summary: Get organization details for owner
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization details
 */
organizationRouter.get(
  "/owner/:organizationId",
  auth,
  protectedRoute,
  ownerSpecifiedOrganization,
);

/**
 * @swagger
 * /api/organization/{organizationId}/students:
 *   get:
 *     summary: Get all students of an organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students in organization
 */
organizationRouter.get(
  "/:organizationId/students",
  auth,
  protectedRoute,
  AllStudentsOfOrganization,
);

/**
 * @swagger
 * /api/organization/logo/{organizationId}:
 *   post:
 *     summary: Upload organization logo image
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Logo uploaded successfully
 *   delete:
 *     summary: Delete organization logo image
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logo deleted successfully
 */
organizationRouter.post(
  "/logo/:organizationId",
  auth,
  protectedRoute,
  imageUpload.single("image"),
  uploadOrganizationImage,
);

organizationRouter.delete(
  "/logo/:organizationId",
  auth,
  protectedRoute,
  deleteOrganizationImage,
);

/**
 * @swagger
 * /api/organization/{organizationId}:
 *   get:
 *     summary: Get active organization details by ID (Public)
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization details
 *   patch:
 *     summary: Update organization details
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *   delete:
 *     summary: Delete organization
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 */
organizationRouter.patch(
  "/:organizationId",
  auth,
  protectedRoute,
  updateOrganization,
);

organizationRouter.delete(
  "/:organizationId",
  auth,
  protectedRoute,
  deleteOrganization,
);

organizationRouter.get("/:organizationId", specifiedOrganization);

export default organizationRouter;
