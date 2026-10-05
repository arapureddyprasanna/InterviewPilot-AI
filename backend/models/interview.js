import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    questions: [
      {
        questionNumber: {
          type: Number,
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        evaluation: {
          technicalAccuracy: Number,
          relevance: Number,
          completeness: Number,
          communication: Number,
          score: Number,
          feedback: String,
          strengths: [String],
          improvements: [String],
        },
      },
    ],
    overallScore: {
      type: Number,
      required: true,
    },
    averageTechnical: Number,
    averageRelevance: Number,
    averageCompleteness: Number,
    averageCommunication: Number,
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;