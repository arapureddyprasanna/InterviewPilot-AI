import { auth } from "../firebase";


export async function getInterviewQuestion({
  role,
  difficulty,
  type,
}) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please login first.");
    }

    const token = await user.getIdToken();

    const response = await fetch(
      "http://localhost:5000/api/interview/question",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          role,
          difficulty,
          type,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to generate interview question."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "Interview question request failed:",
      error
    );

    throw error;
  }
}


export async function evaluateInterviewAnswer({
  role,
  difficulty,
  type,
  question,
  answer,
}) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please login first.");
    }

    const token = await user.getIdToken();

    const response = await fetch(
      "http://localhost:5000/api/interview/evaluate",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          role,
          difficulty,
          type,
          question,
          answer,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Failed to evaluate interview answer."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "Interview answer evaluation failed:",
      error
    );

    throw error;
  }
}

export async function getMyInterviews() {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please login first.");
    }

    const token = await user.getIdToken();

    const response = await fetch(
      "http://localhost:5000/api/interview/my-interviews",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch interviews."
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch interviews failed:", error);
    throw error;
  }
}

export async function getInterviewById(interviewId) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please login first.");
    }

    const token = await user.getIdToken();

    const response = await fetch(
      `http://localhost:5000/api/interview/${interviewId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch interview report."
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch interview report failed:", error);
    throw error;
  }
}