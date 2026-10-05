import { useNavigate, Link } from "react-router-dom";
import {
  FaRobot,
  FaFileAlt,
  FaCode,
  FaChartLine,
  FaArrowRight,
  FaCheckCircle,
  FaBolt,
  FaPlay,
} from "react-icons/fa";

import "./Home.css";

function Home() {
  const navigate = useNavigate();

  function handleGetStarted() {
    navigate("/register");
  }

  return (
    <div className="home-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="home-navbar">

        <div className="home-logo">
          <div className="home-logo-icon">
            <FaRobot />
          </div>

          <span>
            InterviewPilot
          </span>

        </div>

        <div className="home-nav-links">

          <a href="#features">
            Features
          </a>

          <a href="#how-it-works">
            How it works
          </a>

          <a href="#why-interviewpilot">
            Why InterviewPilot
          </a>

        </div>

        <div className="home-nav-actions">

          <Link
            to="/login"
            className="home-login-link"
          >
            Login
          </Link>

          <button
            className="home-nav-button"
            onClick={handleGetStarted}
          >
            Get Started
            <FaArrowRight />
          </button>

        </div>

      </nav>


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="home-hero">

        <div className="hero-background-glow hero-glow-left"></div>
        <div className="hero-background-glow hero-glow-right"></div>

        <div className="hero-grid-pattern"></div>

        <div className="home-hero-content">

          <div className="home-hero-badge">
            <span className="home-badge-dot"></span>

            AI-powered interview preparation

          </div>

          <h1>

            Your next interview
            <span> starts here.</span>

          </h1>

          <p>

            Practice realistic interviews, analyze your resume,
            sharpen your coding skills and get personalized
            AI feedback, all in one place.

          </p>

          <div className="home-hero-actions">

            <button
              className="home-primary-button"
              onClick={handleGetStarted}
            >

              Start Practicing

              <FaArrowRight />

            </button>

            <a
              href="#features"
              className="home-secondary-button"
            >

              <FaPlay />

              Explore Platform

            </a>

          </div>

          <div className="hero-trust-row">

            <span>
              <FaCheckCircle />
              AI-powered feedback
            </span>

            <span>
              <FaCheckCircle />
              Real coding evaluation
            </span>

            <span>
              <FaCheckCircle />
              Progress tracking
            </span>

          </div>

        </div>


        {/* ==================================================
            HERO VISUAL
        ================================================== */}

        <div className="home-hero-visual">

          <div className="hero-orbit-large"></div>
          <div className="hero-orbit-small"></div>

          <div className="ai-dashboard-card">

            <div className="ai-card-top">

              <div className="ai-status">
                <span></span>
                AI ENGINE ONLINE
              </div>

              <FaBolt />

            </div>

            <div className="ai-card-center">

              <div className="ai-main-icon">
                <FaRobot />
              </div>

              <span>
                INTERVIEWPILOT AI
              </span>

              <strong>
                Ready to interview you.
              </strong>

            </div>

            <div className="ai-card-bottom">

              <div>
                <small>
                  QUESTIONS
                </small>

                <strong>
                  Dynamic
                </strong>
              </div>

              <div>
                <small>
                  FEEDBACK
                </small>

                <strong>
                  AI Powered
                </strong>
              </div>

              <div>
                <small>
                  MODE
                </small>

                <strong>
                  Live
                </strong>
              </div>

            </div>

          </div>


          <div className="floating-card floating-card-one">

            <FaChartLine />

            <div>
              <strong>
                Smart Feedback
              </strong>

              <span>
                After every session
              </span>
            </div>

          </div>


          <div className="floating-card floating-card-two">

            <FaCode />

            <div>
              <strong>
                Coding Round
              </strong>

              <span>
                Judge-based evaluation
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          FEATURES
      ================================================== */}

      <section
        className="home-features"
        id="features"
      >

        <div className="home-section-heading">

          <span>
            THE PREP LAB
          </span>

          <h2>
            Everything you need to
            <strong> prepare smarter.</strong>
          </h2>

          <p>
            One platform for the parts of interview preparation
            that actually matter.
          </p>

        </div>


        <div className="home-feature-grid">


          {/* RESUME */}

          <div className="home-feature-card resume-feature">

            <div className="feature-icon">
              <FaFileAlt />
            </div>

            <span className="feature-number">
              01
            </span>

            <h3>
              Resume Analysis
            </h3>

            <p>
              Upload your resume and let AI analyze your
              skills, projects, experience and areas for
              improvement.
            </p>

            <div className="feature-arrow">
              <FaArrowRight />
            </div>

          </div>


          {/* INTERVIEW */}

          <div className="home-feature-card interview-feature">

            <div className="feature-icon">
              <FaRobot />
            </div>

            <span className="feature-number">
              02
            </span>

            <h3>
              AI Interviews
            </h3>

            <p>
              Experience dynamically generated interview
              questions followed by intelligent answer
              evaluation.
            </p>

            <div className="feature-arrow">
              <FaArrowRight />
            </div>

          </div>


          {/* CODING */}

          <div className="home-feature-card coding-feature">

            <div className="feature-icon">
              <FaCode />
            </div>

            <span className="feature-number">
              03
            </span>

            <h3>
              Coding Practice
            </h3>

            <p>
              Solve coding problems and run your solutions
              against real test cases for objective evaluation.
            </p>

            <div className="feature-arrow">
              <FaArrowRight />
            </div>

          </div>


          {/* PROGRESS */}

          <div className="home-feature-card progress-feature">

            <div className="feature-icon">
              <FaChartLine />
            </div>

            <span className="feature-number">
              04
            </span>

            <h3>
              Track Progress
            </h3>

            <p>
              Understand your performance across interviews
              and coding rounds and see how you improve.
            </p>

            <div className="feature-arrow">
              <FaArrowRight />
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          HOW IT WORKS
      ================================================== */}

      <section
        className="home-how"
        id="how-it-works"
      >

        <div className="home-section-heading">

          <span>
            HOW IT WORKS
          </span>

          <h2>
            From preparation
            <strong> to progress.</strong>
          </h2>

          <p>
            InterviewPilot turns scattered interview preparation
            into one focused workflow.
          </p>

        </div>


        <div className="how-steps">


          <div className="how-step">

            <div className="step-number">
              01
            </div>

            <div className="step-line"></div>

            <h3>
              Build your profile
            </h3>

            <p>
              Create your account and prepare your
              interview workspace.
            </p>

          </div>


          <div className="how-step">

            <div className="step-number">
              02
            </div>

            <div className="step-line"></div>

            <h3>
              Practice
            </h3>

            <p>
              Take AI interviews, analyze your resume
              and solve coding challenges.
            </p>

          </div>


          <div className="how-step">

            <div className="step-number">
              03
            </div>

            <h3>
              Improve
            </h3>

            <p>
              Use AI feedback and performance insights
              to identify what to work on next.
            </p>

          </div>

        </div>

      </section>


      {/* ==================================================
          WHY INTERVIEWPILOT
      ================================================== */}

      <section
        className="home-why"
        id="why-interviewpilot"
      >

        <div className="why-visual">

          <div className="why-glow"></div>

          <div className="why-panel">

            <div className="why-panel-header">

              <span>
                YOUR PREPARATION
              </span>

              <FaBolt />

            </div>

            <div className="why-progress">

              <div className="why-progress-top">

                <span>
                  Interview readiness
                </span>

                <strong>
                  AI assisted
                </strong>

              </div>

              <div className="progress-track">
                <div className="progress-fill"></div>
              </div>

            </div>

            <div className="why-mini-grid">

              <div>
                <FaRobot />
                <span>
                  Interviews
                </span>
              </div>

              <div>
                <FaCode />
                <span>
                  Coding
                </span>
              </div>

              <div>
                <FaChartLine />
                <span>
                  Progress
                </span>
              </div>

            </div>

          </div>

        </div>


        <div className="why-content">

          <span>
            BUILT FOR BETTER PREPARATION
          </span>

          <h2>
            Stop guessing
            <br />
            <strong>what to practice next.</strong>
          </h2>

          <p>
            InterviewPilot brings your resume, interviews,
            coding practice and performance history into
            one connected preparation experience.
          </p>

          <div className="why-list">

            <div>
              <FaCheckCircle />
              <span>
                Personalized AI feedback
              </span>
            </div>

            <div>
              <FaCheckCircle />
              <span>
                Realistic interview practice
              </span>
            </div>

            <div>
              <FaCheckCircle />
              <span>
                Objective coding evaluation
              </span>
            </div>

            <div>
              <FaCheckCircle />
              <span>
                One place for your progress
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          FINAL CTA
      ================================================== */}

      <section className="home-final-cta">

        <div className="final-cta-glow"></div>

        <span>
          READY WHEN YOU ARE
        </span>

        <h2>
          Your next interview
          <br />
          deserves better preparation.
        </h2>

        <p>
          Start practicing with InterviewPilot AI today.
        </p>

        <button
          onClick={handleGetStarted}
          className="final-cta-button"
        >
          Get Started
          <FaArrowRight />
        </button>

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="home-footer">

        <div className="footer-brand">

          <div className="home-logo">

            <div className="home-logo-icon">
              <FaRobot />
            </div>

            <span>
              InterviewPilot
            </span>

          </div>

          <p>
            Your personal AI interviewer.
          </p>

        </div>

        <div className="footer-links">

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

        </div>

        <div className="footer-copy">
          © 2026 InterviewPilot AI
        </div>

      </footer>

    </div>
  );
}

export default Home;