import {
  generateInterviewQuestion,
  evaluateInterviewAnswer,
} from "./interviewAI.js";

import Interview from "./models/interview.js";

import Resume from "./models/resume.js";


export async function generateQuestionController(req, res) {
  try {
    const { role, difficulty, type } = req.body;

    if (!role || !difficulty || !type) {
      return res.status(400).json({
        success: false,
        message: "Role, difficulty, and interview type are required.",
      });
    }

    // Find the logged-in user's latest resume
    const resume = await Resume.findOne({
      firebaseUid: req.user.uid,
    }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "Please upload and analyze your resume before starting an interview.",
      });
    }

    // Generate personalized question using resume
    const question = await generateInterviewQuestion({
      role,
      difficulty,
      type,
      resumeAnalysis: resume.analysis,
    });

    return res.status(200).json({
      success: true,
      data: question,
    });

  } catch (error) {
    console.error("Interview question error:", error);

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "AI request limit reached. Please try again after the AI provider limit resets.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to generate interview question.",
    });
  }
}


export async function evaluateAnswerController(req, res) {
  try {
    const {
      role,
      difficulty,
      type,
      question,
      answer,
    } = req.body;

    if (
      !role ||
      !difficulty ||
      !type ||
      !question ||
      !answer
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Role, difficulty, type, question, and answer are required.",
      });
    }

    const evaluation = await evaluateInterviewAnswer({
      role,
      difficulty,
      type,
      question,
      answer,
    });

    const finalScore = Math.round(
      evaluation.technicalAccuracy * 0.4 +
      evaluation.relevance * 0.2 +
      evaluation.completeness * 0.2 +
      evaluation.communication * 0.2
    );

    return res.status(200).json({
      success: true,
      data: {
        ...evaluation,
        score: finalScore,
      },
      message: "Answer evaluated successfully.",
    });

  } catch (error) {
    console.error(
      "Interview answer evaluation error:",
      error
    );

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "AI request limit reached. Please try again after the AI provider limit resets.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to evaluate interview answer.",
    });
  }
}

export async function saveInterviewController(req, res) {
  try {
    const {
      role,
      difficulty,
      type,
      questions,
    } = req.body;

    if (
      !role ||
      !difficulty ||
      !type ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete interview data is required.",
      });
    }

    const scores = questions.map(
      (item) => item.evaluation?.score || 0
    );

    const overallScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) /
        scores.length
    );

    const technicalScores = questions.map(
      (item) =>
        item.evaluation?.technicalAccuracy || 0
    );

    const relevanceScores = questions.map(
      (item) =>
        item.evaluation?.relevance || 0
    );

    const completenessScores = questions.map(
      (item) =>
        item.evaluation?.completeness || 0
    );

    const communicationScores = questions.map(
      (item) =>
        item.evaluation?.communication || 0
    );

    const average = (scores) =>
      Math.round(
        scores.reduce((sum, score) => sum + score, 0) /
          scores.length
      );

    const interview = await Interview.create({
      firebaseUid: req.user.uid,

      role,
      difficulty,
      type,

      questions,

      overallScore,

      averageTechnical: average(technicalScores),
      averageRelevance: average(relevanceScores),
      averageCompleteness: average(completenessScores),
      averageCommunication: average(communicationScores),
    });

    return res.status(201).json({
      success: true,
      message: "Interview saved successfully.",
      data: interview,
    });

  } catch (error) {
    console.error("Save interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save interview.",
    });
  }
}

export async function getMyInterviewsController(req, res) {
  try {
    const interviews = await Interview.find({
      firebaseUid: req.user.uid,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: interviews,
    });

  } catch (error) {
    console.error("Fetch interviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch interviews.",
    });
  }
}

export async function getInterviewByIdController(req, res) {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      firebaseUid: req.user.uid,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: interview,
    });

  } catch (error) {
    console.error("Fetch interview by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch interview report.",
    });
  }
}