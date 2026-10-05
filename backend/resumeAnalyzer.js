import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function analyzeResume(pdfBuffer) {
  const parser = new PDFParse({
    data: pdfBuffer,
  });

  const result = await parser.getText();

  await parser.destroy();

  const resumeText = result.text;

  if (!resumeText || !resumeText.trim()) {
    throw new Error("Could not extract text from the PDF.");
  }

  const response = await client.chat.completions.create({
    model: "openrouter/free",

    messages: [
      {
        role: "system",
        content: `
You are InterviewPilot AI, a professional resume analysis system.

Analyze the resume carefully.

IMPORTANT:
- Do not invent skills, projects, education, or experience.
- Base the analysis only on information present in the resume.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not put the JSON inside code fences.
        `,
      },
      {
        role: "user",
        content: `
Analyze this resume:

${resumeText}

Return EXACTLY this JSON structure:

{
  "candidateLevel": "Entry Level",
  "summary": "Short professional summary",
  "roles": [
    {
      "role": "Software Developer",
      "reason": "Why this role matches the resume",
      "matchPercentage": 0,
      "missingSkills": ["Skill 1", "Skill 2"]
    }
  ],
  "topSkills": [
    "JavaScript",
    "React"
  ],
  "interviewPlan": {
    "difficulty": "Medium",
    "focusAreas": [
      "JavaScript",
      "React"
    ],
    "questions": [
      {
        "category": "Technical",
        "difficulty": "Easy",
        "question": "Example interview question",
        "skill": "JavaScript"
      }
    ]
  }
}

Rules:
- candidateLevel should be one of: "Beginner", "Entry Level", "Intermediate", "Advanced".
- matchPercentage must be an AI-estimated resume-to-role match from 0 to 100.
- Calculate it independently for each role based only on the resume.
- Do not use a fixed or default percentage.
- Give 3 to 5 suitable roles.
- Give 5 to 10 top skills.
- Give 3 to 6 interview focus areas.
- Give 5 interview questions.
- missingSkills must be an array.
- If information is unavailable, use an empty array instead of inventing information.
        `,
      },
    ],
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("AI returned invalid JSON:", content);
    throw new Error("AI returned an invalid analysis format.");
  }
}