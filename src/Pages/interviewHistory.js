import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getMyInterviews } from "../Services/InterviewService";
import {
  FaArrowLeft,
  FaChartLine,
  FaClock,
  FaTrophy,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./interviewHistory.css";

function InterviewHistory() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      try {
        const data = await getMyInterviews();

        console.log("Interview history:", data);

        setInterviews(data.data || []);
      } catch (error) {
        console.error("Failed to load interviews:", error);

        setError(
          error.message || "Failed to load interview history."
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <p>Loading your interview history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="history-error">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">

      {/* Header */}
      <header className="history-header">

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Dashboard
        </button>

        <div className="history-heading">

          <span className="heading-icon">
            <FaChartLine />
          </span>

          <div>
            <h1>Interview History</h1>

            <p>
              Review your previous interviews and track your progress.
            </p>
          </div>

        </div>

      </header>


      {/* Stats */}
      {interviews.length > 0 && (
        <section className="history-stats">

          <div className="stat-card">

            <div className="stat-icon">
              <FaChartLine />
            </div>

            <div>
              <span>Total Interviews</span>
              <strong>{interviews.length}</strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FaTrophy />
            </div>

            <div>
              <span>Best Score</span>

              <strong>
                {Math.max(
                  ...interviews.map(
                    (interview) =>
                      interview.overallScore || 0
                  )
                )}
                /100
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FaClock />
            </div>

            <div>
              <span>Latest Score</span>

              <strong>
                {interviews[0].overallScore || 0}/100
              </strong>
            </div>

          </div>

        </section>
      )}


      {/* Empty State */}
      {interviews.length === 0 ? (

        <section className="empty-history">

          <div className="empty-icon">
            <FaChartLine />
          </div>

          <h2>Your interview journey starts here</h2>

          <p>
            Complete your first AI interview and your results
            will appear here.
          </p>

          <button
            onClick={() => navigate("/InterviewSetup")}
          >
            Start an Interview
          </button>

        </section>

      ) : (

        /* Interview Cards */
        <section className="interview-list">

          <div className="section-title">

            <h2>Previous Interviews</h2>

            <span>
              {interviews.length} sessions
            </span>

          </div>


          {interviews.map((interview) => {

            const score =
              interview.overallScore || 0;

            let scoreClass = "score-low";

            if (score >= 80) {
              scoreClass = "score-excellent";
            } else if (score >= 60) {
              scoreClass = "score-good";
            }


            return (
              <article
                className="interview-card"
                key={interview._id}
              >

                {/* Main Interview Information */}
                <div className="interview-main">

                  <div className="interview-title">

                    <div className="role-avatar">
                      {interview.role
                        ? interview.role
                            .charAt(0)
                            .toUpperCase()
                        : "I"}
                    </div>

                    <div>

                      <h3>
                        {interview.role}
                      </h3>

                      <p>
                        {interview.type} interview
                      </p>

                    </div>

                  </div>


                  <div className="interview-meta">

                    <span>
                      Difficulty:{" "}
                      <strong>
                        {interview.difficulty}
                      </strong>
                    </span>

                    <span>
                      {new Date(
                        interview.createdAt
                      ).toLocaleDateString()}
                    </span>

                  </div>

                </div>


                {/* Score */}
                <div className="score-section">

                  <div
                    className={`score-circle ${scoreClass}`}
                  >
                    <strong>{score}</strong>
                    <span>/100</span>
                  </div>

                  <div className="score-label">

                    {score >= 80
                      ? "Excellent"
                      : score >= 60
                      ? "Good"
                      : "Keep Practicing"}

                  </div>

                </div>


                {/* View Report */}
                <div className="report-button-section">

                  <button
                    className="view-report-button"
                    onClick={() =>
                      navigate(
                        `/interview-report/${interview._id}`
                      )
                    }
                  >
                    View Report
                    <FaArrowRight />
                  </button>

                </div>

              </article>
            );
          })}

        </section>
      )}

    </div>
  );
}

export default InterviewHistory;