import "dotenv/config";
import { generateInterviewQuestion } from "./interviewAI.js";

try {
    const result = await generateInterviewQuestion({
        role: "Frontend Developer",
        difficulty: "Medium",
        type: "Technical",
    });

    console.log("QUESTION SUCCESS:");
    console.log(result);
} catch (error) {
    console.error("QUESTION FAILED:");
    console.error(error);
}