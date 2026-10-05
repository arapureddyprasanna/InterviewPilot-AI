import express from "express";
import { verifyToken } from "./authMiddleware.js";
import multer from "multer";
import Resume from "./models/resume.js";
import "dotenv/config";

import {
  analyzeResumeController,
} from "./resumeController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    if (file.mimetype === "application/pdf") {
      callback(null, true);
    } else {
      callback(
        new Error("Only PDF files are allowed.")
      );
    }
  },
});

router.get(
  "/my-resume",
  verifyToken,
  async (req, res) => {
    try {
      const resume = await Resume.findOne({
        firebaseUid: req.user.uid,
      }).sort({ createdAt: -1 });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: "No resume found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: resume,
      });

    } catch (error) {
      console.error("Fetch resume error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch resume.",
      });
    }
  }
);

router.post(
  "/analyze",
  verifyToken,
  upload.single("resume"),
  analyzeResumeController
);

export default router;