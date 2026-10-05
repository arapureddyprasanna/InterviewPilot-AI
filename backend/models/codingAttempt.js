import mongoose from "mongoose";

const codingAttemptSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodingProblem",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },

    problemTitle: {
      type: String,
      required: true,
    },

    submittedCode: {
      type: String,
      required: true,
    },

    passedTests: {
      type: Number,
      required: true,
      default: 0,
    },

    totalTests: {
      type: Number,
      required: true,
      default: 0,
    },

    score: {
      type: Number,
      required: true,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

const CodingAttempt =
  mongoose.models.CodingAttempt ||
  mongoose.model(
    "CodingAttempt",
    codingAttemptSchema
  );

export default CodingAttempt;