import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCode,
  FaArrowLeft,
  FaPlay,
  FaPaperPlane,
  FaRedo,
  FaCheckCircle,
} from "react-icons/fa";

import {
  generateCodingQuestion,
  runCodingCode,
  submitCodingSolution,
} from "../Services/CodingService";

import "./CodingRound.css";

function CodingRound() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    role,
    language,
    difficulty,
    topic,
  } = location.state || {};


  // ======================================================
  // STATE
  // ======================================================

  const [codingQuestion, setCodingQuestion] =
    useState(null);
  const [problemId, setProblemId] =
    useState(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [code, setCode] = useState("");

  const [result, setResult] = useState(null);

  const [isLoadingQuestion, setIsLoadingQuestion] =
    useState(true);

  const [isRunning, setIsRunning] =
    useState(false);


  // ======================================================
  // GENERATE CODING QUESTION
  // ======================================================

  useEffect(() => {

    async function loadCodingQuestion() {

      try {

        setIsLoadingQuestion(true);
        setResult(null);

        const question =
          await generateCodingQuestion({
            role,
            language,
            difficulty,
            topic,
          });

        setCodingQuestion(question);

        setProblemId(question.problemId);

        setCode(question.starterCode || "");

      } catch (error) {

        console.error(
          "Coding question generation error:",
          error
        );

        setResult({
          type: "error",
          message:
            error.message ||
            "Failed to generate coding question.",
        });

      } finally {

        setIsLoadingQuestion(false);

      }

    }


    if (
      role &&
      language &&
      difficulty &&
      topic
    ) {

      loadCodingQuestion();

    } else {

      setIsLoadingQuestion(false);

    }

  }, [
    role,
    language,
    difficulty,
    topic,
  ]);


  // ======================================================
  // NO ROLE
  // ======================================================

  if (!role) {

    return (

      <div className="coding-round-page">

        <div className="coding-round-error">

          <h2>
            Coding Round Not Configured
          </h2>

          <p>
            Please configure your coding round before
            starting the challenge.
          </p>

          <button
            onClick={() =>
              navigate("/coding-setup")
            }
          >
            <FaArrowLeft />
            Back to Coding Setup
          </button>

        </div>

      </div>

    );

  }


  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (isLoadingQuestion) {

    return (

      <div className="coding-round-page">

        <div className="coding-round-error">

          <div className="coding-brand-icon">
            <FaCode />
          </div>

          <h2>
            Preparing Your Coding Challenge
          </h2>

          <p>
            InterviewPilot AI is generating a
            {difficulty.toLowerCase()} {topic.toLowerCase()}
            problem for you...
          </p>

          <div className="coding-loading">
            Generating problem...
          </div>

        </div>

      </div>

    );

  }


  // ======================================================
  // RESET CODE
  // ======================================================

  function resetCode() {

    setCode(
      codingQuestion?.starterCode || ""
    );

    setResult(null);

  }


  // ======================================================
  // RUN CODE
  // ======================================================


  async function runCode() {

    if (!problemId) {

      setResult({
        type: "error",
        message:
          "Coding problem is not ready yet.",
      });

      return;
    }


    if (!code.trim()) {

      setResult({
        type: "error",
        message:
          "Please write some code first.",
      });

      return;
    }


    try {

      setIsRunning(true);

      setResult(null);


      const data =
        await runCodingCode({
          problemId,
          code,
        });


      setResult(data);


    } catch (error) {

      console.error(
        "Run code error:",
        error
      );


      setResult({

        type: "error",

        message:
          error.message ||
          "Code execution failed.",

      });

    } finally {

      setIsRunning(false);

    }
  }

  // ======================================================
  // SUBMIT SOLUTION
  // ======================================================
  async function submitSolution() {
    if (!problemId || isSubmitted) return;

    try {
      setIsRunning(true);
      setResult(null);

      const data = await submitCodingSolution({
        problemId,
        code,
      });

      console.log("🔥 CODING SUBMISSION RESULT:", data);

      setResult(data);
      setIsSubmitted(true);

      navigate("/coding-results", {
        state: {
          role,
          language,
          difficulty,
          topic,
          result: data,
          code,
          problem: codingQuestion,
        },
      });

    } catch (error) {
      console.error("Submit coding error:", error);

      setResult({
        type: "error",
        message:
          error.message || "Code submission failed.",
      });
    } finally {
      setIsRunning(false);
    }
  }
  // ======================================================
  // MAIN UI
  // ======================================================

  return (

    <div className="coding-round-page">


      {/* ==================================================
          TOP BAR
      ================================================== */}

      <header className="coding-topbar">

        <div className="coding-brand">

          <div className="coding-brand-icon">
            <FaCode />
          </div>

          <div>

            <span>
              INTERVIEWPILOT AI
            </span>

            <h1>
              Coding Round
            </h1>

          </div>

        </div>


        <button
          className="coding-back-button"
          onClick={() =>
            navigate("/coding-setup")
          }
        >
          <FaArrowLeft />
          Setup
        </button>

      </header>


      {/* ==================================================
          ROUND INFORMATION
      ================================================== */}

      <section className="coding-meta">

        <div className="meta-item">

          <span>
            ROLE
          </span>

          <strong>
            {role}
          </strong>

        </div>


        <div className="meta-item">

          <span>
            LANGUAGE
          </span>

          <strong>
            {language}
          </strong>

        </div>


        <div className="meta-item">

          <span>
            DIFFICULTY
          </span>

          <strong>
            {difficulty}
          </strong>

        </div>


        <div className="meta-item">

          <span>
            FOCUS
          </span>

          <strong>
            {topic}
          </strong>

        </div>

      </section>


      {/* ==================================================
          MAIN WORKSPACE
      ================================================== */}

      <main className="coding-workspace">


        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <section className="problem-panel">

          <div className="problem-heading">

            <span className="problem-label">
              PROBLEM 01
            </span>

            <span className="difficulty-label">
              {codingQuestion?.difficulty}
            </span>

          </div>


          <h2>
            {codingQuestion?.title}
          </h2>


          <p>
            {codingQuestion?.description}
          </p>


          {/* ============================
              EXAMPLES
          ============================ */}

          <div className="problem-section">

            <h3>
              Examples
            </h3>


            {codingQuestion?.examples?.map(
              (example, index) => (

                <div
                  className="example-box"
                  key={index}
                >

                  <div>

                    <span>
                      Input
                    </span>

                    <code>
                      {example.input}
                    </code>

                  </div>


                  <div>

                    <span>
                      Output
                    </span>

                    <code>
                      {example.output}
                    </code>

                  </div>


                  <p>
                    {example.explanation}
                  </p>

                </div>

              )
            )}

          </div>


          {/* ============================
              CONSTRAINTS
          ============================ */}

          <div className="problem-section">

            <h3>
              Constraints
            </h3>


            <ul>

              {codingQuestion?.constraints?.map(
                (constraint, index) => (

                  <li key={index}>
                    {constraint}
                  </li>

                )
              )}

            </ul>

          </div>


          {/* ============================
              EVALUATION
          ============================ */}

          <div className="problem-section">

            <h3>
              What we're evaluating
            </h3>


            <div className="evaluation-tags">

              <span>
                Correctness
              </span>

              <span>
                Logic
              </span>

              <span>
                Efficiency
              </span>

              <span>
                Code Quality
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <section className="editor-panel">


          <div className="editor-topbar">

            <div className="editor-language">

              <span className="language-dot"></span>

              {language}

            </div>


            <button
              className="reset-button"
              onClick={resetCode}
            >

              <FaRedo />

              Reset

            </button>

          </div>


          {/* ============================
              CODE EDITOR
          ============================ */}

          <div className="editor-area">

            <div className="line-numbers">

              {code
                .split("\n")
                .map((_, index) => (

                  <span key={index}>
                    {index + 1}
                  </span>

                ))}

            </div>


            <textarea
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              spellCheck="false"
              className="code-editor"
            />

          </div>


          {/* ============================
              RESULT
          ============================ */}

          {result && (

            <div className="test-result">

              <div className="result-icon">
                <FaCheckCircle />
              </div>


              <div>

                {result.total > 0 && (

                  <strong>
                    {result.passed}/
                    {result.total}
                    {" "}
                    Test Cases Passed
                  </strong>

                )}


                {result && (
                  <div className="coding-result">

                    {result.type === "error" ? (

                      <div className="result-error">

                        <h3>
                          Execution Error
                        </h3>

                        <p>
                          {result.message}
                        </p>

                      </div>

                    ) : (

                      <>

                        <div className="result-summary">

                          <FaCheckCircle />

                          <div>

                            <h3>
                              {result.type === "submit"
                                ? "Submission Result"
                                : "Run Result"}
                            </h3>

                            <p>
                              {result.passed} / {result.total} test cases passed
                            </p>

                            {result.type === "submit" && (
                              <strong>
                                Score: {result.score}/100
                              </strong>
                            )}

                          </div>

                        </div>


                        <div className="test-results">

                          {result.results?.map(
                            (test, index) => (

                              <div
                                className="test-result"
                                key={index}
                              >

                                <span>
                                  Test Case {index + 1}
                                </span>

                                <span>
                                  {test.passed
                                    ? "Passed ✓"
                                    : "Failed ✕"}
                                </span>

                                {!test.passed &&
                                  test.error && (
                                    <pre>
                                      {test.error}
                                    </pre>
                                  )}

                              </div>

                            )
                          )}

                        </div>

                      </>

                    )}

                  </div>
                )}
              </div>

            </div>

          )}


          {/* ============================
    ACTION BAR
============================ */}

          <div className="editor-action-bar">

            <button
              className="run-code-button"
              onClick={runCode}
              disabled={isRunning || isSubmitted}
            >
              <FaPlay />

              {isRunning
                ? "Running..."
                : "Run Code"}
            </button>

            <button
              className="submit-code-button"
              onClick={submitSolution}
              disabled={isRunning || isSubmitted}
            >
              {isSubmitted
                ? "Solution Submitted"
                : isRunning
                  ? "Submitting..."
                  : "Submit Solution"}

              {!isSubmitted && !isRunning && (
                <FaPaperPlane />
              )}
            </button>

          </div>
        </section>
      </main>
    </div>
  );
}
export default CodingRound;