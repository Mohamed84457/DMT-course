import cors from "cors";

const corsOptions = {
  origin: true, // Automatically reflect request origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
