import express from "express";
// middlewares
import auth from "../middlewares/auth.js";
import { validationMiddleware } from "../middlewares/validation.js";
import protectedRoute from "../middlewares/protected.js";
// validation
import submissionAssignmentSchema from "../validations/submissionAssignment.schema.js";
import gradeSubmissionSchema from "../validations/gradedSubmission.schema.js";
// controllers
import {
  submitAssignment,
  getSubmissionsAssignment,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  getMyAllSubmissions,
  getMyAssignmentSubmission,
} from "../controllers/submissionAssignmentController.js";

const submissionAssignmentRoute = express.Router();

// submit assignment (students)

// student's own submissions
submissionAssignmentRoute.get(
  "/my/:assignmentId",
  auth,
  getMyAssignmentSubmission,
);
submissionAssignmentRoute.get(
  "/student/my-submissions",
  auth,
  getMyAllSubmissions,
);

submissionAssignmentRoute.post(
  "/:assignmentId",
  auth,
  validationMiddleware(submissionAssignmentSchema),
  submitAssignment,
);

// get assignment's submissions with filter & pagination (staff & teachers)
submissionAssignmentRoute.get(
  "/assignment/:assignmentId",
  auth,
  protectedRoute(["owner", "admin", "manager", "teacher"]),
  getSubmissionsAssignment,
);

// get single submission (staff, teacher, or submitting student)
submissionAssignmentRoute.get(
  "/:submissionId",
  auth,
  protectedRoute(["owner", "admin", "manager", "teacher"]),
  getSubmission,
);

// update submission (grade / feedback) (staff & teachers)
submissionAssignmentRoute.patch(
  "/:submissionId",
  auth,
  protectedRoute(["owner", "admin", "manager", "teacher"]),
  validationMiddleware(gradeSubmissionSchema),
  updateSubmission,
);

// delete submission (staff & course teacher)
submissionAssignmentRoute.delete(
  "/:submissionId",
  auth,
  protectedRoute(["owner", "admin", "manager", "teacher"]),
  deleteSubmission,
);

export default submissionAssignmentRoute;
