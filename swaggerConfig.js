import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Course Management System API",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for the Course Management System backend application. Built with Express, MongoDB, and Node.js.",
      contact: {
        name: "API Support",
        email: "support@coursemanagement.com",
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production"
          ? "https://course-management-backend-rho.vercel.app"
          : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production Server"
            : "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter JWT Bearer token in the format: Bearer <token>",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "fail" },
            message: { type: "string", example: "An error occurred" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d0fe4f5311236168a109ca" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: {
              type: "array",
              items: { type: "string" },
              example: ["student"],
            },
            organizationId: {
              type: "string",
              nullable: true,
              example: "60d0fe4f5311236168a109cb",
            },
            isactive: { type: "boolean", example: true },
            gender: { type: "string", enum: ["male", "female"], example: "male" },
            phone: { type: "string", example: "+1234567890" },
            profileImage: { type: "string", example: "uploads/profile.png" },
            isEmailVerified: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Organization: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d0fe4f5311236168a109cb" },
            name: { type: "string", example: "Tech Academy" },
            email: { type: "string", example: "contact@techacademy.com" },
            ownerId: { type: "string", example: "60d0fe4f5311236168a109ca" },
            logo: { type: "string", example: "uploads/logo.png" },
            phone: { type: "string", example: "+1234567890" },
            address: { type: "string", example: "123 Tech Street" },
            website: { type: "string", example: "https://techacademy.com" },
            isActive: { type: "boolean", example: true },
            joinCode: { type: "string", example: "TECH123" },
            settings: {
              type: "object",
              properties: {
                currency: { type: "string", example: "EGP" },
                timezone: { type: "string", example: "Africa/Cairo" },
                language: { type: "string", example: "en" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "Auth", description: "User Authentication & Account Management" },
      { name: "Users", description: "User Management Operations" },
      { name: "Organization", description: "Organization & Workspace Management" },
      { name: "Teachers", description: "Teacher Operations" },
      { name: "Students", description: "Student Operations" },
      { name: "Categories", description: "Course Categories" },
      { name: "Courses", description: "Course Management" },
      { name: "Lessons", description: "Lesson Management" },
      { name: "Assignments", description: "Assignment Management" },
      { name: "Submission Assignments", description: "Student Assignment Submissions" },
      { name: "Quizzes", description: "Quiz Management" },
      { name: "Quiz Submissions", description: "Student Quiz Submissions" },
      { name: "Enrollments", description: "Course Enrollments" },
      { name: "Notifications", description: "User Notifications" },
      { name: "Payments", description: "Payment Transactions" },
      { name: "Server", description: "Server Health Checks" },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

export { swaggerSpec, swaggerUi };
export default setupSwagger;