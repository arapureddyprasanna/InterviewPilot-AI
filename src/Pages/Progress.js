import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getMyInterviews } from "../Services/InterviewService";
import { useNavigate } from "react-router-dom";
import { getCodingProgress } from "../Services/CodingService";

import {
  FaArrowLeft,
  FaChartLine,
  FaTrophy,
  FaBullseye,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";

import "./Progress.css";

function Progress() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [codingProgress, setCodingProgress] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalPassedTests: 0,
    totalTests: 0,
    topics: [],
    trend: "stable",
    trendDifference: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/Login");
        return;
      }

      try {
        const [interviewData, codingData] = await Promise.all([
          getMyInterviews(),
          getCodingProgress(),
        ]);

        console.log("Progress interviews:", interviewData);
        console.log("Progress coding:", codingData);

        setInterviews(interviewData.data || []);

        setCodingProgress(
          codingData.progress || {
            totalAttempts: 0,
            averageScore: 0,
            bestScore: 0,
            totalPassedTests: 0,
            totalTests: 0,
            topics: [],
            trend: "stable",
            trendDifference: 0,
          }
        );

      } catch (error) {
        console.error(
          "Failed to load progress:",
          error
        );

        setError(
          error.message ||
          "Unable to load your progress."
        );

      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="progress-page">

        <div className="progress-loading">
          <div className="progress-spinner"></div>

          <p>
            Analyzing your interview progress...
          </p>
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">

        <div className="progress-error">

          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

  /*
   * =========================
   * EMPTY STATE
   * =========================
   */

  if (
    interviews.length === 0 &&
    codingProgress.totalAttempts === 0
  ) {
    return (
      <div className="progress-page">

        <header className="progress-header">

          <button
            className="progress-back"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft />
            Dashboard
          </button>

          <div className="progress-heading">

            <div className="progress-heading-icon">
              <FaChartLine />
            </div>

            <div>
              <h1>
                Your Progress
              </h1>

              <p>
                Track your interview performance and improvement.
              </p>
            </div>

          </div>

        </header>

        <section className="progress-empty">

          <div className="progress-empty-icon">
            <FaChartLine />
          </div>

          <h2>
            Your progress starts here
          </h2>

          <p>
            Complete an AI interview to unlock your
            performance analytics.
          </p>

          <button
            onClick={() => navigate("/InterviewSetup")}
          >
            Start an Interview
          </button>

        </section>

      </div>
    );
  }

  /*
   * =========================
   * SCORE CALCULATIONS
   * =========================
   */

  const overallScores = interviews
    .map((interview) => Number(interview.overallScore))
    .filter((score) => Number.isFinite(score));

  const averageScore =
    overallScores.length > 0
      ? Math.round(
        overallScores.reduce(
          (sum, score) => sum + score,
          0
        ) / overallScores.length
      )
      : 0;

  const bestScore =
    overallScores.length > 0
      ? Math.max(...overallScores)
      : 0;
  /*
   * =========================
   * CATEGORY AVERAGES
   * =========================
   */

  const technicalAverage =
    interviews.length > 0
      ? Math.round(
        interviews.reduce(
          (sum, interview) =>
            sum + Number(interview.averageTechnical || 0),
          0
        ) / interviews.length
      )
      : 0;

  const relevanceAverage =
    interviews.length > 0
      ? Math.round(
        interviews.reduce(
          (sum, interview) =>
            sum + Number(interview.averageRelevance || 0),
          0
        ) / interviews.length
      )
      : 0;

  const completenessAverage =
    interviews.length > 0
      ? Math.round(
        interviews.reduce(
          (sum, interview) =>
            sum + Number(interview.averageCompleteness || 0),
          0
        ) / interviews.length
      )
      : 0;

  const communicationAverage =
    interviews.length > 0
      ? Math.round(
        interviews.reduce(
          (sum, interview) =>
            sum + Number(interview.averageCommunication || 0),
          0
        ) / interviews.length
      )
      : 0;
  /*
   * =========================
   * STRONGEST + FOCUS AREA
   * =========================
   */

  const categories = [
    {
      name: "Technical Accuracy",
      score: technicalAverage,
    },
    {
      name: "Relevance",
      score: relevanceAverage,
    },
    {
      name: "Completeness",
      score: completenessAverage,
    },
    {
      name: "Communication",
      score: communicationAverage,
    },
  ];

  const strongestArea = categories.reduce(
    (best, current) =>
      current.score > best.score
        ? current
        : best
  );

  const focusArea = categories.reduce(
    (lowest, current) =>
      current.score < lowest.score
        ? current
        : lowest
  );

  /*
   * =========================
   * TREND
   * =========================
   */

  const sortedInterviews = [...interviews].sort(
    (a, b) =>
      new Date(a.createdAt) -
      new Date(b.createdAt)
  );

  let trend = "stable";
  let trendDifference = 0;

  if (sortedInterviews.length >= 2) {
    const firstScore =
      sortedInterviews[0].overallScore || 0;

    const lastScore =
      sortedInterviews[
        sortedInterviews.length - 1
      ].overallScore || 0;

    trendDifference =
      lastScore - firstScore;

    if (trendDifference >= 5) {
      trend = "up";
    } else if (trendDifference <= -5) {
      trend = "down";
    }
  }

  /*
   * =========================
   * TREND MESSAGE
   * =========================
   */

  let trendTitle = "";
  let trendMessage = "";

  if (trend === "up") {
    trendTitle = "You're improving";
    trendMessage =
      "Your average score improved across recent interviews.";
  } else if (trend === "down") {
    trendTitle = "Keep pushing";
    trendMessage =
      "Your recent scores have dropped. Review your previous feedback and keep practicing.";
  } else {
    trendTitle = "You're staying consistent";
    trendMessage =
      "Your interview performance is staying relatively consistent.";
  }


  // ======================================================
  // PERFORMANCE SNAPSHOT
  // ======================================================

  const interviewScores = interviews
    .map((interview) => Number(interview.overallScore))
    .filter((score) => Number.isFinite(score));

  const highestInterviewScore =
    interviewScores.length > 0
      ? Math.max(...interviewScores)
      : 0;

  const lowestInterviewScore =
    interviewScores.length > 0
      ? Math.min(...interviewScores)
      : 0;

  const codingScores = codingProgress.trend
    ?.map((item) => Number(item.score))
    .filter((score) => Number.isFinite(score)) || [];

  const highestCodingScore =
    codingScores.length > 0
      ? Math.max(...codingScores)
      : codingProgress.bestScore || 0;

  const lowestCodingScore =
    codingScores.length > 0
      ? Math.min(...codingScores)
      : codingProgress.totalAttempts > 0
        ? codingProgress.averageScore
        : 0;

  const totalInterviewChallenges = interviews.length;

  const totalCodingChallenges =
    codingProgress.totalAttempts;

  const totalInterviewAndCoding =
    totalInterviewChallenges + totalCodingChallenges;


  /*
   * =========================
   * UI
   * =========================
   */

  return (
    <div className="progress-page">

      {/* ================= HEADER ================= */}
      <header className="progress-header">
        <div className="progress-title-wrap">
          <div className="progress-heading-icon">
            <FaChartLine />
          </div>

          <div>
            <span className="progress-eyebrow">INTERVIEWPILOT AI</span>
            <h1>Your Progress</h1>
            <p>Track your interview and coding performance in one place.</p>
          </div>
        </div>

        <button
          className="progress-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>
      </header>

      {/* ================= TWO EQUAL PILLARS ================= */}
      <section className="progress-pillars">

        {/* ================= INTERVIEW ================= */}
        <div className="progress-pillar interview-pillar">

          <div className="pillar-header">
            <div className="pillar-icon">
              <FaChartLine />
            </div>

            <div>
              <span>INTERVIEW PRACTICE</span>
              <h2>Interview Progress</h2>
              <p>
                Your performance across AI-powered interview sessions.
              </p>
            </div>
          </div>


          <div className="pillar-metrics">

            <div className="pillar-metric">
              <span>AVERAGE SCORE</span>
              <strong>{averageScore}/100</strong>
            </div>

            <div className="pillar-metric">
              <span>BEST SCORE</span>
              <strong>{bestScore}/100</strong>
            </div>

            <div className="pillar-metric">
              <span>INTERVIEWS</span>
              <strong>{interviews.length}</strong>
            </div>

          </div>


          <div className="skill-breakdown">

            <div className="mini-section-title">
              <span>SKILL BREAKDOWN</span>
            </div>

            <div className="skill-row">
              <div>
                <span>Technical Accuracy</span>
                <strong>{technicalAverage}%</strong>
              </div>
              <div className="skill-bar">
                <div style={{ width: `${technicalAverage}%` }} />
              </div>
            </div>

            <div className="skill-row">
              <div>
                <span>Relevance</span>
                <strong>{relevanceAverage}%</strong>
              </div>
              <div className="skill-bar">
                <div style={{ width: `${relevanceAverage}%` }} />
              </div>
            </div>

            <div className="skill-row">
              <div>
                <span>Completeness</span>
                <strong>{completenessAverage}%</strong>
              </div>
              <div className="skill-bar">
                <div style={{ width: `${completenessAverage}%` }} />
              </div>
            </div>

            <div className="skill-row">
              <div>
                <span>Communication</span>
                <strong>{communicationAverage}%</strong>
              </div>
              <div className="skill-bar">
                <div style={{ width: `${communicationAverage}%` }} />
              </div>
            </div>

          </div>

        </div>


        {/* ================= CODING ================= */}
        <div className="progress-pillar coding-pillar">

          <div className="pillar-header">
            <div className="pillar-icon">
              {"</>"}
            </div>

            <div>
              <span>CODING PRACTICE</span>
              <h2>Coding Progress</h2>
              <p>
                Your performance across coding challenges and test cases.
              </p>
            </div>
          </div>


          <div className="pillar-metrics">

            <div className="pillar-metric">
              <span>AVERAGE SCORE</span>
              <strong>{codingProgress.averageScore}/100</strong>
            </div>

            <div className="pillar-metric">
              <span>BEST SCORE</span>
              <strong>{codingProgress.bestScore}/100</strong>
            </div>

            <div className="pillar-metric">
              <span>CHALLENGES</span>
              <strong>{codingProgress.totalAttempts}</strong>
            </div>

          </div>


          <div className="coding-details">

            <div className="coding-detail-card">
              <span>TEST CASES PASSED</span>

              <strong>
                {codingProgress.totalPassedTests}/
                {codingProgress.totalTests}
              </strong>

              <p>
                Total successful test cases
              </p>
            </div>


            <div className="coding-detail-card">
              <span>TOPICS PRACTICED</span>

              <strong>
                {codingProgress.topics?.length || 0}
              </strong>

              <p>
                Different coding topics explored
              </p>
            </div>

          </div>


          <div className="coding-topics-block">

            <div className="mini-section-title">
              <span>RECENT TOPICS</span>
            </div>

            {codingProgress.topics?.length > 0 ? (
              <div className="coding-topics">
                {codingProgress.topics.slice(0, 6).map((topic, index) => (
                  <span className="coding-topic" key={index}>
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-topics">
                No coding topics practiced yet.
              </p>
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
    PERFORMANCE SNAPSHOT
===================================================== */}

      <section className="progress-insights">

        <div className="section-heading">
          <span>PERFORMANCE SNAPSHOT</span>
          <h2>Highest & Lowest Performance</h2>
          <p>
            A clear view of your strongest and lowest scores across
            interviews and coding challenges.
          </p>
        </div>


        {/* ================= HIGHEST ================= */}

        <div className="snapshot-grid snapshot-top">

          <div className="snapshot-card">
            <div className="snapshot-icon">
              <FaTrophy />
            </div>

            <div>
              <span>HIGHEST INTERVIEW SCORE</span>
              <h3>{highestInterviewScore}/100</h3>
              <p>Best interview performance</p>
            </div>
          </div>


          <div className="snapshot-card">
            <div className="snapshot-icon">
              {"</>"}
            </div>

            <div>
              <span>HIGHEST CODING SCORE</span>
              <h3>{highestCodingScore}/100</h3>
              <p>Best coding performance</p>
            </div>
          </div>


          <div className="snapshot-card">
            <div className="snapshot-icon">
              <FaBullseye />
            </div>

            <div>
              <span>TOTAL INTERVIEW + CODING</span>
              <h3>{totalInterviewAndCoding}</h3>
              <p>Completed challenges</p>
            </div>
          </div>

        </div>


        {/* ================= LOWEST ================= */}

        <div className="snapshot-grid snapshot-bottom">

          <div className="snapshot-card">
            <div className="snapshot-icon">
              <FaArrowDown />
            </div>

            <div>
              <span>LOWEST INTERVIEW SCORE</span>
              <h3>{lowestInterviewScore}/100</h3>
              <p>Lowest recorded interview score</p>
            </div>
          </div>


          <div className="snapshot-card">
            <div className="snapshot-icon">
              <FaArrowDown />
            </div>

            <div>
              <span>LOWEST CODING SCORE</span>
              <h3>{lowestCodingScore}/100</h3>
              <p>Lowest recorded coding score</p>
            </div>
          </div>

        </div>


        {/* ================= TOTALS ================= */}

        <div className="snapshot-grid snapshot-totals">

          <div className="snapshot-total-card">
            <span>TOTAL INTERVIEW CHALLENGES</span>
            <strong>{totalInterviewChallenges}</strong>
            <p>Completed interview sessions</p>
          </div>


          <div className="snapshot-total-card">
            <span>TOTAL CODING CHALLENGES</span>
            <strong>{totalCodingChallenges}</strong>
            <p>Completed coding sessions</p>
          </div>

        </div>

      </section>


      {/* ================= ACTIONS ================= */}
      <section className="progress-actions">

        <button
          className="progress-btn"
          onClick={() => navigate("/InterviewSetup")}
        >
          Practice Another Interview
        </button>

        <button
          className="progress-btn"
          onClick={() => navigate("/coding-setup")}
        >
          Start Coding Challenge
        </button>

      </section>

    </div>
  );

}

export default Progress;