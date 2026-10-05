import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});


// ======================================================
// GENERATE PERSONALIZED INTERVIEW QUESTION
// ======================================================

export async function generateInterviewQuestion({
    role,
    difficulty,
    type,
    resumeAnalysis,
}) {

    const {
        candidateLevel,
        summary,
        roles,
        topSkills,
        interviewPlan,
    } = resumeAnalysis;


    const response = await client.chat.completions.create({
        model: "openai/gpt-oss-20b",

        messages: [

            // ==============================
            // SYSTEM PROMPT
            // ==============================

            {
                role: "system",

                content: `
You are InterviewPilot AI, a professional AI interviewer.

Generate ONE personalized interview question for the candidate.

Use the candidate's resume information to make the question
relevant to their actual skills, projects, education, and experience.

Rules:

- Match the selected role.
- Match the selected difficulty.
- Match the selected interview type.
- Use the candidate's resume information when relevant.
- Do not invent experience or skills.
- Ask only ONE question.
- Do not provide the answer.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not add any text outside the JSON.

Return exactly:

{
  "question": "Interview question",
  "category": "Technical",
  "skill": "Relevant skill"
}
`,
            },


            // ==============================
            // USER PROMPT
            // ==============================

            {
                role: "user",

                content: `
INTERVIEW SETTINGS

Role: ${role}
Difficulty: ${difficulty}
Interview Type: ${type}


CANDIDATE RESUME INFORMATION

Candidate Level:
${candidateLevel || "Unknown"}

Summary:
${summary || "Not available"}

Top Skills:
${JSON.stringify(topSkills || [])}

Suitable Roles:
${JSON.stringify(roles || [])}

Interview Focus Areas:
${JSON.stringify(
    interviewPlan?.focusAreas || []
)}


TASK

Generate ONE interview question that is appropriate
for this candidate and the selected interview settings.

If possible, connect the question to one of the candidate's
actual skills or resume-related areas.

Do not invent anything that is not supported by the
resume information.

Return exactly:

{
  "question": "Interview question",
  "category": "Technical",
  "skill": "Relevant skill"
}
`,
            },
        ],
    });


    // ==============================
    // GET AI RESPONSE
    // ==============================

    const content =
        response?.choices?.[0]?.message?.content;


    console.log(
        "RAW PERSONALIZED QUESTION RESPONSE:",
        content
    );


    if (!content) {
        throw new Error(
            "AI returned an empty question."
        );
    }


    // ==============================
    // CLEAN AI RESPONSE
    // ==============================

    const cleanedContent = content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();


    // ==============================
    // PARSE JSON
    // ==============================

    try {

        const jsonStart =
            cleanedContent.indexOf("{");

        const jsonEnd =
            cleanedContent.lastIndexOf("}");


        if (
            jsonStart === -1 ||
            jsonEnd === -1
        ) {
            throw new Error(
                "No valid JSON object found."
            );
        }


        const jsonContent =
            cleanedContent.slice(
                jsonStart,
                jsonEnd + 1
            );


        const questionData =
            JSON.parse(jsonContent);


        // ==============================
        // VALIDATE RESPONSE
        // ==============================

        if (
            typeof questionData.question !== "string" ||
            typeof questionData.category !== "string" ||
            typeof questionData.skill !== "string"
        ) {
            throw new Error(
                "Invalid question structure."
            );
        }


        return questionData;


    } catch (error) {

        console.error(
            "Invalid AI question response:",
            content
        );

        console.error(
            "Validation error:",
            error.message
        );


        throw new Error(
            error.message ||
            "AI returned an invalid question format."
        );
    }
}



// ======================================================
// GENERATE CODING QUESTION
// ======================================================

export async function generateCodingQuestion({
    role,
    language,
    difficulty,
    topic,
}) {

    const response =
        await client.chat.completions.create({

            model: "openai/gpt-oss-20b",

            temperature: 0.6,

            messages: [

                // ==================================================
                // SYSTEM PROMPT
                // ==================================================

                {
                    role: "system",

                    content: `
You are InterviewPilot AI, a professional coding interview problem generator.

Generate ONE high-quality coding interview problem.

The problem must match:

- Role
- Programming language
- Difficulty
- Topic


IMPORTANT OUTPUT RULES:

- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT use code fences.
- Do NOT add any text outside the JSON.
- Generate exactly ONE problem.
- Do NOT provide a solution.
- Starter code must NOT contain the solution.
- Starter code must be a complete executable program.
- The program must read input from standard input.
- The program must print the answer to standard output.
- Public and hidden test cases must use exactly the same input format.
- Every test case must contain input and expectedOutput.
- Expected outputs must be correct.
- Hidden test cases must not be shown to the candidate.
- Do not reveal hidden test cases in the description, examples, or starter code.


VERY IMPORTANT EXECUTION CONTRACT:

The coding platform will execute starterCode directly.

Therefore:

INPUT:
The candidate program receives the test case input through standard input.

OUTPUT:
The candidate program must print only the final answer to standard output.

Do NOT require external packages or libraries.

Use only the standard features of the selected programming language.


LANGUAGE REQUIREMENTS:

For JavaScript:

- Use Node.js.
- Read input using fs.readFileSync(0, "utf8").
- Do not use browser APIs.
- Do not require external npm packages.

For Python:

- Use standard Python.
- Read input using sys.stdin.read().
- Do not use external packages.

For Java:

- Use a public class Main.
- Read input using standard Java input facilities.
- Do not use external libraries.
- The program must compile and run using a normal Java compiler.


TEST CASE REQUIREMENTS:

Generate:

- 2 or 3 examples
- 2 to 4 constraints
- exactly 3 public test cases
- exactly 5 hidden test cases

All test cases must follow the exact input format described by the problem.

Expected outputs must contain only the program's expected output.

Do not include explanations inside expectedOutput.


STARTER CODE REQUIREMENTS:

The starter code must be executable.

It must contain:

1. Input-reading code.
2. Necessary variable declarations.
3. TODO comments where the candidate must implement the solution.
4. Output code.

It must NOT contain the actual algorithm or solution.

The starter code should make it obvious where the candidate should write their solution.


RETURN EXACTLY THIS JSON STRUCTURE:

{
  "title": "Problem title",
  "description": "Clear problem description including input and output requirements",
  "difficulty": "Medium",
  "topic": "Arrays",
  "inputFormat": "Description of input format",
  "outputFormat": "Description of output format",
  "examples": [
    {
      "input": "input",
      "output": "output",
      "explanation": "short explanation"
    }
  ],
  "constraints": [
    "constraint 1",
    "constraint 2"
  ],
  "starterCode": "complete executable starter program",
  "publicTestCases": [
    {
      "input": "input",
      "expectedOutput": "output"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "input",
      "expectedOutput": "output"
    }
  ]
}
`,
                },


                // ==================================================
                // USER PROMPT
                // ==================================================

                {
                    role: "user",

                    content: `
CODING INTERVIEW SETTINGS

Role: ${role}

Programming Language: ${language}

Difficulty: ${difficulty}

Topic: ${topic}


TASK

Generate ONE coding interview problem.

The problem must be appropriate for the selected role,
programming language, difficulty and topic.

The candidate will write their solution inside the
provided starterCode.

The starterCode will be executed directly by a
sandboxed coding execution engine.

Therefore the program MUST use:

standard input
        ↓
candidate solution
        ↓
standard output


INPUT / OUTPUT

Clearly define:

- Input format
- Output format

The input format must be simple enough to create
reliable automated test cases.

The same input format must be used for:

- Examples
- Public test cases
- Hidden test cases


GENERATE:

- 2 or 3 examples
- 2 to 4 constraints
- exactly 3 public test cases
- exactly 5 hidden test cases


TEST CASE RULES:

Every test case must contain:

{
  "input": "raw stdin input",
  "expectedOutput": "exact stdout output"
}

Make sure every expectedOutput is correct.

Do not put explanations inside expectedOutput.


STARTER CODE

The starter code must be a COMPLETE EXECUTABLE PROGRAM.

It must:

- Read input from standard input.
- Parse the input.
- Contain TODO comments where the candidate implements the algorithm.
- Print the final answer.

Do NOT include the actual solution.

For JavaScript use Node.js.

Example structure:

const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim();

// TODO: parse input
// TODO: implement solution

console.log(result);


For Python use:

import sys

input_data = sys.stdin.read().strip()

# TODO: parse input
# TODO: implement solution

print(result)


For Java use:

import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {

        // TODO: read input
        // TODO: implement solution
        // TODO: print result

    }
}


Do NOT include the solution algorithm.

Do NOT use external libraries.

Return ONLY JSON.

Return exactly:

{
  "title": "Problem title",
  "description": "Clear problem description",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "inputFormat": "Input format",
  "outputFormat": "Output format",
  "examples": [],
  "constraints": [],
  "starterCode": "",
  "publicTestCases": [],
  "hiddenTestCases": []
}
`,
                },

            ],

        });


    // ======================================================
    // GET AI RESPONSE
    // ======================================================

    const content =
        response?.choices?.[0]?.message?.content;


    console.log(
        "RAW CODING QUESTION RESPONSE:",
        content
    );


    if (!content) {

        throw new Error(
            "AI returned an empty coding question."
        );

    }


    // ======================================================
    // CLEAN AI RESPONSE
    // ======================================================

    const cleanedContent =
        content
            .replace(/```json/gi, "")
            .replace(/```javascript/gi, "")
            .replace(/```js/gi, "")
            .replace(/```python/gi, "")
            .replace(/```java/gi, "")
            .replace(/```/g, "")
            .trim();


    // ======================================================
    // PARSE JSON
    // ======================================================

    try {

        const jsonStart =
            cleanedContent.indexOf("{");

        const jsonEnd =
            cleanedContent.lastIndexOf("}");


        if (
            jsonStart === -1 ||
            jsonEnd === -1
        ) {

            throw new Error(
                "No valid JSON object found."
            );

        }


        const jsonContent =
            cleanedContent.slice(
                jsonStart,
                jsonEnd + 1
            );


        const codingQuestion =
            JSON.parse(jsonContent);


        // ==================================================
        // VALIDATE MAIN FIELDS
        // ==================================================

        if (
            typeof codingQuestion.title !== "string" ||
            typeof codingQuestion.description !== "string" ||
            typeof codingQuestion.difficulty !== "string" ||
            typeof codingQuestion.topic !== "string" ||
            typeof codingQuestion.inputFormat !== "string" ||
            typeof codingQuestion.outputFormat !== "string" ||
            typeof codingQuestion.starterCode !== "string" ||
            !Array.isArray(codingQuestion.examples) ||
            !Array.isArray(codingQuestion.constraints) ||
            !Array.isArray(codingQuestion.publicTestCases) ||
            !Array.isArray(codingQuestion.hiddenTestCases)
        ) {

            throw new Error(
                "Invalid coding question structure."
            );

        }


        // ==================================================
        // VALIDATE EXAMPLES
        // ==================================================

        for (
            const example of codingQuestion.examples
        ) {

            if (
                typeof example.input !== "string" ||
                typeof example.output !== "string" ||
                typeof example.explanation !== "string"
            ) {

                throw new Error(
                    "Invalid coding example structure."
                );

            }

        }


        // ==================================================
        // VALIDATE TEST CASES
        // ==================================================

        const allTestCases = [

            ...codingQuestion.publicTestCases,

            ...codingQuestion.hiddenTestCases,

        ];


        for (
            const testCase of allTestCases
        ) {

            if (
                typeof testCase.input !== "string" ||
                typeof testCase.expectedOutput !== "string"
            ) {

                throw new Error(
                    "Invalid coding test case structure."
                );

            }

        }


        // ==================================================
        // TEST CASE COUNT
        // ==================================================

        if (
            codingQuestion.publicTestCases.length !== 3
        ) {

            throw new Error(
                "AI must generate exactly 3 public test cases."
            );

        }


        if (
            codingQuestion.hiddenTestCases.length !== 5
        ) {

            throw new Error(
                "AI must generate exactly 5 hidden test cases."
            );

        }


        // ==================================================
        // RETURN
        // ==================================================

        return codingQuestion;


    } catch (error) {

        console.error(
            "Invalid AI coding question response:",
            content
        );

        console.error(
            "Coding question validation error:",
            error.message
        );


        throw new Error(
            error.message ||
            "AI returned an invalid coding question format."
        );

    }

}
// ======================================================
// EVALUATE INTERVIEW ANSWER
// ======================================================

export async function evaluateInterviewAnswer({
    role,
    difficulty,
    type,
    question,
    answer,
}) {

    const response =
        await client.chat.completions.create({

            model: "openai/gpt-oss-20b",

            temperature: 0,

            messages: [

                // ==============================
                // SYSTEM PROMPT
                // ==============================

                {
                    role: "system",

                    content: `
You are InterviewPilot AI, a professional interview evaluator.

Evaluate the candidate's answer using these four categories:

- technicalAccuracy: 0-100
- relevance: 0-100
- completeness: 0-100
- communication: 0-100

Scoring guidance:

0-20 = Very poor
21-40 = Poor
41-60 = Average
61-80 = Good
81-100 = Excellent

Evaluate only what the candidate actually said.

Do not invent information.

Be objective and consistent.

Return ONLY valid JSON.

Do not use markdown.

Do not add any text outside the JSON.

Return exactly:

{
  "technicalAccuracy": 0,
  "relevance": 0,
  "completeness": 0,
  "communication": 0,
  "feedback": "Specific feedback about the answer.",
  "strengths": ["Strength 1"],
  "improvements": ["Improvement 1"]
}
`,
                },


                // ==============================
                // USER PROMPT
                // ==============================

                {
                    role: "user",

                    content: `
Role: ${role}

Difficulty: ${difficulty}

Interview Type: ${type}


Question:

${question}


Candidate Answer:

${answer}
`,
                },
            ],
        });


    // ==============================
    // GET AI RESPONSE
    // ==============================

    const content =
        response?.choices?.[0]?.message?.content;


    console.log(
        "RAW EVALUATION RESPONSE:",
        content
    );


    if (!content) {
        throw new Error(
            "AI returned an empty evaluation."
        );
    }


    // ==============================
    // CLEAN RESPONSE
    // ==============================

    const cleanedContent = content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();


    // ==============================
    // PARSE JSON
    // ==============================

    try {

        const jsonStart =
            cleanedContent.indexOf("{");

        const jsonEnd =
            cleanedContent.lastIndexOf("}");


        if (
            jsonStart === -1 ||
            jsonEnd === -1
        ) {
            throw new Error(
                "No valid JSON object found."
            );
        }


        const jsonContent =
            cleanedContent.slice(
                jsonStart,
                jsonEnd + 1
            );


        const evaluation =
            JSON.parse(jsonContent);


        // ==============================
        // VALIDATE SCORES
        // ==============================

        const requiredScores = [
            "technicalAccuracy",
            "relevance",
            "completeness",
            "communication",
        ];


        for (const field of requiredScores) {

            if (
                typeof evaluation[field] !== "number" ||
                evaluation[field] < 0 ||
                evaluation[field] > 100
            ) {

                throw new Error(
                    `Invalid evaluation field: ${field}`
                );
            }
        }


        // ==============================
        // VALIDATE FEEDBACK
        // ==============================

        if (
            typeof evaluation.feedback !== "string" ||
            !Array.isArray(evaluation.strengths) ||
            !Array.isArray(evaluation.improvements)
        ) {

            throw new Error(
                "Invalid evaluation structure."
            );
        }


        return evaluation;


    } catch (error) {

        console.error(
            "Invalid AI evaluation response:",
            content
        );

        console.error(
            "Validation error:",
            error.message
        );


        throw new Error(
            error.message ||
            "AI returned an invalid evaluation format."
        );
    }
}

// ======================================================
// EVALUATE CODING SOLUTION
// ======================================================

export async function evaluateCodingSolution({
    role,
    language,
    difficulty,
    topic,
    title,
    description,
    code,
    passed,
    total,
    results,
}) {

    const response =
        await client.chat.completions.create({

            model: "openai/gpt-oss-20b",

            temperature: 0,

            messages: [

                // ==================================================
                // SYSTEM PROMPT
                // ==================================================

                {
                    role: "system",

                    content: `
You are InterviewPilot AI, a professional coding interview evaluator.

Evaluate the candidate's submitted coding solution.

Evaluate these areas:

- Code quality
- Efficiency
- Correctness
- Overall solution quality

IMPORTANT:

- Evaluate ONLY the code and test results provided.
- Do not invent behavior that is not visible in the code.
- Consider the number of passed and failed test cases.
- Consider readability, structure, naming and unnecessary complexity.
- Consider time and space efficiency where it can reasonably be determined.
- If the solution fails test cases, mention that in the feedback.
- Do not claim that the solution is correct if test cases failed.
- Give practical and specific feedback.
- Keep feedback concise and useful for an interview candidate.

SCORING:

codeQuality:
0-20 = Very poor
21-40 = Poor
41-60 = Average
61-80 = Good
81-100 = Excellent

efficiency:
0-20 = Very poor
21-40 = Poor
41-60 = Average
61-80 = Good
81-100 = Excellent

Return ONLY valid JSON.

Do not use markdown.

Do not add any text outside the JSON.

Return exactly:

{
  "codeQuality": 0,
  "efficiency": 0,
  "feedback": "Specific overall feedback about the submitted solution.",
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "improvements": [
    "Improvement 1",
    "Improvement 2"
  ]
}
`,
                },

                // ==================================================
                // USER PROMPT
                // ==================================================

                {
                    role: "user",

                    content: `
CODING INTERVIEW DETAILS

Role:
${role}

Programming Language:
${language}

Difficulty:
${difficulty}

Topic:
${topic}

Problem Title:
${title}

Problem Description:
${description}


CANDIDATE SUBMITTED CODE

${code}


TEST RESULTS

Passed Test Cases:
${passed}

Total Test Cases:
${total}

Detailed Results:
${JSON.stringify(results, null, 2)}


TASK

Evaluate this coding solution.

Analyze:

1. Code quality
2. Efficiency
3. Correctness based on the test results
4. Overall solution quality

Provide specific strengths and practical improvements.

Return ONLY the required JSON.
`,
                },
            ],
        });


    // ======================================================
    // GET AI RESPONSE
    // ======================================================

    const content =
        response?.choices?.[0]?.message?.content;


    console.log(
        "RAW CODING EVALUATION RESPONSE:",
        content
    );


    if (!content) {

        throw new Error(
            "AI returned an empty coding evaluation."
        );

    }


    // ======================================================
    // CLEAN RESPONSE
    // ======================================================

    const cleanedContent =
        content
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();


    // ======================================================
    // PARSE JSON
    // ======================================================

    try {

        const jsonStart =
            cleanedContent.indexOf("{");

        const jsonEnd =
            cleanedContent.lastIndexOf("}");


        if (
            jsonStart === -1 ||
            jsonEnd === -1
        ) {

            throw new Error(
                "No valid JSON object found."
            );

        }


        const jsonContent =
            cleanedContent.slice(
                jsonStart,
                jsonEnd + 1
            );


        const evaluation =
            JSON.parse(jsonContent);


        // ==================================================
        // VALIDATE SCORES
        // ==================================================

        if (
            typeof evaluation.codeQuality !== "number" ||
            evaluation.codeQuality < 0 ||
            evaluation.codeQuality > 100
        ) {

            throw new Error(
                "Invalid codeQuality score."
            );

        }


        if (
            typeof evaluation.efficiency !== "number" ||
            evaluation.efficiency < 0 ||
            evaluation.efficiency > 100
        ) {

            throw new Error(
                "Invalid efficiency score."
            );

        }


        // ==================================================
        // VALIDATE FEEDBACK
        // ==================================================

        if (
            typeof evaluation.feedback !== "string" ||
            !Array.isArray(evaluation.strengths) ||
            !Array.isArray(evaluation.improvements)
        ) {

            throw new Error(
                "Invalid coding evaluation structure."
            );

        }


        return evaluation;


    } catch (error) {

        console.error(
            "Invalid AI coding evaluation response:",
            content
        );

        console.error(
            "Coding evaluation validation error:",
            error.message
        );


        throw new Error(
            error.message ||
            "AI returned an invalid coding evaluation format."
        );

    }
}