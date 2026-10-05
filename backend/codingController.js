import { generateCodingQuestion,evaluateCodingSolution } from "./interviewAI.js";
import CodingProblem from "./models/codingProblem.js";
import { executeTestCase } from "./codingExecutionService.js";
import CodingAttempt from "./models/codingAttempt.js";


// ======================================================
// GENERATE CODING QUESTION
// ======================================================

export async function generateCodingQuestionController(req, res) {
  try {
    const {
      role,
      language,
      difficulty,
      topic,
    } = req.body;

    if (!role || !language || !difficulty || !topic) {
      return res.status(400).json({
        success: false,
        message:
          "Role, language, difficulty and topic are required.",
      });
    }

    const codingQuestion = await generateCodingQuestion({
      role,
      language,
      difficulty,
      topic,
    });

    const firebaseUid = req.user.uid;

    // Save the complete problem in MongoDB.
    // Hidden test cases stay on the backend.
    const codingProblem = await CodingProblem.create({
      firebaseUid,
      role,
      language,
      difficulty,
      topic,

      title: codingQuestion.title,
      description: codingQuestion.description,
      inputFormat: codingQuestion.inputFormat,
      outputFormat: codingQuestion.outputFormat,

      examples: codingQuestion.examples,
      constraints: codingQuestion.constraints,

      starterCode: codingQuestion.starterCode,

      publicTestCases: codingQuestion.publicTestCases,
      hiddenTestCases: codingQuestion.hiddenTestCases,
    });

    // Send only safe/public information to frontend.
    return res.status(200).json({
      success: true,

      problemId: codingProblem._id,

      question: {
        title: codingProblem.title,
        description: codingProblem.description,
        difficulty: codingProblem.difficulty,
        topic: codingProblem.topic,

        inputFormat: codingProblem.inputFormat,
        outputFormat: codingProblem.outputFormat,

        examples: codingProblem.examples,
        constraints: codingProblem.constraints,

        starterCode: codingProblem.starterCode,

        publicTestCases:
          codingProblem.publicTestCases,
      },
    });

  } catch (error) {
    console.error(
      "Generate coding question error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate coding question.",
    });
  }
}


// ======================================================
// RUN CODE
// ======================================================

export async function runCodingController(req, res) {
  try {
    const {
      problemId,
      code,
    } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        success: false,
        message:
          "Problem ID and code are required.",
      });
    }

    // Make sure this problem belongs to the
    // currently logged-in user.
    const problem = await CodingProblem.findOne({
      _id: problemId,
      firebaseUid: req.user.uid,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Coding problem not found.",
      });
    }

    const results = [];

    // Run only PUBLIC test cases.
    for (const testCase of problem.publicTestCases) {
      const result = await executeTestCase({
        code,
        language: problem.language,
        input: testCase.input,
        expectedOutput:
          testCase.expectedOutput,
      });

      results.push({
        passed: result.passed,
        status: result.status,
        output: result.output,
        error: result.error,
      });
    }

    const passed = results.filter(
      (result) => result.passed
    ).length;

    return res.status(200).json({
      success: true,
      type: "run",

      passed,
      total: results.length,

      results,
    });

  } catch (error) {
    console.error(
      "Run coding error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Code execution failed.",
    });
  }
}


// ======================================================
// SUBMIT CODE
// ======================================================
export async function submitCodingController(req, res) {
  try {
    const { problemId, code } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        success: false,
        message: "Problem ID and code are required.",
      });
    }

    const problem = await CodingProblem.findOne({
      _id: problemId,
      firebaseUid: req.user.uid,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Coding problem not found.",
      });
    }

    // ======================================================
    // RUN HIDDEN TEST CASES
    // ======================================================

    const results = [];

    for (const testCase of problem.hiddenTestCases) {
      const result = await executeTestCase({
        code,
        language: problem.language,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
      });

      results.push({
        passed: result.passed,
        status: result.status,
        output: result.output,
        error: result.error,
      });
    }

    // ======================================================
    // CALCULATE TEST SCORE
    // ======================================================

    const passed = results.filter(
      (result) => result.passed
    ).length;

    const total = results.length;

    const score =
      total > 0
        ? Math.round((passed / total) * 100)
        : 0;

    // ======================================================
    // AI CODE EVALUATION
    // ======================================================

    let codingEvaluation = {
      codeQuality: 0,
      efficiency: 0,
      feedback:
        "AI evaluation was not available for this submission.",
      strengths: [],
      improvements: [],
    };

    try {
      codingEvaluation = await evaluateCodingSolution({
        role: problem.role,
        language: problem.language,
        difficulty: problem.difficulty,
        topic: problem.topic,
        title: problem.title,
        description: problem.description,
        code,
        passed,
        total,
        results,
      });
    } catch (aiError) {
      console.error(
        "AI coding evaluation error:",
        aiError
      );
    }

    // ======================================================
    // SAVE CODING ATTEMPT
    // ======================================================

    const codingAttempt = await CodingAttempt.create({
      firebaseUid: req.user.uid,
      problemId: problem._id,
      role: problem.role,
      language: problem.language,
      difficulty: problem.difficulty,
      topic: problem.topic,
      problemTitle: problem.title,
      submittedCode: code,
      passedTests: passed,
      totalTests: total,
      score,
    });

    console.log(
      "Coding attempt saved:",
      codingAttempt._id
    );

    // ======================================================
    // RETURN RESULT
    // ======================================================

    return res.status(200).json({
      success: true,
      type: "submit",

      passed,
      total,
      score,

      results,

      attemptId: codingAttempt._id,

      // AI evaluation
      codeQuality: codingEvaluation.codeQuality,
      efficiency: codingEvaluation.efficiency,
      feedback: codingEvaluation.feedback,
      strengths: codingEvaluation.strengths,
      improvements: codingEvaluation.improvements,
    });

  } catch (error) {
    console.error(
      "Submit coding error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Code submission failed.",
    });
  }
}

export async function getCodingHistoryController(req, res) {
  try {
    const attempts = await CodingAttempt.find({
      firebaseUid: req.user.uid,
    })
      .sort({ createdAt: -1 })
      .select(
        "problemTitle role language difficulty topic passedTests totalTests score createdAt"
      );

    return res.status(200).json({
      success: true,
      attempts,
    });

  } catch (error) {
    console.error("Coding history error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch coding history.",
    });
  }
}
export async function getCodingProgressController(req, res) {
  try {
    const attempts = await CodingAttempt.find({
      firebaseUid: req.user.uid,
    }).sort({ createdAt: 1 });

    const totalAttempts = attempts.length;

    const averageScore =
      totalAttempts > 0
        ? Math.round(
            attempts.reduce(
              (sum, attempt) => sum + attempt.score,
              0
            ) / totalAttempts
          )
        : 0;

    const bestScore =
      totalAttempts > 0
        ? Math.max(
            ...attempts.map((attempt) => attempt.score)
          )
        : 0;

    const totalPassedTests = attempts.reduce(
      (sum, attempt) => sum + attempt.passedTests,
      0
    );

    const totalTests = attempts.reduce(
      (sum, attempt) => sum + attempt.totalTests,
      0
    );

    const topics = [
      ...new Set(
        attempts.map((attempt) => attempt.topic)
      ),
    ];

    const trend = attempts.map((attempt) => ({
      score: attempt.score,
      date: attempt.createdAt,
    }));

    let trendDifference = 0;

    if (attempts.length >= 2) {
      trendDifference =
        attempts[attempts.length - 1].score -
        attempts[attempts.length - 2].score;
    }

    return res.status(200).json({
      success: true,
      progress: {
        totalAttempts,
        averageScore,
        bestScore,
        totalPassedTests,
        totalTests,
        topics,
        trend,
        trendDifference,
      },
    });

  } catch (error) {
    console.error("Coding progress error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch coding progress.",
    });
  }
}