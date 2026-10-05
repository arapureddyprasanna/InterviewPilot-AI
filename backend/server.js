import "dotenv/config";
import { connectDB } from "./db.js";
import express from "express";
import cors from "cors";
import resumeRoutes from "./resumeRoutes.js";
import interviewRoutes from "./interviewRoutes.js";
import { verifyToken } from "./authMiddleware.js";
import userRoutes from "./userRoutes.js";
import codingRoutes from "./codingRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/coding", codingRoutes);

app.get("/", (req, res) => {  
  res.json({
    success: true,
    message: "InterviewPilot AI backend is running",
  });
});

app.get("/api/auth/test", verifyToken, (req, res) => {
  res.json({
    message: "Authenticated successfully! 🔐",
    uid: req.user.uid,
    email: req.user.email
  });
});

const PORT = 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
