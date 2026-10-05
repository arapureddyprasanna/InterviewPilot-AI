import express from "express";
import { verifyToken } from "./authMiddleware.js";

import {
  generateQuestionController,
  evaluateAnswerController,
  saveInterviewController,
  getMyInterviewsController,
  getInterviewByIdController,
} from "./interviewController.js";
const router = express.Router();

router.post(
  "/question",
  verifyToken,
  generateQuestionController
);

router.post(
  "/evaluate",
  verifyToken,
  evaluateAnswerController
);

router.post(
  "/save",
  verifyToken,
  saveInterviewController
);

router.get(
  "/my-interviews",
  verifyToken,
  getMyInterviewsController
);

router.get(
  "/:id",
  verifyToken,
  getInterviewByIdController
);

export default router;