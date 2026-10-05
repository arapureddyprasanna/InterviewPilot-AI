import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaRobot,
  FaArrowRight,
} from "react-icons/fa";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";


import { auth } from "../firebase";

import "./T4.css";

function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordColor, setPasswordColor] = useState("red");

  const navigate = useNavigate();

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      const password = e.target.value;

      if (password.length === 0) {
        setPasswordColor("red");
      } else if (
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[@$!%\*?&]/.test(password) &&
        password.length >= 8 &&
        password.length <= 16
      ) {
        setPasswordColor("green");
      } else if (
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password)
      ) {
        setPasswordColor("orange");
      } else {
        setPasswordColor("yellow");
      }
    }
  }
  async function handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      console.log("Google user:", user);
      console.log("Google name:", user.displayName);
      console.log("Google email:", user.email);

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

      const data = await response.json();

      console.log("Google backend sync:", data);

      if (!response.ok) {
        alert("Backend authentication failed!");
        return;
      }

      navigate("/Dashboard");
    } catch (error) {
      console.error("Google sign-in error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        return;
      }

      if (error.code === "auth/account-exists-with-different-credential") {
        alert(
          "An account already exists with this email. Please login using your existing method."
        );
        return;
      }

      alert("Google sign-in failed. Please try again.");
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();

    const normalizedEmail = data.email.trim().toLowerCase();

    let errors = [];
    let passwordErrors = [];

    !/^[A-Za-z ]+$/.test(data.name) &&
      errors.push("Name should contain only alphabets.");

    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) &&
      errors.push("Enter a valid email.");

    (data.password.length < 8 || data.password.length > 16) &&
      passwordErrors.push("Minimum 8 and maximum 16 characters");

    !/[A-Z]/.test(data.password) &&
      passwordErrors.push("One uppercase letter");

    !/[a-z]/.test(data.password) &&
      passwordErrors.push("One lowercase letter");

    !/\d/.test(data.password) &&
      passwordErrors.push("One number");

    !/[@$!%*?&]/.test(data.password) &&
      passwordErrors.push("One special character");

    if (passwordErrors.length) {
      errors.push(
        "Password must contain:\n" +
        passwordErrors.join("\n")
      );
    }

    data.password !== data.confirmPassword &&
      errors.push("Passwords do not match.");

    if (errors.length) {
      alert(errors.join("\n\n"));
      return;
    }

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          data.password
        );

      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      await sendEmailVerification(userCredential.user);

      setData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/EmailVerification");

    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("Password is too weak.");
      } else {
        alert("Registration failed. Please try again.");
      }
    }
  }
  return (
    <div className="register-page">

      {/* ==================================================
    INTELLIGENCE BACKGROUND
    ================================================== */}
      {/* Top logo */}
      <div className="register-topbar">
        <Link to="/" className="register-brand">
          <div className="register-brand-icon">
            <FaRobot />
          </div>

          <span>InterviewPilot</span>
        </Link>

        <div className="register-top-login">
          Already have an account?
          <Link to="/Login">Login</Link>
        </div>
      </div>

      {/* Main content */}
      <main className="register-main">

        {/* Left information panel */}
        <section className="register-intro">

          <div className="register-intro-badge">
            <span></span>
            AI-POWERED INTERVIEW PREPARATION
          </div>

          <h1>
            Build your
            <span> interview advantage.</span>
          </h1>

          <p>
            Create your InterviewPilot account and bring your
            resume analysis, AI interviews, coding practice and
            progress tracking into one workspace.
          </p>

          <div className="register-feature-list">

            <div className="register-feature">
              <div className="register-feature-number">01</div>

              <div>
                <strong>Practice smarter</strong>
                <span>
                  Prepare with realistic AI-powered interviews.
                </span>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-feature-number">02</div>

              <div>
                <strong>Improve continuously</strong>
                <span>
                  Get feedback that helps you identify areas to improve.
                </span>
              </div>
            </div>

            <div className="register-feature">
              <div className="register-feature-number">03</div>

              <div>
                <strong>Track your progress</strong>
                <span>
                  Keep your interview and coding journey in one place.
                </span>
              </div>
            </div>

          </div>

        </section>

        {/* Register card */}
        <section className="register-card">

          <div className="register-card-header">

            <div className="register-card-icon">
              <FaRobot />
            </div>

            <div>
              <span>WELCOME TO INTERVIEWPILOT</span>
              <h2>Create your account</h2>
            </div>

          </div>

          <p className="register-card-description">
            Start building your interview preparation workspace.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="register-input-group">

              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={data.name}
                onChange={handleChange}
                required
              />

            </div>

            {/* Email */}
            <div className="register-input-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={data.email}
                onChange={handleChange}
                required
              />

            </div>

            {/* Password */}
            <div className="register-input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-password-wrapper">

                <input
                  id="password"
                  className={`register-password-input password-${passwordColor}`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={data.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="register-eye-button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>

              <div className="register-password-hint">
                8-16 characters • uppercase • lowercase • number • special character
              </div>

            </div>

            {/* Confirm Password */}
            <div className="register-input-group">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="register-password-wrapper">

                <input
                  id="confirmPassword"
                  className="register-password-input"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={data.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="register-eye-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="register-submit-button"
            >
              Create Account
              <FaArrowRight />
            </button>

            <div className="register-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="google-auth-button"
              onClick={handleGoogleSignIn}
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

          </form>

          <div className="register-divider">
            <span>SECURE ACCOUNT CREATION</span>
          </div>

          <p className="register-login-text">
            Already have an account?
            <Link to="/Login">
              Login here
            </Link>
          </p>

        </section>

      </main>

      <div className="register-footer">
        © 2026 InterviewPilot AI · Your personal AI interviewer.
      </div>

    </div>
  );
}

export default Register;