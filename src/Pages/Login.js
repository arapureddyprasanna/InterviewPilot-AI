import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import {
  FaRobot,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./T4.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // CLEAR LOGIN FORM WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }, []);

  // =====================================================
  // GOOGLE SIGN IN
  // =====================================================

  async function handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      console.log("Google user:", user);
      console.log("Name:", user.displayName);
      console.log("Email:", user.email);

      // Get Firebase ID token
      const token = await user.getIdToken();

      // Sync user with backend
      const response = await fetch(
        "http://localhost:5000/api/users/sync",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("Google backend sync:", data);

      if (!response.ok) {
        alert("Backend authentication failed!");
        return;
      }

      alert("Login Successful! 🔐");

      navigate("/Dashboard");
    } catch (error) {
      console.error("Google sign-in error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        return;
      }

      if (
        error.code ===
        "auth/account-exists-with-different-credential"
      ) {
        alert(
          "An account already exists with this email. Please use your existing login method."
        );
        return;
      }

      if (error.code === "auth/popup-blocked") {
        alert(
          "Google sign-in popup was blocked. Please allow popups and try again."
        );
        return;
      }

      alert("Google sign-in failed. Please try again.");
    }
  }

  // =====================================================
  // EMAIL / PASSWORD LOGIN
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    // Basic email validation
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      alert("Please enter your email address.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    // Simple email format check
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      // =================================================
      // FIREBASE LOGIN
      // =================================================

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

      const user = userCredential.user;

      console.log("Logged in user:", user.email);
      console.log(
        "Email verified:",
        user.emailVerified
      );

      // =================================================
      // EMAIL VERIFICATION CHECK
      // =================================================

      if (!user.emailVerified) {
        alert(
          "Please verify your email before accessing InterviewPilot."
        );

        navigate("/EmailVerification");
        return;
      }

      // =================================================
      // BACKEND SYNC
      // =================================================

      const token = await user.getIdToken();

      const response = await fetch(
        "http://localhost:5000/api/users/sync",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      console.log("User sync:", result);

      if (!response.ok) {
        alert(
          result.message ||
          "Backend authentication failed!"
        );
        return;
      }

      // =================================================
      // LOGIN SUCCESS
      // =================================================

      alert("Login Successful! 🔐");

      // Clear form before navigating
      setEmail("");
      setPassword("");
      setShowPassword(false);

      navigate("/Dashboard");
    } catch (error) {
      console.error("Login error:", error);

      // =================================================
      // FIREBASE LOGIN ERRORS
      // =================================================

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        alert(
          "No account found or incorrect email/password."
        );
      } else if (
        error.code === "auth/wrong-password"
      ) {
        alert("Incorrect password.");
      } else if (
        error.code === "auth/invalid-email"
      ) {
        alert("Invalid email address.");
      } else if (
        error.code === "auth/user-disabled"
      ) {
        alert(
          "This account has been disabled. Please contact support."
        );
      } else if (
        error.code === "auth/too-many-requests"
      ) {
        alert(
          "Too many login attempts. Please try again later."
        );
      } else {
        alert(
          "Login failed. Please check your credentials and try again."
        );
      }
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="register-page">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="register-topbar">

        <Link to="/" className="register-brand">
          <span className="brand-icon">✦</span>
          <span>InterviewPilot</span>
        </Link>

        <div className="topbar-login">
          Don't have an account?
          <Link to="/Register"> Register</Link>
        </div>

      </header>


      {/* =====================================================
          MAIN LOGIN SECTION
      ===================================================== */}

      <main className="register-main">

        <section className="register-intro">

          <div className="intro-badge">
            <span>✦</span>
            AI-POWERED INTERVIEW PREP
          </div>

          <h1>
            Welcome
            <br />
            <span>back.</span>
          </h1>

          <p>
            Continue your interview preparation with
            personalized AI-powered practice, coding
            challenges, and performance insights.
          </p>

          <div className="register-features">

            <div className="feature-item">

              <span className="feature-icon">
                ✦
              </span>

              <div>
                <strong>
                  AI Interview Practice
                </strong>

                <p>
                  Practice with intelligent interview
                  simulations.
                </p>
              </div>

            </div>


            <div className="feature-item">

              <span className="feature-icon">
                ⌘
              </span>

              <div>
                <strong>
                  Coding Challenges
                </strong>

                <p>
                  Sharpen your programming and
                  problem-solving skills.
                </p>
              </div>

            </div>


            <div className="feature-item">

              <span className="feature-icon">
                ↗
              </span>

              <div>
                <strong>
                  Track Your Progress
                </strong>

                <p>
                  Understand your strengths and
                  improve consistently.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* LOGIN CARD */}

        <section className="register-card">

          <div className="register-card-header">

            <div className="register-card-icon">
              <FaRobot />
            </div>

            <div>
              <span>
                WELCOME BACK
              </span>

              <h2>
                Login to InterviewPilot
              </h2>
            </div>

          </div>


          <p className="register-card-description">
            Continue your interview preparation workspace.
          </p>


          <form onSubmit={handleSubmit}>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="register-input-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                autoComplete="off"
              />

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="register-input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-password-wrapper">

                <input
                  id="password"
                  className="register-password-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="off"
                />

                <button
                  type="button"
                  className="register-eye-button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="register-submit-button"
            >
              Login
              <FaArrowRight />
            </button>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="register-divider">
              <span>OR</span>
            </div>


            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}

            <button
              type="button"
              className="google-auth-button"
              onClick={handleGoogleSignIn}
            >
              <span className="google-icon">
                G
              </span>

              Continue with Google
            </button>

          </form>


          {/* =================================================
              SECURE LOGIN
          ================================================= */}

          <div className="register-divider">
            <span>
              SECURE LOGIN
            </span>
          </div>


          <p className="register-login-text">
            Don't have an account?

            <Link to="/Register">
              Register here
            </Link>
          </p>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="register-footer">

        <span>
          © 2026 InterviewPilot
        </span>

        <span>
          AI-powered interview preparation
        </span>

      </footer>

    </div>
  );
}

export default Login;
