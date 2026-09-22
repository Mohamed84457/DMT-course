import express from "express";

const healthServerRouter = express.Router();

/**
 * @swagger
 * /server/health:
 *   get:
 *     summary: Check server health status
 *     tags: [Server]
 *     responses:
 *       200:
 *         description: Server is healthy and operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 server:
 *                   type: string
 *                   example: course-management-server
 *                 port:
 *                   type: number
 *                   example: 3000
 *       500:
 *         description: Internal server error
 */
healthServerRouter.get("/health", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      server: process.env.SERVER_NAME || "unknown",
      port: process.env.PORT || 3000,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
});

export default healthServerRouter;
