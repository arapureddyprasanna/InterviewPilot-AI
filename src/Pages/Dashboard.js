import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

import { analyzeResume } from "../Services/ResumeService";
import { getMyInterviews } from "../Services/InterviewService";
import { getCodingHistory } from "../Services/CodingService";

import {
  FaRobot,
  FaFileAlt,
  FaChartLine,
  FaCode,
  FaArrowRight,
  FaUpload,
  FaHistory,
  FaSignOutAlt,
  FaBolt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  /* ======================================================
     RESUME
  ====================================================== */

  const [resume, setResume] = useState(null);
  const [submittedResume, setSubmittedResume] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  /* ======================================================
     ACTIVITY
  ====================================================== */

  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  /* ======================================================
     LOAD DASHBOARD DATA
  ====================================================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/Login");
        return;
      }

      try {
        setLoadingActivity(true);

        /* -----------------------------------------------
           LOAD INTERVIEW HISTORY
        ----------------------------------------------- */

        const interviewData = await getMyInterviews();

        const interviews = (interviewData.data || []).map(
          (interview) => ({
            id: `interview-${interview._id}`,
            type: "interview",
            title: interview.role || "AI Interview",
            category: "Interview",
            date: interview.createdAt,
            score: interview.overallScore || 0,
            difficulty: interview.difficulty || "",
            subtitle:
              interview.type ||
              interview.difficulty ||
              "AI Interview",
          })
        );

        /* -----------------------------------------------
           LOAD CODING HISTORY
        ----------------------------------------------- */

        let codingHistory = [];

        try {
          const codingData = await getCodingHistory();

          codingHistory = (codingData.attempts || []).map(
            (attempt, index) => ({
              id: `coding-${attempt._id || index}`,
              type: "coding",
              title:
                attempt.problemTitle ||
                "Coding Challenge",
              category: "Coding",
              date: attempt.createdAt,
              score: attempt.score || 0,
              difficulty: attempt.difficulty || "",
              subtitle:
                attempt.language ||
                attempt.topic ||
                "Coding Practice",
            })
          );
        } catch (codingError) {
          console.error(
            "Failed to load coding activity:",
            codingError
          );
        }

        /* -----------------------------------------------
           COMBINE + SORT
        ----------------------------------------------- */

        const combinedActivity = [
          ...interviews,
          ...codingHistory,
        ].sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );

        setActivity(combinedActivity);

        console.log(
          "Overall dashboard activity:",
          combinedActivity
        );

        /* -----------------------------------------------
           LOAD SAVED RESUME
        ----------------------------------------------- */

        const token = await user.getIdToken();

        const response = await fetch(
          "http://localhost:5000/api/resume/my-resume",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 404) {
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            "Unable to fetch resume."
          );
        }

        setSubmittedResume({
          name: "Saved Resume",
        });

        sessionStorage.setItem(
          "resumeAnalysis",
          JSON.stringify(
            result.data.analysis
          )
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );
      } finally {
        setLoadingActivity(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ======================================================
     LOGOUT
  ====================================================== */

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/Login");
  };

  /* ======================================================
     START INTERVIEW
  ====================================================== */

  function startInterview() {
    navigate("/InterviewSetup");
  }

  /* ======================================================
     START CODING ROUND
  ====================================================== */

  function startCodingRound() {
    const selectedRole =
      localStorage.getItem(
        "selectedRole"
      );

    if (!selectedRole) {
      alert(
        "Please select an interview role first."
      );

      navigate("/InterviewSetup", {
        state: {
          fromCoding: true,
        },
      });

      return;
    }

    navigate("/coding-setup", {
      state: {
        role: selectedRole,
      },
    });
  }

  /* ======================================================
     RESUME UPLOAD
  ====================================================== */

  function handleResumeUpload(event) {
    const file =
      event.target.files[0];

    if (file) {
      setResume(file);
    }
  }

  /* ======================================================
     RESUME SUBMIT
  ====================================================== */

  async function handleResumeSubmit() {
    if (!resume) {
      alert(
        "Please select a resume first"
      );
      return;
    }

    try {
      setAnalyzingResume(true);

      const analysis =
        await analyzeResume(resume);

      sessionStorage.setItem(
        "resumeAnalysis",
        JSON.stringify(analysis)
      );

      sessionStorage.setItem(
        "submittedResumeName",
        resume.name
      );

      setSubmittedResume(resume);

      navigate("/resume-analysis");
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Unable to analyze resume."
      );
    } finally {
      setAnalyzingResume(false);
    }
  }

  /* ======================================================
     FORMAT ACTIVITY DATE
  ====================================================== */

  function formatActivityDate(date) {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* ======================================================
     FORMAT ACTIVITY TIME
  ====================================================== */

  function formatActivityTime(date) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="dashboard-container">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="dashboard-hero">

        <div className="hero-glow hero-glow-one"></div>

        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            AI Interview Platform
          </div>

          <h1>
            Welcome back,
            <span> InterviewPilot</span>
          </h1>

          <p>
            Sharpen your skills, practice smarter, and
            walk into your next interview with confidence.
          </p>

        </div>

        <div className="hero-visual">

          <div className="hero-orbit orbit-one"></div>

          <div className="hero-orbit orbit-two"></div>

          <div className="hero-ai-card">

            <div className="hero-ai-icon">
              <FaRobot />
            </div>

            <div>
              <span>
                INTERVIEWPILOT AI
              </span>

              <strong>
                Ready when you are.
              </strong>
            </div>

          </div>

          <div className="floating-stat stat-one">

            <FaBolt />

            <div>
              <strong>
                AI Powered
              </strong>

              <span>
                Practice
              </span>
            </div>

          </div>

          <div className="floating-stat stat-two">

            <FaCheckCircle />

            <div>
              <strong>
                Smart Feedback
              </strong>

              <span>
                Every session
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          QUICK STATS
      ================================================== */}

      <section className="dashboard-overview">

        <div className="overview-card">

          <div className="overview-icon overview-purple">
            <FaRobot />
          </div>

          <div>
            <span>
              AI Interviews
            </span>

            <strong>
              {
                activity.filter(
                  (item) =>
                    item.type ===
                    "interview"
                ).length
              }
            </strong>

            <small>
              Total sessions
            </small>
          </div>

        </div>


        <div className="overview-card">

          <div className="overview-icon overview-blue">
            <FaChartLine />
          </div>

          <div>
            <span>
              Practice Mode
            </span>

            <strong>
              AI
            </strong>

            <small>
              Personalized feedback
            </small>
          </div>

        </div>


        <div className="overview-card">

          <div className="overview-icon overview-cyan">
            <FaCode />
          </div>

          <div>
            <span>
              Coding Practice
            </span>

            <strong>
              {
                activity.filter(
                  (item) =>
                    item.type ===
                    "coding"
                ).length
              }
            </strong>

            <small>
              Completed attempts
            </small>
          </div>

        </div>

      </section>


      {/* ==================================================
          WORKSPACE
      ================================================== */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <span className="section-eyebrow">
              YOUR WORKSPACE
            </span>

            <h2>
              Everything you need to prepare
            </h2>

            <p>
              Practice interviews, improve your resume,
              sharpen coding skills and track your growth.
            </p>

          </div>

        </div>


        {/* ==================================================
            MAIN FOUR CARDS
        ================================================== */}

        <div className="tools-grid">


          {/* -----------------------------------------------
              RESUME ANALYSIS
          ----------------------------------------------- */}

          <div className="tool-card resume-card">

            <div className="tool-card-top">

              <div className="tool-icon resume-icon">
                <FaFileAlt />
              </div>

              <span className="tool-number">
                01
              </span>

            </div>

            <div className="tool-card-content">

              <h3>
                Resume Analysis
              </h3>

              <p>
                Upload your resume and let AI understand
                your skills, projects, experience and
                potential improvement areas.
              </p>

              {!submittedResume && (
                <>

                  <label
                    htmlFor="resume-upload"
                    className="resume-upload-zone"
                  >

                    <FaUpload />

                    <span>
                      {resume
                        ? "Resume selected"
                        : "Choose your PDF resume"}
                    </span>

                    <small>
                      PDF files only
                    </small>

                  </label>

                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,application/pdf"
                    onChange={
                      handleResumeUpload
                    }
                  />

                  {resume && (
                    <div className="resume-selected">

                      <FaCheckCircle />

                      <span>
                        {resume.name}
                      </span>

                    </div>
                  )}

                  <button
                    className="card-button"
                    onClick={
                      handleResumeSubmit
                    }
                    disabled={
                      analyzingResume
                    }
                  >

                    {analyzingResume
                      ? "Analyzing Resume..."
                      : "Analyze Resume"}

                    {!analyzingResume && (
                      <FaArrowRight />
                    )}

                  </button>

                </>
              )}

              {submittedResume && (
                <div className="resume-submitted">

                  <FaCheckCircle />

                  <div>

                    <span>
                      Resume analyzed
                    </span>

                    <strong>
                      {submittedResume.name}
                    </strong>

                  </div>

                </div>
              )}

            </div>

          </div>


          {/* -----------------------------------------------
              AI INTERVIEW
          ----------------------------------------------- */}

          <div className="tool-card featured-card">

            <div className="featured-glow"></div>

            <div className="tool-card-top">

              <div className="tool-icon interview-icon">
                <FaRobot />
              </div>

              <span className="tool-status">
                AI POWERED
              </span>

            </div>

            <div className="tool-card-content">

              <h3>
                AI Interview
              </h3>

              <p>
                Enter a realistic interview environment
                with dynamically generated questions and
                AI-powered answer evaluation.
              </p>

              <div className="feature-pills">

                <span>
                  <FaRobot />
                  AI Questions
                </span>

                <span>
                  <FaChartLine />
                  Smart Feedback
                </span>

              </div>

              <button
                className="card-button featured-button"
                onClick={
                  startInterview
                }
              >
                Start Interview
                <FaArrowRight />
              </button>

            </div>

          </div>


          {/* -----------------------------------------------
              PRACTICE CODING
          ----------------------------------------------- */}

          <div className="tool-card">

            <div className="tool-card-top">

              <div className="tool-icon coding-icon">
                <FaCode />
              </div>

              <span className="tool-number">
                03
              </span>

            </div>

            <div className="tool-card-content">

              <h3>
                Practice Coding
              </h3>

              <p>
                Solve coding challenges, run your solution
                against test cases and receive objective
                evaluation.
              </p>

              <div className="mini-feature">

                <FaBolt />

                <span>
                  Live code evaluation
                </span>

              </div>

              <button
                className="card-button"
                onClick={
                  startCodingRound
                }
              >
                Practice Coding
                <FaArrowRight />
              </button>

            </div>

          </div>


          {/* -----------------------------------------------
              PROGRESS
          ----------------------------------------------- */}

          <div className="tool-card">

            <div className="tool-card-top">

              <div className="tool-icon progress-icon">
                <FaChartLine />
              </div>

              <span className="tool-number">
                04
              </span>

            </div>

            <div className="tool-card-content">

              <h3>
                Progress
              </h3>

              <p>
                See your interview and coding performance,
                discover trends and understand where you
                can improve.
              </p>

              <div className="mini-feature">

                <FaChartLine />

                <span>
                  Performance analytics
                </span>

              </div>

              <button
                className="card-button"
                onClick={() =>
                  navigate("/Progress")
                }
              >
                View Progress
                <FaArrowRight />
              </button>

            </div>

          </div>

        </div>


        {/* ==================================================
            HORIZONTAL DIVIDER
        ================================================== */}

        <div className="workspace-divider"></div>


        {/* ==================================================
            HISTORY
          ================================================== */}

        <div className="dashboard-section">

          <div className="section-heading">

            <span className="section-eyebrow">
              HISTORY
            </span>

            <h2>
              Review your journey
            </h2>

            <p>
              Revisit previous interview and coding
              sessions, scores and feedback.
            </p>

          </div>


          <div className="tools-grid">


            {/* ---------------------------------------------
                INTERVIEW HISTORY
            --------------------------------------------- */}

            <div className="tool-card">
              <div className="tool-card-top">


                <div className="tool-icon interview-history-icon">
                  <FaHistory />

                </div>


                <span className="tool-number">
                  05
                </span>
              </div>

              <div className="tool-card-content">
                <h3>
                  Interview History
                </h3>

                <p>
                  Review your previous AI interviews,
                  scores, questions and feedback.
                </p>

                <button
                  className="card-button"
                  onClick={() =>
                    navigate(
                      "/interview-history"
                    )
                  }
                >
                  View Interview History
                  <FaArrowRight />
                </button>

              </div>

            </div>


            {/* ---------------------------------------------
                CODING HISTORY
            --------------------------------------------- */}

            <div className="tool-card">
              <div className="tool-card-top">

                <div className="tool-icon coding-history-icon">
                  <FaCode />
                </div>

                <span className="tool-number">
                  06
                </span>
              </div>

              <div className="tool-card-content">
                <h3>
                  Coding History
                </h3>

                <p>
                  Review your coding attempts, scores,
                  languages, topics and test results.
                </p>

                <button
                  className="card-button"
                  onClick={() =>
                    navigate(
                      "/coding-history"
                    )
                  }
                >
                  View Coding History
                  <FaArrowRight />
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          OVERALL ACTIVITY
      ================================================== */}

      <section className="recent-section">

        <div className="recent-interviews-header">

          <div>

            <span className="section-eyebrow">
              ACTIVITY
            </span>

            <h2>
              Overall Activity
            </h2>

            <p>
              Your latest interview and coding activity,
              shown together in chronological order.
            </p>

          </div>

        </div>


        {/* -----------------------------------------------
            LOADING
        ----------------------------------------------- */}

        {loadingActivity && (
          <div className="recent-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading your activity...
            </p>

          </div>
        )}


        {/* -----------------------------------------------
            EMPTY
        ----------------------------------------------- */}

        {!loadingActivity &&
          activity.length === 0 && (
            <div className="recent-empty">

              <div className="recent-empty-icon">
                <FaBolt />
              </div>

              <h3>
                Your activity will appear here
              </h3>

              <p>
                Complete an AI interview or coding round
                and your activity will be displayed here.
              </p>

              <button
                className="card-button"
                onClick={
                  startInterview
                }
              >
                Start Practicing
                <FaArrowRight />
              </button>

            </div>
          )}


        {/* -----------------------------------------------
            ACTIVITY LIST
        ----------------------------------------------- */}

        {!loadingActivity &&
          activity.length > 0 && (
            <>
              <div className="recent-interviews-list">

                {activity
                  .slice(0, 5)
                  .map((item) => {

                    const isCoding =
                      item.type ===
                      "coding";

                    const score =
                      item.score || 0;

                    return (
                      <div
                        className={`recent-interview-card activity-card ${isCoding
                          ? "coding-activity"
                          : "interview-activity"
                          }`}
                        key={item.id}
                      >

                        {/* ACTIVITY INFO */}

                        <div className="recent-interview-info">

                          <div
                            className={`recent-role-icon ${isCoding
                              ? "activity-coding-icon"
                              : "activity-interview-icon"
                              }`}
                          >
                            {isCoding ? (
                              <FaCode />
                            ) : (
                              <FaRobot />
                            )}
                          </div>


                          <div className="recent-role-details">

                            <h3>
                              {item.title}
                            </h3>

                            <div className="recent-meta">

                              <span>
                                {item.category}
                              </span>

                              {item.difficulty && (
                                <span>
                                  {item.difficulty}
                                </span>
                              )}

                              {item.subtitle && (
                                <span>
                                  {item.subtitle}
                                </span>
                              )}

                            </div>

                            <span className="recent-date">

                              <FaClock />

                              {formatActivityDate(
                                item.date
                              )}

                              {item.date && (
                                <>
                                  {" • "}
                                  {formatActivityTime(
                                    item.date
                                  )}
                                </>
                              )}

                            </span>

                          </div>

                        </div>


                        {/* SCORE */}

                        <div className="recent-score">

                          <div className="score-circle">

                            <strong>
                              {score}
                            </strong>

                            <span>
                              /100
                            </span>

                          </div>

                          <small>
                            {isCoding
                              ? "Coding Score"
                              : "Interview Score"}
                          </small>

                        </div>

                      </div>
                    );
                  })}

              </div>
              {activity.length > 5 && (
                <div className="activity-full-button">
                  <button
                    onClick={() => navigate("/activity")}
                  >
                    View Full Activity
                    <FaArrowRight />
                  </button>
                </div>
              )}
            </>
          )}

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="dashboard-footer">

        <div className="footer-message">

          <FaRobot />

          <div>

            <strong>
              Keep building your interview confidence.
            </strong>

            <span>
              Every practice session is another step
              forward.
            </span>

          </div>

        </div>

        <button
          className="logout-button"
          onClick={
            handleLogout
          }
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>

    </div>
  );
}

export default Dashboard;