import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBrain,
  FaCode,
  FaRobot,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import "./InterviewSetup.css";
import { auth } from "../firebase";

function InterviewSetup() {
  console.log("INTERVIEW SETUP PAGE LOADED");

  const location = useLocation();
  const navigate = useNavigate();

  const fromCoding = location.state?.fromCoding || false;

  const recommendedRoles = location.state?.roles || [];
  console.log("Recommended roles:", recommendedRoles);

  const [role, setRole] = useState("React Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [type, setType] = useState("Technical");

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "React Developer",
    "Java Developer",
    "Python Developer",
    "AI Engineer",
    "Data Analyst",
    "DevOps Engineer",
    "Cybersecurity Engineer",
    "Cloud Engineer",
  ];

  const filteredRoles = roles.filter((item) =>
    item.toLowerCase().includes(role.toLowerCase())
  );

  async function startInterview() {
    if (role.trim() === "") {
      alert("Please enter a role");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        navigate("/Login");
        return;
      }

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

      const data = await response.json();

      console.log("Resume check:", data);

      // No resume uploaded
      if (!response.ok || data.success === false) {
        alert("Please upload your resume first.");
        navigate("/Dashboard");
        return;
      }

      // Resume exists → start interview
      localStorage.setItem("selectedRole", role);

      navigate("/Interview", {
        state: {
          role,
          difficulty,
          type,
        },
      });

    } catch (error) {
      console.error("Resume check failed:", error);

      alert("Please upload your resume first.");
      navigate("/Dashboard");
    }
  }

  async function continueToCoding() {
    if (role.trim() === "") {
      alert("Please select a role");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first.");
        navigate("/Login");
        return;
      }

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

      const data = await response.json();

      console.log("Resume check for coding:", data);

      // No resume uploaded
      if (!response.ok || data.success === false) {
        alert("Please upload your resume first.");
        navigate("/Dashboard");
        return;
      }

      // Resume exists → continue to coding setup
      localStorage.setItem("selectedRole", role);

      navigate("/coding-setup", {
        state: {
          role,
        },
      });

    } catch (error) {
      console.error("Resume check failed for coding:", error);

      alert("Please upload your resume first.");
      navigate("/Dashboard");
    }
  }

  return (
    <div className="interview-setup-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="interview-setup-header">

        <button
          className="setup-back-button"
          onClick={() => navigate("/Dashboard")}
          type="button"
        >
          <FaArrowLeft />
          <span>Dashboard</span>
        </button>

        <div className="setup-brand">
          <div className="setup-brand-icon">
            <FaRobot />
          </div>
          <span>InterviewPilot</span>
        </div>

        <div className="setup-header-status">
          <span className="status-dot"></span>
          AI Interviewer Ready
        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <main className="interview-setup-main">

        <section className="setup-hero">

          <div className="setup-hero-badge">
            <FaBrain />
            {fromCoding
              ? "CODING PREPARATION"
              : "AI INTERVIEW PREPARATION"}
          </div>

          <h1>
            {fromCoding ? (
              <>
                Choose your
                <span> coding role.</span>
              </>
            ) : (
              <>
                Build your
                <span> interview.</span>
              </>
            )}
          </h1>

          <p>
            {fromCoding
              ? "Choose the role you want to practice coding for and continue to your coding setup."
              : "Tell InterviewPilot what you're preparing for. We'll tailor your interview experience around your goals."}
          </p>

        </section>


        {/* =====================================================
            SETUP CARD
        ===================================================== */}

        <section className="interview-setup-card">

          {/* ROLE */}

          <div className="setup-section">

            <div className="setup-section-heading">

              <div className="setup-section-icon">
                <FaCode />
              </div>

              <div>
                <h2>Choose your role</h2>
                <p>Select a role or enter your own.</p>
              </div>

            </div>


            {/* ROLE SEARCH */}

            <div className="role-search-wrapper">

              <FaSearch className="role-search-icon" />

              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Search or enter a role..."
              />

            </div>


            {/* SUGGESTED ROLES */}

            <div className="role-group">

              <div className="role-group-title">
                Suggested roles
              </div>

              <div className="role-list">

                {filteredRoles.length > 0 ? (
                  filteredRoles.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`role-chip ${role === item ? "selected" : ""
                        }`}
                      onClick={() => setRole(item)}
                    >
                      {item}

                      {role === item && (
                        <span className="role-check">✓</span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="no-role-message">
                    No matching suggestions. You can continue with
                    your custom role.
                  </p>
                )}

              </div>

            </div>


            {/* RECOMMENDED ROLES */}

            {recommendedRoles.length > 0 && (
              <div className="recommended-section">

                <div className="role-group-title">
                  <FaStar />
                  Recommended for you
                </div>

                <div className="recommended-list">

                  {recommendedRoles.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      className={`recommended-role ${role === item.role ? "selected" : ""
                        }`}
                      onClick={() => setRole(item.role)}
                    >

                      <div className="recommended-role-left">

                        <div className="recommended-icon">
                          <FaStar />
                        </div>

                        <div>
                          <strong>{item.role}</strong>
                          <span>Recommended match</span>
                        </div>

                      </div>

                      <div className="match-percentage">
                        {item.matchPercentage}%
                      </div>

                    </button>
                  ))}

                </div>

              </div>
            )}

          </div>


          {/* =================================================
              INTERVIEW OPTIONS
          ================================================= */}

          {!fromCoding && (
            <>

              <div className="setup-divider"></div>

              <div className="setup-section">

                <div className="setup-section-heading">

                  <div className="setup-section-icon">
                    <FaBrain />
                  </div>

                  <div>
                    <h2>Customize your interview</h2>
                    <p>Choose how you want your AI interview to feel.</p>
                  </div>

                </div>


                {/* DIFFICULTY */}

                <div className="option-group">

                  <label>Difficulty</label>

                  <div className="option-grid">

                    {["Easy", "Medium", "Hard"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`option-card ${difficulty === item ? "selected" : ""
                          }`}
                        onClick={() => setDifficulty(item)}
                      >
                        <span className="option-card-title">
                          {item}
                        </span>

                        <span className="option-card-description">
                          {item === "Easy" &&
                            "Build confidence"}
                          {item === "Medium" &&
                            "Balanced challenge"}
                          {item === "Hard" &&
                            "Push your limits"}
                        </span>

                        {difficulty === item && (
                          <span className="option-check">✓</span>
                        )}
                      </button>
                    ))}

                  </div>

                </div>


                {/* INTERVIEW TYPE */}

                <div className="option-group">

                  <label>Interview type</label>

                  <div className="option-grid type-grid">

                    {["Technical", "HR", "Mixed"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`option-card ${type === item ? "selected" : ""
                          }`}
                        onClick={() => setType(item)}
                      >

                        <span className="option-card-title">
                          {item}
                        </span>

                        <span className="option-card-description">
                          {item === "Technical" &&
                            "Skills & technical questions"}
                          {item === "HR" &&
                            "Behavioral & career questions"}
                          {item === "Mixed" &&
                            "Technical + behavioral"}
                        </span>

                        {type === item && (
                          <span className="option-check">✓</span>
                        )}

                      </button>
                    ))}

                  </div>

                </div>

              </div>

            </>
          )}


          {/* =================================================
              ACTION
          ================================================= */}

          <div className="setup-action">

            <div className="setup-summary">

              <span>Selected role</span>

              <strong>
                {role || "No role selected"}
              </strong>

            </div>


            {!fromCoding ? (
              <button
                className="setup-primary-button"
                onClick={startInterview}
                type="button"
              >
                <span>Start Interview</span>
                <FaArrowRight />
              </button>
            ) : (
              <button
                className="setup-primary-button"
                onClick={continueToCoding}
                type="button"
              >
                <span>Continue to Coding</span>
                <FaArrowRight />
              </button>
            )}

          </div>

        </section>


        {/* =====================================================
            FOOT NOTE
        ===================================================== */}

        <div className="setup-footer-note">
          <FaRobot />
          Your AI interviewer will adapt to your selected role
          and preferences.
        </div>

      </main>

    </div>
  );
}

export default InterviewSetup;
