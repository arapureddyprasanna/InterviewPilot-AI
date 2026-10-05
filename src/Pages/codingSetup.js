import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCode, FaArrowRight } from "react-icons/fa";
import "./codingSetup.css";

function CodingSetup() {
  const location = useLocation();
  const navigate = useNavigate();

  const role =
    location.state?.role ||
    localStorage.getItem("selectedRole");

  const roleLanguageMap = {
    "React Developer": "JavaScript",
    "Frontend Developer": "JavaScript",
    "Backend Developer": "JavaScript",
    "Full Stack Developer": "JavaScript",
    "Java Developer": "Java",
    "Python Developer": "Python",
    "AI Engineer": "Python",
    "Data Analyst": "Python",
    "DevOps Engineer": "Python",
    "Cybersecurity Engineer": "Python",
    "Cloud Engineer": "Python",
  };

  const language = roleLanguageMap[role] || "Python";

  const [difficulty, setDifficulty] = useState("Medium");

  const [topic, setTopic] = useState("Problem Solving");

  const topicsByLanguage = {
    JavaScript: [
      "Arrays",
      "Strings",
      "Objects",
      "ES6+",
      "Problem Solving",
    ],

    Java: [
      "Arrays",
      "Strings",
      "OOP",
      "Collections",
      "Problem Solving",
    ],

    Python: [
      "Lists",
      "Strings",
      "Dictionaries",
      "Data Processing",
      "Problem Solving",
    ],
  };

  const availableTopics =
    topicsByLanguage[language] ||
    topicsByLanguage.Python;

  function startCodingRound() {
    navigate("/coding-round", {
      state: {
        role,
        language,
        difficulty,
        topic,
      },
    });
  }

  if (!role) {
    return (
      <div className="coding-setup-page">
        <div className="coding-error-card">
          <h2>No interview role selected</h2>

          <p>
            Please select a role before starting the
            coding round.
          </p>

          <button
            onClick={() => navigate("/InterviewSetup")}
          >
            Select Role
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="coding-setup-page">

      <div className="coding-setup-container">

        {/* HEADER */}

        <div className="coding-setup-header">

          <div className="coding-icon">
            <FaCode />
          </div>

          <span className="coding-eyebrow">
            INTERVIEWPILOT AI
          </span>

          <h1>Coding Round</h1>

          <p>
            Solve coding challenges designed around
            your selected career role.
          </p>

        </div>

        {/* ROLE CARD */}

        <section className="coding-role-card">

          <div>
            <span>SELECTED ROLE</span>

            <h2>{role}</h2>

            <p>
              Your coding round will be tailored
              to this role.
            </p>
          </div>

        </section>

        {/* SETUP CARD */}

        <section className="coding-setup-card">

          {/* LANGUAGE */}

          <div className="setup-section">

            <label>Recommended Language</label>

            <div className="language-display">

              <div className="language-info">

                <strong>{language}</strong>

                <span>
                  Recommended for {role}
                </span>

              </div>

              <span className="recommended-badge">
                Recommended
              </span>

            </div>

          </div>

          {/* DIFFICULTY */}

          <div className="setup-section">

            <label>Difficulty</label>

            <div className="option-grid">

              {["Easy", "Medium", "Hard"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      difficulty === item
                        ? "option-button active"
                        : "option-button"
                    }
                    onClick={() =>
                      setDifficulty(item)
                    }
                  >
                    {item}
                  </button>
                )
              )}

            </div>

          </div>

          {/* TOPIC */}

          <div className="setup-section">

            <label>Problem Focus</label>

            <div className="topic-grid">

              {availableTopics.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    topic === item
                      ? "topic-button active"
                      : "topic-button"
                  }
                  onClick={() =>
                    setTopic(item)
                  }
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          {/* ROUND SUMMARY */}

          <div className="coding-summary">

            <h3>Your Coding Round</h3>

            <div className="summary-row">
              <span>Role</span>
              <strong>{role}</strong>
            </div>

            <div className="summary-row">
              <span>Language</span>
              <strong>{language}</strong>
            </div>

            <div className="summary-row">
              <span>Difficulty</span>
              <strong>{difficulty}</strong>
            </div>

            <div className="summary-row">
              <span>Focus</span>
              <strong>{topic}</strong>
            </div>

          </div>

          {/* START */}

          <button
            className="start-coding-button"
            onClick={startCodingRound}
          >
            Start Coding Round

            <FaArrowRight />
          </button>

        </section>

      </div>

    </div>
  );
}

export default CodingSetup;