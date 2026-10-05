import { analyzeResume } from "./resumeAnalyzer.js";
import Resume from "./models/resume.js";

export async function analyzeResumeController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF resumes are supported.",
      });
    }

    // Analyze the resume using AI
    const analysis = await analyzeResume(
      req.file.buffer
    );

    // Save analysis for the logged-in Firebase user
    const resume = await Resume.create({
      firebaseUid: req.user.uid,
      analysis: analysis,
    });

    return res.status(200).json({
      success: true,
      data: analysis,
      resumeId: resume._id,
    });

  } catch (error) {
    console.error("Resume analysis error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to analyze the resume. Please try again.",
    });
  }
}