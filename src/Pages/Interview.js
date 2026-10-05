import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";

import {
    getInterviewQuestion,
    evaluateInterviewAnswer,
} from "../Services/InterviewService";

import {
    FaceLandmarker,
    FilesetResolver,
} from "@mediapipe/tasks-vision";

import "./Interview.css";

function Interview() {
    const location = useLocation();
    const navigate = useNavigate();

    const { role, difficulty, type } = location.state || {};

    const [answer, setAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [interviewResults, setInterviewResults] = useState([]);
    const [evaluationError, setEvaluationError] = useState("");

    const [questionNumber, setQuestionNumber] = useState(1);
    const totalQuestions = 5;

    const [question, setQuestion] = useState("");
    const [loadingQuestion, setLoadingQuestion] = useState(true);
    const [questionError, setQuestionError] = useState("");

    // ==========================================
    // VOICE INTERVIEW STATE
    // ==========================================

    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(true);

    const recognitionRef = useRef(null);

    // ==========================================
    // WEBCAM / INTEGRITY STATE
    // ==========================================

    const videoRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const faceLandmarkerRef = useRef(null);
    const faceAnimationRef = useRef(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState("");

    const [faceCount, setFaceCount] = useState(0);
    const [faceStatus, setFaceStatus] = useState(
        "Checking camera..."
    );

    const [headDirection, setHeadDirection] = useState("Center");

    const [tabSwitches, setTabSwitches] = useState(0);
    const tabSwitchCountRef = useRef(0);

    const [integrityWarning, setIntegrityWarning] = useState("");
    const [interviewTerminated, setInterviewTerminated] =
        useState(false);

    const headTurnStartedRef = useRef(null);
    const headWarningCooldownRef = useRef(false);

    // ==========================================
    // INITIALIZE SPEECH RECOGNITION
    // ==========================================

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setVoiceSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            let finalTranscript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const transcript =
                    event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                }
            }

            if (finalTranscript) {
                setAnswer((prev) => {
                    const separator =
                        prev.trim() === "" ? "" : " ";

                    return (
                        prev +
                        separator +
                        finalTranscript.trim()
                    );
                });
            }
        };

        recognition.onerror = (event) => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            setIsListening(false);

            if (event.error === "not-allowed") {
                alert(
                    "Microphone permission was denied. Please allow microphone access to use voice interview."
                );
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch (error) {
                console.log("Recognition already stopped.");
            }

            recognitionRef.current = null;
        };
    }, []);

    // ==========================================
    // START VOICE
    // ==========================================

    function startListening() {
        if (
            !recognitionRef.current ||
            submitted ||
            evaluating ||
            interviewTerminated ||
            document.visibilityState !== "visible"
        ) {
            return;
        }

        try {
            recognitionRef.current.start();
        } catch (error) {
            console.error(
                "Unable to start speech recognition:",
                error
            );
        }
    }

    // ==========================================
    // STOP VOICE
    // ==========================================

    function stopListening() {
        if (!recognitionRef.current) {
            return;
        }

        try {
            recognitionRef.current.stop();
        } catch (error) {
            console.error(
                "Unable to stop speech recognition:",
                error
            );
        }
    }

    // ==========================================
    // START WEBCAM
    // ==========================================

    useEffect(() => {
        let mounted = true;

        async function startCamera() {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error(
                        "Camera access is not supported by this browser."
                    );
                }

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: {
                                ideal: 640,
                            },
                            height: {
                                ideal: 480,
                            },
                            facingMode: "user",
                        },
                        audio: false,
                    });

                if (!mounted) {
                    stream
                        .getTracks()
                        .forEach((track) => track.stop());

                    return;
                }

                cameraStreamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    await videoRef.current.play();

                    setCameraReady(true);
                    setCameraError("");
                }
            } catch (error) {
                console.error(
                    "Unable to access webcam:",
                    error
                );

                if (mounted) {
                    setCameraError(
                        "Camera access is required for interview monitoring. Please allow camera permission and refresh the page."
                    );
                }
            }
        }

        startCamera();

        return () => {
            mounted = false;

            if (cameraStreamRef.current) {
                cameraStreamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());

                cameraStreamRef.current = null;
            }
        };
    }, []);

    // ==========================================
    // INITIALIZE FACE LANDMARKER
    // ==========================================

    useEffect(() => {
        let cancelled = false;

        async function initializeFaceLandmarker() {
            try {
                const vision =
                    await FilesetResolver.forVisionTasks(
                        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
                    );

                const faceLandmarker =
                    await FaceLandmarker.createFromOptions(
                        vision,
                        {
                            baseOptions: {
                                modelAssetPath:
                                    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                            },

                            runningMode: "VIDEO",

                            numFaces: 2,

                            minFaceDetectionConfidence: 0.5,
                            minFacePresenceConfidence: 0.5,
                            minTrackingConfidence: 0.5,
                        }
                    );

                if (cancelled) {
                    faceLandmarker.close();
                    return;
                }

                faceLandmarkerRef.current =
                    faceLandmarker;
            } catch (error) {
                console.error(
                    "Failed to initialize face monitoring:",
                    error
                );
            }
        }

        initializeFaceLandmarker();

        return () => {
            cancelled = true;

            if (faceAnimationRef.current) {
                cancelAnimationFrame(
                    faceAnimationRef.current
                );
            }

            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close();
                faceLandmarkerRef.current = null;
            }
        };
    }, []);

    // ==========================================
    // HEAD DIRECTION ESTIMATION
    // ==========================================

    function detectHeadDirection(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return "Unknown";
        }

        /*
         * Approximate head direction using facial landmarks.
         *
         * 1 = left eye outer region
         * 263 = right eye outer region
         * 1 = nose region
         *
         * This is intentionally treated as an integrity signal,
         * not a definitive "cheating" detector.
         */

        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const nose = landmarks[1];

        if (!leftEye || !rightEye || !nose) {
            return "Center";
        }

        const eyeCenterX =
            (leftEye.x + rightEye.x) / 2;

        const eyeWidth =
            Math.abs(rightEye.x - leftEye.x);

        if (eyeWidth === 0) {
            return "Center";
        }

        const horizontalOffset =
            (nose.x - eyeCenterX) / eyeWidth;

        if (horizontalOffset > 0.18) {
            return "Right";
        }

        if (horizontalOffset < -0.18) {
            return "Left";
        }

        return "Center";
    }

    // ==========================================
    // FACE MONITORING LOOP
    // ==========================================

    useEffect(() => {
        let mounted = true;

        function monitorFace() {
            if (
                !mounted ||
                interviewTerminated
            ) {
                return;
            }

            const video = videoRef.current;
            const landmarker =
                faceLandmarkerRef.current;

            if (
                video &&
                landmarker &&
                video.readyState >= 2 &&
                video.videoWidth > 0
            ) {
                try {
                    const now = performance.now();

                    const result =
                        landmarker.detectForVideo(
                            video,
                            now
                        );

                    const faces =
                        result.faceLandmarks || [];

                    const count = faces.length;

                    setFaceCount(count);

                    if (count === 0) {
                        setFaceStatus(
                            "No face detected"
                        );

                        setHeadDirection("Unknown");

                        headTurnStartedRef.current =
                            null;
                    } else if (count > 1) {
                        setFaceStatus(
                            "Multiple faces detected"
                        );

                        setHeadDirection("Unknown");

                        headTurnStartedRef.current =
                            null;
                    } else {
                        setFaceStatus(
                            "Face detected"
                        );

                        const direction =
                            detectHeadDirection(
                                faces[0]
                            );

                        setHeadDirection(
                            direction
                        );

                        if (
                            direction === "Left" ||
                            direction === "Right"
                        ) {
                            if (
                                !headTurnStartedRef.current
                            ) {
                                headTurnStartedRef.current =
                                    Date.now();
                            }

                            const duration =
                                Date.now() -
                                headTurnStartedRef.current;

                            /*
                             * Only flag prolonged head turns.
                             * Normal conversational movement
                             * should not trigger this.
                             */
                            if (
                                duration >= 5000 &&
                                !headWarningCooldownRef.current
                            ) {
                                setIntegrityWarning(
                                    "You have been looking away from the camera for several seconds. Please face the screen."
                                );

                                headWarningCooldownRef.current =
                                    true;

                                setTimeout(() => {
                                    headWarningCooldownRef.current =
                                        false;
                                }, 5000);
                            }
                        } else {
                            headTurnStartedRef.current =
                                null;
                        }
                    }
                } catch (error) {
                    console.error(
                        "Face monitoring error:",
                        error
                    );
                }
            }

            faceAnimationRef.current =
                requestAnimationFrame(
                    monitorFace
                );
        }

        faceAnimationRef.current =
            requestAnimationFrame(
                monitorFace
            );

        return () => {
            mounted = false;

            if (faceAnimationRef.current) {
                cancelAnimationFrame(
                    faceAnimationRef.current
                );
            }
        };
    }, [interviewTerminated]);

    // ==========================================
    // TAB SWITCH / VISIBILITY MONITORING
    // ==========================================

    useEffect(() => {
        function handleVisibilityChange() {
            if (
                document.visibilityState !==
                "hidden"
            ) {
                return;
            }

            if (
                submitted ||
                evaluating ||
                loadingQuestion ||
                interviewTerminated
            ) {
                return;
            }

            const nextCount =
                tabSwitchCountRef.current + 1;

            tabSwitchCountRef.current =
                nextCount;

            setTabSwitches(nextCount);

            // Immediately stop voice interview
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (error) {
                    console.log(
                        "Recognition already stopped."
                    );
                }
            }

            setIsListening(false);

            if (nextCount === 1) {
                setIntegrityWarning(
                    "Interview paused because you left the InterviewPilot tab. Please return to continue."
                );
            }

            if (nextCount >= 2) {
                setInterviewTerminated(true);

                setIntegrityWarning(
                    "Interview ended because the interview tab was left more than once."
                );
            }
        }

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [
        submitted,
        evaluating,
        loadingQuestion,
        interviewTerminated,
    ]);

    // ==========================================
    // COPY / CUT / PASTE RESTRICTION
    // ==========================================

    useEffect(() => {
        function blockClipboard(event) {
            if (
                submitted ||
                evaluating ||
                interviewTerminated
            ) {
                return;
            }

            event.preventDefault();
        }

        function blockKeyboardPaste(event) {
            if (
                submitted ||
                evaluating ||
                interviewTerminated
            ) {
                return;
            }

            const key =
                event.key.toLowerCase();

            const modifier =
                event.ctrlKey ||
                event.metaKey;

            if (
                modifier &&
                ["c", "x", "v"].includes(key)
            ) {
                event.preventDefault();
            }
        }

        function blockContextMenu(event) {
            if (
                submitted ||
                evaluating ||
                interviewTerminated
            ) {
                return;
            }

            event.preventDefault();
        }

        document.addEventListener(
            "copy",
            blockClipboard
        );

        document.addEventListener(
            "cut",
            blockClipboard
        );

        document.addEventListener(
            "paste",
            blockClipboard
        );

        document.addEventListener(
            "keydown",
            blockKeyboardPaste
        );

        document.addEventListener(
            "contextmenu",
            blockContextMenu
        );

        return () => {
            document.removeEventListener(
                "copy",
                blockClipboard
            );

            document.removeEventListener(
                "cut",
                blockClipboard
            );

            document.removeEventListener(
                "paste",
                blockClipboard
            );

            document.removeEventListener(
                "keydown",
                blockKeyboardPaste
            );

            document.removeEventListener(
                "contextmenu",
                blockContextMenu
            );
        };
    }, [
        submitted,
        evaluating,
        interviewTerminated,
    ]);

    // ==========================================
    // SAVE COMPLETED INTERVIEW
    // ==========================================

    async function saveInterview(finalResults) {
        console.log(
            "🔥 SAVE INTERVIEW FUNCTION CALLED"
        );

        const user = auth.currentUser;

        if (!user) {
            throw new Error(
                "Please login first."
            );
        }

        const token =
            await user.getIdToken();

        console.log(
            "🔥 SENDING INTERVIEW TO BACKEND"
        );

        const response = await fetch(
            "http://localhost:5000/api/interview/save",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,
                },

                body: JSON.stringify({
                    role,
                    difficulty,
                    type,
                    questions: finalResults,

                    integrity: {
                        tabSwitches:
                            tabSwitchCountRef.current,
                    },
                }),
            }
        );

        const data =
            await response.json();

        console.log(
            "🔥 SAVE INTERVIEW RESPONSE:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to save interview."
            );
        }

        return data;
    }

    // ==========================================
    // LOAD INTERVIEW QUESTION
    // ==========================================

    useEffect(() => {
        let cancelled = false;

        async function loadQuestion() {
            try {
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.stop();
                    } catch (error) {
                        console.log(
                            "Recognition already stopped."
                        );
                    }
                }

                setIsListening(false);
                setLoadingQuestion(true);
                setQuestionError("");

                const data =
                    await getInterviewQuestion({
                        role,
                        difficulty,
                        type,
                    });

                if (cancelled) return;

                setQuestion(
                    data.data.question
                );

                setAnswer("");
                setSubmitted(false);
                setEvaluating(false);
                setEvaluation(null);
                setEvaluationError("");

            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Failed to load interview question:",
                    error
                );

                setQuestionError(
                    "Unable to generate the interview question. Please try again."
                );

            } finally {
                if (!cancelled) {
                    setLoadingQuestion(false);
                }
            }
        }

        loadQuestion();

        return () => {
            cancelled = true;
        };
    }, [
        role,
        difficulty,
        type,
        questionNumber,
    ]);

    // ==========================================
    // SUBMIT ANSWER
    // ==========================================

    async function submitAnswer() {
        if (
            submitted ||
            evaluating ||
            interviewTerminated
        ) {
            return;
        }

        if (isListening) {
            stopListening();
        }

        if (answer.trim() === "") {
            alert(
                "Please type or speak your answer."
            );
            return;
        }

        try {
            setEvaluating(true);
            setEvaluationError("");

            console.log(
                "Submitting answer..."
            );

            console.log(
                "Question:",
                question
            );

            console.log(
                "Answer:",
                answer
            );

            const data =
                await evaluateInterviewAnswer({
                    role,
                    difficulty,
                    type,
                    question,
                    answer,
                });

            console.log(
                "FULL EVALUATION RESPONSE:",
                data
            );

            const currentEvaluation =
                data.data;

            setEvaluation(
                currentEvaluation
            );

            setSubmitted(true);

            setInterviewResults(
                (prev) => [
                    ...prev,
                    {
                        questionNumber,
                        question,
                        answer,
                        evaluation:
                            currentEvaluation,
                    },
                ]
            );

        } catch (error) {
            console.error(
                "EVALUATION FAILED:",
                error
            );

            setEvaluationError(
                error.message ||
                "Unable to evaluate interview answer."
            );

        } finally {
            setEvaluating(false);
        }
    }

    // ==========================================
    // NEXT QUESTION / FINISH INTERVIEW
    // ==========================================

    async function nextQuestion() {
        if (
            !submitted ||
            loadingQuestion ||
            interviewTerminated
        ) {
            return;
        }

        if (
            questionNumber <
            totalQuestions
        ) {
            setLoadingQuestion(true);

            setQuestionNumber(
                (prev) => prev + 1
            );

            return;
        }

        console.log(
            "🔥 Q5 FINISHED, SAVING INTERVIEW"
        );

        try {
            setLoadingQuestion(true);

            const currentResult = {
                questionNumber,
                question,
                answer,
                evaluation,
            };

            const finalResults = [
                ...interviewResults.filter(
                    (item) =>
                        item.questionNumber !==
                        questionNumber
                ),
                currentResult,
            ];

            console.log(
                "🔥 FINAL INTERVIEW RESULTS:",
                finalResults
            );

            await saveInterview(
                finalResults
            );

            console.log(
                "✅ INTERVIEW SAVED SUCCESSFULLY"
            );

            navigate("/results", {
                state: {
                    role,
                    difficulty,
                    type,
                    results: finalResults,

                    integrity: {
                        tabSwitches:
                            tabSwitchCountRef.current,
                    },
                },
            });

        } catch (error) {
            console.error(
                "❌ FAILED TO SAVE INTERVIEW:",
                error
            );

            alert(
                error.message ||
                "Unable to save interview results."
            );

        } finally {
            setLoadingQuestion(false);
        }
    }

    // ==========================================
    // RETURN AFTER FIRST TAB SWITCH
    // ==========================================

    function resumeAfterWarning() {
        if (
            tabSwitches >= 2
        ) {
            return;
        }

        setIntegrityWarning("");
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div
            className="interview-page"
            onCopy={(e) =>
                e.preventDefault()
            }
            onCut={(e) =>
                e.preventDefault()
            }
            onPaste={(e) =>
                e.preventDefault()
            }
        >

            {/* INTEGRITY WARNING */}

            {integrityWarning && (
                <div className="integrity-warning-overlay">

                    <div className="integrity-warning-card">

                        <div className="integrity-warning-icon">
                            {tabSwitches >= 2
                                ? "🚫"
                                : "⚠️"}
                        </div>

                        <h2>
                            {tabSwitches >= 2
                                ? "Interview Ended"
                                : "Interview Paused"}
                        </h2>

                        <p>
                            {integrityWarning}
                        </p>

                        {tabSwitches >= 2 ? (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/dashboard"
                                    )
                                }
                            >
                                Return to Dashboard
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={
                                    resumeAfterWarning
                                }
                            >
                                Return to Interview
                            </button>
                        )}

                    </div>

                </div>
            )}

            {/* HEADER */}

            <header className="interview-header">

                <div>

                    <span className="interview-eyebrow">
                        INTERVIEWPILOT AI
                    </span>

                    <h1>
                        AI Interview
                    </h1>

                </div>

                <div className="question-counter">
                    Question{" "}
                    {questionNumber} of{" "}
                    {totalQuestions}
                </div>

            </header>

            {/* INTERVIEW INFO */}

            <section className="interview-info">

                <div>
                    <span>ROLE</span>
                    <strong>{role}</strong>
                </div>

                <div>
                    <span>DIFFICULTY</span>
                    <strong>
                        {difficulty}
                    </strong>
                </div>

                <div>
                    <span>TYPE</span>
                    <strong>{type}</strong>
                </div>

            </section>

            {/* PROGRESS */}

            <div className="progress-section">

                <div className="progress-label">

                    <span>
                        Interview Progress
                    </span>

                    <span>
                        {questionNumber}/
                        {totalQuestions}
                    </span>

                </div>

                <div className="progress-track">

                    <div
                        className="progress-bar"
                        style={{
                            width:
                                `${
                                    (
                                        questionNumber /
                                        totalQuestions
                                    ) * 100
                                }%`,
                        }}
                    />

                </div>

            </div>

            {/* INTERVIEW MONITOR */}

            <section className="interview-monitor">

                <div className="camera-card">

                    <div className="camera-header">

                        <div>
                            <span>
                                LIVE CAMERA
                            </span>

                            <strong>
                                Interview Monitoring
                            </strong>
                        </div>

                        <span
                            className={
                                cameraReady
                                    ? "camera-status online"
                                    : "camera-status"
                            }
                        >
                            {cameraReady
                                ? "● LIVE"
                                : "● OFF"}
                        </span>

                    </div>

                    <div className="camera-preview">

                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                        />

                        {!cameraReady && (
                            <div className="camera-placeholder">

                                <span>
                                    🎥
                                </span>

                                <p>
                                    {cameraError ||
                                        "Starting camera..."}
                                </p>

                            </div>
                        )}

                    </div>

                    <div className="camera-metrics">

                        <div>
                            <span>
                                FACE
                            </span>

                            <strong>
                                {faceStatus}
                            </strong>
                        </div>

                        <div>
                            <span>
                                PEOPLE
                            </span>

                            <strong>
                                {faceCount}
                            </strong>
                        </div>

                        <div>
                            <span>
                                HEAD
                            </span>

                            <strong>
                                {headDirection}
                            </strong>
                        </div>

                        <div>
                            <span>
                                TAB SWITCHES
                            </span>

                            <strong>
                                {tabSwitches}
                            </strong>
                        </div>

                    </div>

                </div>

            </section>

            {/* QUESTION */}

            <main className="interview-content">

                <section className="question-card">

                    <span className="question-label">
                        QUESTION{" "}
                        {String(
                            questionNumber
                        ).padStart(2, "0")}
                    </span>

                    <h2>
                        {loadingQuestion
                            ? "Generating your interview question..."
                            : questionError
                                ? questionError
                                : question}
                    </h2>

                </section>

                {/* ANSWER */}

                <section className="answer-card">

                    <div className="answer-header">

                        <div>

                            <span className="question-label">
                                YOUR ANSWER
                            </span>

                            <p>
                                Speak your answer or
                                type it below.
                            </p>

                        </div>

                    </div>

                    {/* VOICE CONTROLS */}

                    {voiceSupported && (
                        <div className="voice-interview-box">

                            <div className="voice-interview-content">

                                <div
                                    className={`voice-mic-icon ${
                                        isListening
                                            ? "voice-listening"
                                            : ""
                                    }`}
                                >
                                    🎙️
                                </div>

                                <div>

                                    <strong>
                                        {isListening
                                            ? "Listening..."
                                            : "Voice Answer"}
                                    </strong>

                                    <span>
                                        {isListening
                                            ? "Speak clearly. Your answer will appear below."
                                            : "Use your microphone to answer this question."}
                                    </span>

                                </div>

                            </div>

                            <button
                                type="button"
                                className={`voice-button ${
                                    isListening
                                        ? "voice-stop-button"
                                        : ""
                                }`}
                                onClick={
                                    isListening
                                        ? stopListening
                                        : startListening
                                }
                                disabled={
                                    submitted ||
                                    evaluating ||
                                    loadingQuestion ||
                                    interviewTerminated ||
                                    tabSwitches >= 2
                                }
                            >
                                {isListening
                                    ? "⏹ Stop Speaking"
                                    : "🎙️ Start Speaking"}
                            </button>

                        </div>
                    )}

                    {/* ANSWER TEXT */}

                    <textarea
                        value={answer}
                        onChange={(e) =>
                            setAnswer(
                                e.target.value
                            )
                        }
                        placeholder={
                            voiceSupported
                                ? "Your spoken answer will appear here, or type your answer..."
                                : "Type your answer here..."
                        }
                        rows="8"
                        disabled={
                            submitted ||
                            evaluating ||
                            interviewTerminated
                        }
                    />

                    <div className="answer-footer">

                        <span>
                            Your answer will be
                            evaluated by AI.
                        </span>

                        <button
                            type="button"
                            onClick={
                                submitAnswer
                            }
                            disabled={
                                evaluating ||
                                submitted ||
                                loadingQuestion ||
                                interviewTerminated
                            }
                        >
                            {evaluating
                                ? "Evaluating..."
                                : submitted
                                    ? "Answer Submitted ✓"
                                    : "Submit Answer →"}
                        </button>

                    </div>

                </section>

                {/* EVALUATION ERROR */}

                {evaluationError && (
                    <section className="evaluation-card">

                        <span className="question-label">
                            EVALUATION ERROR
                        </span>

                        <h2>
                            {evaluationError}
                        </h2>

                    </section>
                )}

                {/* EVALUATION */}

                {evaluation && (
                    <section className="evaluation-card">

                        <span className="question-label">
                            AI EVALUATION
                        </span>

                        <h2>
                            Score:{" "}
                            {evaluation.score}/100
                        </h2>

                        <p>
                            {evaluation.feedback}
                        </p>

                        <h3>
                            Strengths
                        </h3>

                        <ul>
                            {evaluation.strengths?.map(
                                (
                                    strength,
                                    index
                                ) => (
                                    <li key={index}>
                                        {strength}
                                    </li>
                                )
                            )}
                        </ul>

                        <h3>
                            Areas to Improve
                        </h3>

                        <ul>
                            {evaluation.improvements?.map(
                                (
                                    improvement,
                                    index
                                ) => (
                                    <li key={index}>
                                        {improvement}
                                    </li>
                                )
                            )}
                        </ul>

                        <button
                            type="button"
                            onClick={
                                nextQuestion
                            }
                            disabled={
                                loadingQuestion
                            }
                        >
                            {loadingQuestion
                                ? "Saving..."
                                : questionNumber <
                                    totalQuestions
                                    ? "Next Question →"
                                    : "Finish Interview →"}
                        </button>

                    </section>
                )}

            </main>

        </div>
    );
}

export default Interview;