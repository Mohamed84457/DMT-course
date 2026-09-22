import express from "express";
// middlewares
import auth from "../middlewares/auth.js";
import protectedRoute from "../middlewares/protected.js";
import { validationMiddleware } from "../middlewares/validation.js";
import { imageUpload } from "../middlewares/imageUpload.js";
// schema
import updateCourseSchema from "../validations/updateCourse.schema.js";
import courseSchema from "../validations/course.schema.js";
// controllers
import {
  newCourse,
  updateCource,
  deleteCourse,
  allCourses,
  getCourse,
} from "../controllers/courseController.js";

const courseRoute = express.Router();

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Course created successfully
 *   get:
 *     summary: Get all courses with filtering
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query string
 *     responses:
 *       200:
 *         description: List of courses
 */
courseRoute.post(
  "/",
  auth,
  protectedRoute,
  imageUpload.single("image"),
  validationMiddleware(courseSchema),
  newCourse,
);

courseRoute.get("/", auth, allCourses);

/**
 * @swagger
 * /api/courses/{courseId}:
 *   get:
 *     summary: Get course details by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *   patch:
 *     summary: Update course details
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course updated successfully
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 */
courseRoute.patch(
  "/:courseId",
  auth,
  protectedRoute,
  imageUpload.single("image"),
  validationMiddleware(updateCourseSchema),
  updateCource,
);

courseRoute.delete("/:courseId", auth, protectedRoute, deleteCourse);

courseRoute.get("/:courseId", auth, getCourse);

export default courseRoute;
