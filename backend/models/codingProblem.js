import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
    {
        input: {
            type: String,
            required: true,
        },

        expectedOutput: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    }
);


const exampleSchema = new mongoose.Schema(
    {
        input: {
            type: String,
            required: true,
        },

        output: {
            type: String,
            required: true,
        },

        explanation: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    }
);


const codingProblemSchema = new mongoose.Schema(
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

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        inputFormat: {
            type: String,
            required: true,
        },

        outputFormat: {
            type: String,
            required: true,
        },

        examples: {
            type: [exampleSchema],
            default: [],
        },

        constraints: {
            type: [String],
            default: [],
        },

        starterCode: {
            type: String,
            required: true,
        },

        publicTestCases: {
            type: [testCaseSchema],
            default: [],
        },

        hiddenTestCases: {
            type: [testCaseSchema],
            default: [],
        },
    },

    {
        timestamps: true,
    }
);


const CodingProblem =
    mongoose.models.CodingProblem ||
    mongoose.model(
        "CodingProblem",
        codingProblemSchema
    );


export default CodingProblem;