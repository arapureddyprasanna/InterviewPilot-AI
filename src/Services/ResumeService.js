import { auth } from "../firebase";

export async function analyzeResume(resumeFile) {
  const formData = new FormData();

  formData.append("resume", resumeFile);

  // Get currently logged-in Firebase user
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  // Get Firebase ID token
  const token = await user.getIdToken();

  const response = await fetch(
    "http://localhost:5000/api/resume/analyze",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Resume analysis failed."
    );
  }

  return result.data;
}