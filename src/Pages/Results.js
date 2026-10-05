import { useLocation, useNavigate } from "react-router-dom";
import "./Results.css";

function Results() {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        role,
        difficulty,
        type,
        results = [],
    } = location.state || {};

    if (!results.length) {
        return (
            <div className="results-page">
                <div className="results-empty">
                    <h1>No Interview Results</h1>
                    <p>
                        We couldn't find an interview session to display.
                    </p>

                    <button onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const totalScore = results.reduce(
        (sum, item) => sum + (item.evaluation?.score || 0),
        0
    );

    const averageScore = Math.round(totalScore / results.length);

    const averageTechnical = Math.round(
        results.reduce(
            (sum, item) =>
                sum + (item.evaluation?.technicalAccuracy || 0),
            0
        ) / results.length
    );

    const averageRelevance = Math.round(
        results.reduce(
            (sum, item) =>
                sum + (item.evaluation?.relevance || 0),
            0
        ) / results.length
    );

    const averageCompleteness = Math.round(
        results.reduce(
            (sum, item) =>
                sum + (item.evaluation?.completeness || 0),
            0
        ) / results.length
    );

    const averageCommunication = Math.round(
        results.reduce(
            (sum, item) =>
                sum + (item.evaluation?.communication || 0),
            0
        ) / results.length
    );

    return (
        <div className="results-page">

            {/* HEADER */}

            <header className="results-header">

                <div>
                    <span className="results-eyebrow">
                        INTERVIEWPILOT AI
                    </span>

                    <h1>Interview Results</h1>

                    <p>
                        Here's how you performed in your AI interview.
                    </p>
                </div>

                <button
                    className="dashboard-button"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>

            </header>


            {/* INTERVIEW INFO */}

            <section className="results-info">

                <div>
                    <span>ROLE</span>
                    <strong>{role}</strong>
                </div>

                <div>
                    <span>DIFFICULTY</span>
                    <strong>{difficulty}</strong>
                </div>

                <div>
                    <span>TYPE</span>
                    <strong>{type}</strong>
                </div>

                <div>
                    <span>QUESTIONS</span>
                    <strong>5</strong>
                </div>

            </section>


            {/* OVERALL SCORE */}

            <section className="overall-score-card">

                <div>
                    <span className="results-label">
                        OVERALL SCORE
                    </span>

                    <h2>{averageScore}/100</h2>

                    <p>
                        Based on your performance across all interview
                        questions.
                    </p>
                </div>

            </section>


            {/* CATEGORY SCORES */}

            <section className="category-section">

                <h2>Performance Breakdown</h2>

                <div className="category-grid">

                    <div className="category-card">
                        <span>Technical Accuracy</span>
                        <strong>{averageTechnical}/100</strong>
                    </div>

                    <div className="category-card">
                        <span>Relevance</span>
                        <strong>{averageRelevance}/100</strong>
                    </div>

                    <div className="category-card">
                        <span>Completeness</span>
                        <strong>{averageCompleteness}/100</strong>
                    </div>

                    <div className="category-card">
                        <span>Communication</span>
                        <strong>{averageCommunication}/100</strong>
                    </div>

                </div>

            </section>


            {/* QUESTION RESULTS */}

            <section className="question-results">

                <h2>Question-by-Question Results</h2>

                {results.map((item) => (

                    <article
                        className="result-question-card"
                        key={item.questionNumber}
                    >

                        <div className="result-question-header">

                            <span>
                                QUESTION{" "}
                                {String(item.questionNumber).padStart(
                                    2,
                                    "0"
                                )}
                            </span>

                            <strong>
                                {item.evaluation?.score || 0}/100
                            </strong>

                        </div>

                        <h3>{item.question}</h3>

                        <p className="candidate-answer">
                            <strong>Your Answer:</strong>{" "}
                            {item.answer}
                        </p>

                        <p>
                            {item.evaluation?.feedback}
                        </p>

                    </article>

                ))}

            </section>


            {/* ACTIONS */}

            <section className="results-actions">

                <button
                    onClick={() => navigate("/InterviewSetup", {
                        state: {
                            roles: []
                        }
                    })}
                >
                    Take Another Interview →
                </button>

                <button
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>

            </section>

        </div>
    );
}

export default Results;