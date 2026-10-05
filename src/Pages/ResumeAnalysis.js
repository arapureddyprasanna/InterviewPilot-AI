import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ResumeAnalysis.css";

function ResumeAnalysis() {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const storedAnalysis =
      sessionStorage.getItem("resumeAnalysis");

    if (!storedAnalysis) {
      navigate("/dashboard");
      return;
    }

    try {
      setAnalysis(
        JSON.parse(storedAnalysis)
      );
    } catch (error) {
      console.error(error);
      navigate("/dashboard");
    }
  }, [navigate]);

  if (!analysis) {
    return (
      <div className="analysis-loading">
        Loading analysis...
      </div>
    );
  }

  return (
    <div className="analysis-page">

      {/* HEADER */}

      <div className="analysis-header">

        <div>

          <span className="eyebrow">
            INTERVIEWPILOT AI
          </span>

          <h1>
            Your Resume Analysis
          </h1>

          <p>
            We've analyzed your resume to identify
            your strongest career matches and build
            a personalized interview plan.
          </p>

        </div>

      </div>


      {/* SUMMARY */}

      <section className="summary-card">

        <div className="candidate-level">

          <span className="card-label">
            CANDIDATE LEVEL
          </span>

          <h2>
            {analysis.candidateLevel}
          </h2>

        </div>

        <div>

          <span className="card-label">
            AI SUMMARY
          </span>

          <p>
            {analysis.summary}
          </p>

        </div>

      </section>


      {/* ROLE MATCH */}

      <section className="section">

        <span className="card-label">
          CAREER MATCH
        </span>

        <h2>
          Roles that match your resume
        </h2>

        <div className="role-grid">

          {analysis.roles.map(
            (role, index) => (

              <div
                className="role-card"
                key={index}
              >

                <div className="role-header">

                  <div>

                    <h3>
                      {role.role}
                    </h3>

                    <p>
                      {role.reason}
                    </p>

                  </div>

                  <strong>
                    {role.matchPercentage}%
                  </strong>

                </div>


                <div className="progress-track">

                  <div
                    className="progress-bar"
                    style={{
                      width:
                        `${role.matchPercentage}%`,
                    }}
                  />

                </div>


                {role.missingSkills.length > 0 && (

                  <div className="missing-skills">

                    <span>
                      Skills to strengthen
                    </span>

                    <div>

                      {role.missingSkills.map(
                        (skill, skillIndex) => (

                          <span
                            className="skill-tag"
                            key={skillIndex}
                          >
                            {skill}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>

            )
          )}

        </div>

      </section>


      {/* SKILLS */}

      <section className="section">

        <span className="card-label">
          SKILLS DETECTED
        </span>

        <h2>
          Your strongest skills
        </h2>

        <div className="skills-list">

          {analysis.topSkills.map(
            (skill, index) => (

              <span
                className="skill-pill"
                key={index}
              >
                {skill}
              </span>

            )
          )}

        </div>

      </section>


      {/* INTERVIEW PLAN */}

      <section className="interview-card">

        <div className="interview-header">

          <div>

            <span className="card-label">
              PERSONALIZED INTERVIEW
            </span>

            <h2>
              Your interview plan is ready
            </h2>

            <p>
              These questions were generated from
              the skills, projects and experience
              found in your resume.
            </p>

          </div>

          <span className="difficulty-badge">
            {analysis.interviewPlan.difficulty}
          </span>

        </div>


        <div className="focus-section">

          <h3>
            Interview focus
          </h3>

          <div className="skills-list">

            {analysis.interviewPlan.focusAreas.map(
              (area, index) => (

                <span
                  className="skill-pill"
                  key={index}
                >
                  {area}
                </span>

              )
            )}

          </div>

        </div>


        <div className="question-list">

          {analysis.interviewPlan.questions.map(
            (item, index) => (

              <div
                className="question-card"
                key={index}
              >

                <div className="question-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>

                  <div className="question-meta">

                    <span>
                      {item.category}
                    </span>

                    <span>
                      {item.difficulty}
                    </span>

                  </div>

                  <h3>
                    {item.question}
                  </h3>

                  <p>
                    Based on: {item.skill}
                  </p>

                </div>

              </div>

            )
          )}

        </div>


        <button
          className="start-interview-button"
          onClick={() =>
            navigate("/InterviewSetup", {
              state: {
                roles: analysis.roles
              }
            })
          }
        >
        Start AI Interview →
      </button>

    </section>

    </div >
  );
}

export default ResumeAnalysis;