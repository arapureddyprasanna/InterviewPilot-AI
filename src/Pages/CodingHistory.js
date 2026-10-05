import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { FaCode, FaArrowLeft } from "react-icons/fa";

import { auth } from "../firebase";
import { getCodingHistory } from "../Services/CodingService";

import "./CodingHistory.css";

function CodingHistory() {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe;

    async function loadCodingHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await getCodingHistory();

        setAttempts(data.attempts || []);
      } catch (error) {
        console.error("Coding history error:", error);

        setError(
          error.message || "Failed to load coding history."
        );
      } finally {
        setLoading(false);
      }
    }

    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Firebase user ready:", user.email);
        loadCodingHistory();
      } else {
        console.log("No Firebase user found.");

        setError("Please log in to view your coding history.");
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  function formatDate(date) {
    return new Date(date).toLocaleString();
  }

  return (
    <div className="coding-history-page">

      <div className="coding-history-header">

        <button
          className="coding-history-back"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>

        <div className="coding-history-title">
          <FaCode />
          <div>
            <h1>Coding History</h1>
            <p>
              Review your previous coding round attempts.
            </p>
          </div>
        </div>

      </div>

      {loading && (
        <div className="coding-history-message">
          <h3>Loading coding history...</h3>
          <p>
            Checking your account and loading your attempts.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="coding-history-message error">
          <h3>Unable to load coding history</h3>
          <p>{error}</p>

          <button onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      )}

      {!loading && !error && attempts.length === 0 && (
        <div className="coding-history-message">
          <FaCode />

          <h3>No coding attempts yet</h3>

          <p>
            Complete a coding round and your attempts will
            appear here.
          </p>

          <button
            onClick={() => navigate("/coding-setup")}
          >
            Start Coding Round
          </button>
        </div>
      )}

      {!loading && !error && attempts.length > 0 && (
        <div className="coding-history-list">

          {attempts.map((attempt, index) => (

            <div
              className="coding-history-card"
              key={`${attempt.createdAt}-${index}`}
            >

              <div className="coding-card-top">

                <div>
                  <span className="coding-label">
                    CODING ROUND
                  </span>

                  <h2>{attempt.problemTitle}</h2>
                </div>

                <div className="coding-score">
                  <strong>{attempt.score}</strong>
                  <span>/100</span>
                </div>

              </div>

              <div className="coding-card-info">

                <div>
                  <span>Role</span>
                  <strong>{attempt.role}</strong>
                </div>

                <div>
                  <span>Language</span>
                  <strong>{attempt.language}</strong>
                </div>

                <div>
                  <span>Difficulty</span>
                  <strong>{attempt.difficulty}</strong>
                </div>

                <div>
                  <span>Topic</span>
                  <strong>{attempt.topic}</strong>
                </div>

              </div>

              <div className="coding-card-bottom">

                <span>
                  Tests Passed:{" "}
                  <strong>
                    {attempt.passedTests}/{attempt.totalTests}
                  </strong>
                </span>

                <span>
                  {formatDate(attempt.createdAt)}
                </span>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default CodingHistory;