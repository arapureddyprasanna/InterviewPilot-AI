import { auth } from "../firebase";


// ======================================================
// GET AUTH TOKEN
// ======================================================

async function getAuthToken() {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("User is not logged in.");
    }

    return await user.getIdToken();
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

    const token =
        await getAuthToken();


    const response =
        await fetch(
            "http://localhost:5000/api/coding/question",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`,
                },

                body: JSON.stringify({
                    role,
                    language,
                    difficulty,
                    topic,
                }),
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to generate coding question."
        );

    }


    if (
        !data.success ||
        !data.question ||
        !data.problemId
    ) {

        throw new Error(
            "Invalid coding question response."
        );

    }


    return {
        ...data.question,

        problemId:
            data.problemId,
    };
}


// ======================================================
// RUN CODING CODE
// ======================================================

export async function runCodingCode({
    problemId,
    code,
}) {

    const token =
        await getAuthToken();


    const response =
        await fetch(
            "http://localhost:5000/api/coding/run",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`,
                },

                body: JSON.stringify({
                    problemId,
                    code,
                }),
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Code execution failed."
        );

    }


    return data;
}


// ======================================================
// SUBMIT CODING SOLUTION
// ======================================================

export async function submitCodingSolution({
    problemId,
    code,
}) {

    const token =
        await getAuthToken();


    const response =
        await fetch(
            "http://localhost:5000/api/coding/submit",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`,
                },

                body: JSON.stringify({
                    problemId,
                    code,
                }),
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Code submission failed."
        );

    }


    return data;
}

export async function getCodingHistory() {
  const token = await getAuthToken();

  const response = await fetch(
    "http://localhost:5000/api/coding/history",
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
      data.message || "Failed to fetch coding history."
    );
  }

  return data;
}

export async function getCodingProgress() {
  const token = await getAuthToken();

  const response = await fetch(
    "http://localhost:5000/api/coding/progress",
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
      data.message || "Failed to fetch coding progress."
    );
  }

  return data;
}