import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "../firebase";
import { getMyInterviews } from "../Services/InterviewService";
import { getCodingHistory } from "../Services/CodingService";

import {
    FaArrowLeft,
    FaRobot,
    FaCode,
    FaClock,
    FaBolt,
} from "react-icons/fa";

import "./Activity.css";


function Activity() {
    const navigate = useNavigate();

    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {

                if (!user) {
                    navigate("/login");
                    return;
                }

                try {
                    setLoading(true);

                    const [
                        interviewData,
                        codingData,
                    ] = await Promise.all([
                        getMyInterviews(),
                        getCodingHistory(),
                    ]);
                  

                    const interviews =
                        Array.isArray(interviewData)
                            ? interviewData
                            : interviewData?.data || [];


                    const codingAttempts =
                        Array.isArray(codingData)
                            ? codingData
                            : codingData?.attempts ||
                            codingData?.history ||
                            [];


                    const interviewActivity =
                        interviews.map((item) => ({
                            id: `interview-${item._id}`,
                            type: "interview",

                            title:
                                item.role ||
                                "AI Interview",

                            category:
                                item.type ||
                                "Technical Interview",

                            difficulty:
                                item.difficulty,

                            subtitle:
                                `${item.questions?.length || 0} questions`,

                            score:
                                Math.round(item.overallScore || 0),

                            date:
                                item.createdAt ||
                                item.date,
                        }));


                    const codingActivity =
                        codingAttempts.map((item) => ({
                            id: `coding-${item._id}`,

                            type: "coding",

                            title:
                                item.problemTitle ||
                                item.title ||
                                "Coding Challenge",

                            category:
                                item.topic ||
                                "Coding",

                            difficulty:
                                item.difficulty,

                            subtitle:
                                item.language ||
                                "Coding Round",

                            score:
                                Math.round(
                                    item.score || 0
                                ),

                            date:
                                item.createdAt ||
                                item.date,
                        }));


                    const combined = [
                        ...interviewActivity,
                        ...codingActivity,
                    ]
                        .sort(
                            (a, b) =>
                                new Date(b.date) -
                                new Date(a.date)
                        );


                    setActivity(combined);

                } catch (error) {

                    console.error(
                        "Activity loading error:",
                        error
                    );

                    setActivity([]);

                } finally {
                    setLoading(false);
                }
            }
        );


        return () => unsubscribe();

    }, [navigate]);


    function formatDate(date) {
        if (!date) return "Unknown date";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }


    function formatTime(date) {
        if (!date) return "";

        return new Date(date).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    }


    return (
        <div className="activity-page">

            {/* TOP BAR */}

            <div className="activity-topbar">

                <button
                    className="activity-back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    <FaArrowLeft />
                    Back to Dashboard
                </button>

                <div className="activity-heading">

                    <span className="activity-eyebrow">
                        ACTIVITY CENTER
                    </span>

                    <h1>
                        Overall Activity
                    </h1>

                    <p>
                        Your complete interview and coding
                        practice history in one place.
                    </p>

                </div>

            </div>


            {/* CONTENT */}

            <main className="activity-content">

                {loading && (
                    <div className="activity-state">

                        <div className="activity-spinner"></div>

                        <p>
                            Loading your activity...
                        </p>

                    </div>
                )}


                {!loading &&
                    activity.length === 0 && (
                        <div className="activity-state empty">

                            <div className="activity-empty-icon">
                                <FaBolt />
                            </div>

                            <h2>
                                No activity yet
                            </h2>

                            <p>
                                Complete an AI interview or coding
                                round and your activity will appear here.
                            </p>

                            <button
                                className="activity-practice-button"
                                onClick={() =>
                                    navigate("/InterviewSetup")
                                }
                            >
                                Start Practicing
                            </button>

                        </div>
                    )}


                {!loading &&
                    activity.length > 0 && (

                        <div className="activity-list">

                            {activity.map((item) => {

                                const isCoding =
                                    item.type === "coding";


                                return (
                                    <div
                                        className={`activity-card ${isCoding
                                                ? "coding-activity"
                                                : "interview-activity"
                                            }`}
                                        key={item.id}
                                    >

                                        <div className="activity-left">

                                            <div
                                                className={`activity-icon ${isCoding
                                                        ? "coding-icon"
                                                        : "interview-icon"
                                                    }`}
                                            >
                                                {isCoding ? (
                                                    <FaCode />
                                                ) : (
                                                    <FaRobot />
                                                )}
                                            </div>


                                            <div className="activity-details">

                                                <h3>
                                                    {item.title}
                                                </h3>

                                                <div className="activity-meta">

                                                    <span>
                                                        {item.category}
                                                    </span>

                                                    {item.difficulty && (
                                                        <span>
                                                            {item.difficulty}
                                                        </span>
                                                    )}

                                                    {item.subtitle && (
                                                        <span>
                                                            {item.subtitle}
                                                        </span>
                                                    )}

                                                </div>


                                                <div className="activity-date">

                                                    <FaClock />

                                                    <span>
                                                        {formatDate(item.date)}
                                                    </span>

                                                    {item.date && (
                                                        <span>
                                                            •
                                                        </span>
                                                    )}

                                                    <span>
                                                        {formatTime(item.date)}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="activity-score">

                                            <div className="activity-score-circle">

                                                <strong>
                                                    {item.score}
                                                </strong>

                                                <span>
                                                    /100
                                                </span>

                                            </div>

                                            <small>
                                                {isCoding
                                                    ? "Coding Score"
                                                    : "Interview Score"}
                                            </small>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

            </main>

        </div>
    );
}


export default Activity;