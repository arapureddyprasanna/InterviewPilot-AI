import { useLocation, useNavigate } from "react-router-dom";
import "./CodingResults.css";

function CodingResults() {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        role,
        difficulty,
        language,
        result,
    } = location.state || {};

    if (!result) {
        return (
            <div className="coding-results-page">
                <div className="coding-results-empty">
                    <div className="empty-icon">{"</>"}</div>

                    <span>INTERVIEWPILOT AI</span>

                    <h1>No Coding Results</h1>

                    <p>
                        We couldn't find a completed coding session to display.
                    </p>

                    <button onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const score = result.score ?? 0;

    const testCasesPassed =
        result.testCasesPassed ??
        result.passedTestCases ??
        0;

    const totalTestCases =
        result.totalTestCases ??
        result.totalTests ??
        0;

    const codeQuality =
        result.codeQuality ??
        result.quality ??
        0;

    const efficiency =
        result.efficiency ??
        result.efficiencyScore ??
        0;

    const feedback =
        result.feedback ??
        result.explanation ??
        "Your submission has been evaluated by AI.";

    const strengths = result.strengths || [];
    const improvements = result.improvements || [];

    return (
        <div className="coding-results-page">

            {/* HEADER */}

            <header className="coding-results-header">

                <div className="coding-results-brand">
                    <div className="coding-results-icon">
                        {"</>"}
                    </div>

                    <div>
                        <span>INTERVIEWPILOT AI</span>
                        <h1>Coding Results</h1>
                    </div>
                </div>

                <button
                    className="coding-results-dashboard"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>

            </header>

            {/* HERO */}

            <section className="coding-results-hero">

                <div className="coding-complete-badge">
                    ✓ CODING ROUND COMPLETE
                </div>

                <h2>
                    Nice work on your coding challenge.
                </h2>

                <p>
                    Here's a breakdown of your submission and AI evaluation.
                </p>

            </section>

            {/* SESSION INFO */}

            <section className="coding-results-info">

                <div>
                    <span>ROLE</span>
                    <strong>{role || "Developer"}</strong>
                </div>

                <div>
                    <span>DIFFICULTY</span>
                    <strong>{difficulty || "Medium"}</strong>
                </div>

                <div>
                    <span>LANGUAGE</span>
                    <strong>{language || "JavaScript"}</strong>
                </div>

                <div>
                    <span>STATUS</span>
                    <strong className="success-text">
                        Completed
                    </strong>
                </div>

            </section>

            {/* SCORE */}

            <section className="coding-score-card">

                <div className="coding-score-circle">
                    <div>
                        <strong>{score}</strong>
                        <span>/100</span>
                    </div>
                </div>

                <div className="coding-score-content">
                    <span className="coding-results-label">
                        OVERALL SCORE
                    </span>

                    <h2>
                        Coding Performance
                    </h2>

                    <p>
                        Your score is based on correctness,
                        code quality, efficiency and overall solution quality.
                    </p>
                </div>

            </section>

            {/* PERFORMANCE */}

            <section className="coding-performance">

                <div className="section-heading">
                    <span>PERFORMANCE</span>
                    <h2>Evaluation Breakdown</h2>
                </div>

                <div className="coding-metrics">

                    <div className="coding-metric-card">
                        <div className="metric-icon">✓</div>

                        <div>
                            <span>TEST CASES</span>

                            <strong>
                                {testCasesPassed}/{totalTestCases}
                            </strong>

                            <p>Passed successfully</p>
                        </div>
                    </div>

                    <div className="coding-metric-card">
                        <div className="metric-icon">&lt;/&gt;</div>

                        <div>
                            <span>CODE QUALITY</span>

                            <strong>
                                {codeQuality}/100
                            </strong>

                            <p>Structure & readability</p>
                        </div>
                    </div>

                    <div className="coding-metric-card">
                        <div className="metric-icon">⚡</div>

                        <div>
                            <span>EFFICIENCY</span>

                            <strong>
                                {efficiency}/100
                            </strong>

                            <p>Time & space usage</p>
                        </div>
                    </div>

                </div>

            </section>

            {/* FEEDBACK */}

            <section className="coding-feedback-card">

                <div className="feedback-heading">
                    <div className="feedback-ai-icon">
                        ✦
                    </div>

                    <div>
                        <span>AI EVALUATION</span>
                        <h2>Feedback on Your Solution</h2>
                    </div>
                </div>

                <p className="main-feedback">
                    {feedback}
                </p>

                {(strengths.length > 0 || improvements.length > 0) && (
                    <div className="feedback-grid">

                        {strengths.length > 0 && (
                            <div className="feedback-section strengths">
                                <h3>✓ Strengths</h3>

                                <ul>
                                    {strengths.map((item, index) => (
                                        <li key={index}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {improvements.length > 0 && (
                            <div className="feedback-section improvements">
                                <h3>↗ Areas to Improve</h3>

                                <ul>
                                    {improvements.map((item, index) => (
                                        <li key={index}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                )}

            </section>

            {/* ACTIONS */}

            <section className="coding-results-actions">

                <button
                    className="another-coding-button"
                    onClick={() => navigate("/coding-setup")}
                >
                    Take Another Coding Challenge →
                </button>

                <button
                    className="coding-dashboard-button"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>

            </section>

        </div>
    );
}

export default CodingResults;