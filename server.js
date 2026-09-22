import "dotenv/config"; // must be the first import, no exceptions
import compression from "compression";
import express from "express";
import { setupSwagger } from "./swaggerConfig.js";
import { connectDB } from "./config/DB.js";
import { apiLimiter } from "./config/rate-limit.js";
// routers
import organizationRouter from "./routes/organizationRoutes.js";
import authrouter from "./routes/authRoutes.js";
import teacherRouter from "./routes/teacherRoutes.js";
import studentRouter from "./routes/studentRoutes.js";
import userRouter from "./routes/userRoutes.js";
import categoryRoute from "./routes/categoryRoutes.js";
import courseRoute from "./routes/courseRoutes.js";
import enrollmentRoute from "./routes/enrollmentRoutes.js";
import lessonRoute from "./routes/lessonRoutes.js";
import assignmentRoute from "./routes/assignmentRoutes.js";
import submissionAssignmentRoute from "./routes/submissionAssignmentRoutes.js";
import quizRouter from "./routes/quizRoutes.js";
import quizSubmissionsRouter from "./routes/quizSubmissionRoutes.js";
import healthServerRouter from "./routes/serverHealthRoutes.js";
import notificationRouter from "./routes/notifizationRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
// middleware
import cors from "./middlewares/cors.js";

const App = express();

App.set("trust proxy", 1);
App.use(cors);
App.use(express.json()); // to able to use body in request
App.use(express.urlencoded({ extended: true }));
App.use(express.static("public")); // to serve static files like images
App.use(compression());

App.use(apiLimiter);

// Ensure Database Connection Middleware for Serverless & Local
App.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Swagger Documentation
setupSwagger(App);

// Routes
App.use("/api/organization", organizationRouter);
App.use("/api/auth", authrouter);
App.use("/api/teacher", teacherRouter);
App.use("/api/student", studentRouter);
App.use("/api/users", userRouter);
App.use("/api/categories", categoryRoute);
App.use("/api/courses", courseRoute);
App.use("/api/enrollments", enrollmentRoute);
App.use("/api/lessons", lessonRoute);
App.use("/api/assignments", assignmentRoute);
App.use("/api/submission-assignment", submissionAssignmentRoute);
App.use("/api/quiz", quizRouter);
App.use("/api/quiz-submissions", quizSubmissionsRouter);
App.use("/api/notifications", notificationRouter);
App.use("/api/payments", paymentRouter);
App.use("/server", healthServerRouter);

// Global Error Handling Middleware (must be after routes)
App.use((err, req, res, next) => {
  console.error("Global Handler Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  App.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default App;
