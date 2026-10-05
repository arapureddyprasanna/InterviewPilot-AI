import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";
import { getInterviewById } from "../Services/InterviewService";
import "./interviewReport.css";

import {
  FaArrowLeft,
  FaTrophy,
  FaCheckCircle,
  FaExclamationCircle,
  FaChartBar,
} from "react-icons/fa";

function InterviewReport() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/Login");
        return;
      }

      try {
        const data = await getInterviewById(id);

        console.log("Interview report:", data);

        setInterview(data.data);
      } catch (error) {
        console.error("Failed to load interview report:", error);
        setError(
          error.message || "Unable to load interview report."
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="report-page">
        <div className="report-loading">
          <h2>Loading Interview Report...</h2>
          <p>Preparing your performance analysis.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-page">
        <div className="report-error">
          <h2>Unable to load report</h2>
          <p>{error}</p>

          <button onClick={() => navigate("/interview-history")}>
            Back to Interview History
          </button>
        </div>
      </div>
    );
  }

  if (!interview) {
    return null;
  }

  const score = interview.overallScore || 0;

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Keep Practicing";
  };

  return (
    <div className="report-page">

      {/* Header */}

      <header className="report-header">
        <button
          className="report-back-button"
          onClick={() => navigate("/interview-history")}
        >
          <FaArrowLeft />
          Interview History
        </button>

        <div>
          <h1>Interview Report</h1>
          <p>
            Detailed analysis of your interview performance.
          </p>
        </div>
      </header>


      {/* Interview Information */}

      <section className="report-info-card">

        <div>
          <span>Role</span>
          <strong>{interview.role}</strong>
        </div>

        <div>
          <span>Difficulty</span>
          <strong>{interview.difficulty}</strong>
        </div>

        <div>
          <span>Interview Type</span>
          <strong>{interview.type}</strong>
        </div>

        <div>
          <span>Date</span>
          <strong>
            {new Date(
              interview.createdAt
            ).toLocaleDateString()}
          </strong>
        </div>

      </section>


      {/* Overall Score */}

      <section className="overall-score-card">

        <div className="overall-score-icon">
          <FaTrophy />
        </div>

        <div>
          <span>Overall Score</span>

          <h2>
            {score}
            <small>/100</small>
          </h2>

          <p>{getScoreLabel()}</p>
        </div>

      </section>


      {/* Skill Breakdown */}

      <section className="report-section">

        <div className="report-section-heading">
          <FaChartBar />

          <div>
            <h2>Performance Breakdown</h2>
            <p>
              Your average performance across interview skills.
            </p>
          </div>
        </div>


        <div className="report-skills">

          <div className="report-skill">
            <div>
              <span>Technical Accuracy</span>
              <strong>
                {interview.averageTechnical || 0}/100
              </strong>
            </div>

            <div className="report-progress">
              <div
                style={{
                  width: `${interview.averageTechnical || 0}%`,
                }}
              ></div>
            </div>
          </div>


          <div className="report-skill">
            <div>
              <span>Relevance</span>
              <strong>
                {interview.averageRelevance || 0}/100
              </strong>
            </div>

            <div className="report-progress">
              <div
                style={{
                  width: `${interview.averageRelevance || 0}%`,
                }}
              ></div>
            </div>
          </div>


          <div className="report-skill">
            <div>
              <span>Completeness</span>
              <strong>
                {interview.averageCompleteness || 0}/100
              </strong>
            </div>

            <div className="report-progress">
              <div
                style={{
                  width: `${interview.averageCompleteness || 0}%`,
                }}
              ></div>
            </div>
          </div>


          <div className="report-skill">
            <div>
              <span>Communication</span>
              <strong>
                {interview.averageCommunication || 0}/100
              </strong>
            </div>

            <div className="report-progress">
              <div
                style={{
                  width: `${interview.averageCommunication || 0}%`,
                }}
              ></div>
            </div>
          </div>

        </div>

      </section>


      {/* Question Analysis */}

      <section className="report-section">

        <div className="report-section-heading">
          <FaChartBar />

          <div>
            <h2>Question Analysis</h2>
            <p>
              Review your answers and AI feedback.
            </p>
          </div>
        </div>


        <div className="question-analysis">

          {interview.questions.map((item, index) => {

            const questionScore =
              item.evaluation?.score || 0;

            return (
              <div
                className="question-report-card"
                key={index}
              >

                <div className="question-report-header">

                  <div>
                    <span>
                      Question {item.questionNumber || index + 1}
                    </span>

                    <h3>
                      {item.question}
                    </h3>
                  </div>

                  <div className="question-score">
                    <strong>{questionScore}</strong>
                    <small>/100</small>
                  </div>

                </div>


                <div className="your-answer">

                  <h4>Your Answer</h4>

                  <p>
                    {item.answer}
                  </p>

                </div>


                <div className="evaluation-grid">

                  <div>
                    <span>Technical</span>
                    <strong>
                      {item.evaluation?.technicalAccuracy || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Relevance</span>
                    <strong>
                      {item.evaluation?.relevance || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Completeness</span>
                    <strong>
                      {item.evaluation?.completeness || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Communication</span>
                    <strong>
                      {item.evaluation?.communication || 0}
                    </strong>
                  </div>

                </div>


                <div className="feedback-box">

                  <h4>AI Feedback</h4>

                  <p>
                    {item.evaluation?.feedback ||
                      "No feedback available."}
                  </p>

                </div>


                {item.evaluation?.strengths?.length > 0 && (
                  <div className="strengths-box">

                    <h4>
                      <FaCheckCircle />
                      Strengths
                    </h4>

                    <ul>
                      {item.evaluation.strengths.map(
                        (strength, strengthIndex) => (
                          <li key={strengthIndex}>
                            {strength}
                          </li>
                        )
                      )}
                    </ul>

                  </div>
                )}


                {item.evaluation?.improvements?.length > 0 && (
                  <div className="improvements-box">

                    <h4>
                      <FaExclamationCircle />
                      Areas to Improve
                    </h4>

                    <ul>
                      {item.evaluation.improvements.map(
                        (improvement, improvementIndex) => (
                          <li key={improvementIndex}>
                            {improvement}
                          </li>
                        )
                      )}
                    </ul>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </section>


      {/* Bottom Actions */}

      <div className="report-actions">

        <button
          onClick={() => navigate("/InterviewSetup")}
        >
          Practice Another Interview
        </button>

        <button
          className="secondary-report-button"
          onClick={() => navigate("/progress")}
        >
          View My Progress
        </button>

      </div>

    </div>
  );
}

export default InterviewReport;