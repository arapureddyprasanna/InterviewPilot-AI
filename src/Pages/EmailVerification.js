import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  sendEmailVerification,
  reload,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import {
  FaEnvelope,
  FaCheckCircle,
  FaArrowRight,
  FaRedo,
} from "react-icons/fa";
import "./T4.css";

function EmailVerification() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/Login");
      return;
    }

    setEmail(user.email || "");
  }, [navigate]);

  async function handleResend() {
    const user = auth.currentUser;

    if (!user) {
      navigate("/Login");
      return;
    }

    try {
      setResending(true);
      setMessage("");

      await sendEmailVerification(user);

      setMessage(
        "Verification email sent again. Please check your inbox."
      );
    } catch (error) {
      console.error(error);

      if (error.code === "auth/too-many-requests") {
        setMessage(
          "Too many requests. Please wait a little before trying again."
        );
      } else {
        setMessage("Unable to send the email. Please try again.");
      }
    } finally {
      setResending(false);
    }
  }

  async function handleCheckVerification() {
    const user = auth.currentUser;

    if (!user) {
      navigate("/Login");
      return;
    }

    try {
      setChecking(true);
      setMessage("");

      await reload(user);

      if (auth.currentUser.emailVerified) {
        setMessage("Email verified successfully! Redirecting...");

        setTimeout(() => {
          navigate("/Dashboard");
        }, 800);
      } else {
        setMessage(
          "Your email is not verified yet. Please check your inbox and click the verification link."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to check verification status.");
    } finally {
      setChecking(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/Login");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="register-page">

      {/* TOP BAR */}

      <header className="register-topbar">

        <Link to="/" className="register-brand">
          <div className="register-brand-icon">
            <FaEnvelope />
          </div>

          <span>InterviewPilot</span>
        </Link>

        <div className="topbar-login">
          Wrong account?
          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              marginLeft: "6px",
              color: "#168f7a",
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Logout
          </button>
        </div>

      </header>


      {/* MAIN */}

      <main
        className="register-main"
        style={{
          gridTemplateColumns: "1fr",
          maxWidth: "900px",
          justifyItems: "center",
        }}
      >

        <section
          className="register-card"
          style={{
            justifySelf: "center",
            maxWidth: "560px",
            width: "100%",
            textAlign: "center",
          }}
        >

          {/* ICON */}

          <div
            className="register-card-icon"
            style={{
              margin: "0 auto 22px",
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              fontSize: "24px",
            }}
          >
            <FaEnvelope />
          </div>


          {/* TITLE */}

          <div>
            <span
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#19a98e",
                fontSize: "10px",
                fontWeight: 850,
                letterSpacing: "1.2px",
              }}
            >
              EMAIL VERIFICATION
            </span>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#172622",
              }}
            >
              Verify your email
            </h2>
          </div>


          {/* DESCRIPTION */}

          <p
            style={{
              margin: "18px auto 8px",
              maxWidth: "420px",
              color: "#6f807a",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          >
            We've sent a verification link to:
          </p>

          <p
            style={{
              margin: "0 auto 25px",
              color: "#168f7a",
              fontSize: "14px",
              fontWeight: 800,
              wordBreak: "break-word",
            }}
          >
            {email}
          </p>


          {/* INFO BOX */}

          <div
            style={{
              padding: "15px 18px",
              marginBottom: "22px",
              borderRadius: "12px",
              background: "#f3faf7",
              border: "1px solid #dceee8",
              color: "#61736e",
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            Check your inbox and click the verification link.
            If you don't see it, check your spam or junk folder.
          </div>


          {/* CHECK BUTTON */}

          <button
            type="button"
            className="register-submit-button"
            onClick={handleCheckVerification}
            disabled={checking}
          >
            {checking ? "Checking..." : "I've verified my email"}
            <FaCheckCircle />
          </button>


          {/* RESEND */}

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{
              width: "100%",
              height: "46px",
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              border: "1px solid #dce6e2",
              borderRadius: "11px",
              background: "#ffffff",
              color: "#168f7a",
              fontSize: "12px",
              fontWeight: 800,
              fontFamily: "inherit",
              cursor: resending ? "default" : "pointer",
            }}
          >
            <FaRedo />
            {resending ? "Sending..." : "Resend verification email"}
          </button>


          {/* MESSAGE */}

          {message && (
            <p
              style={{
                margin: "17px 0 0",
                color: "#6f807a",
                fontSize: "11px",
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          )}


          {/* LOGIN */}

          <div className="register-divider">
            <span>SECURE ACCOUNT VERIFICATION</span>
          </div>

          <p className="register-login-text">
            Already verified?
            <Link to="/Login">
              Login here
            </Link>
          </p>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="register-footer">
        © 2026 InterviewPilot AI · Your personal AI interviewer.
      </footer>

    </div>
  );
}

export default EmailVerification;