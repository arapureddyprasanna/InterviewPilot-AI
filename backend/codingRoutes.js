import express from "express";

import {
  generateCodingQuestionController,
  runCodingController,
  submitCodingController,
  getCodingHistoryController,
  getCodingProgressController,
} from "./codingController.js";

import { verifyToken } from "./authMiddleware.js";


const router = express.Router();


// ======================================================
// GENERATE CODING QUESTION
// ======================================================

router.post(
  "/question",
  verifyToken,
  generateCodingQuestionController
);

router.post(
  "/run",
  verifyToken,
  runCodingController
);

router.post(
  "/submit",
  verifyToken,
  submitCodingController
);

router.get(
  "/history",
  verifyToken,
  getCodingHistoryController
);
router.get(
  "/progress",
  verifyToken,
  getCodingProgressController
);

export default router;