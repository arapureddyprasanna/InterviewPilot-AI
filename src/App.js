import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Interview from "./Pages/Interview";
import InterviewSetup from "./Pages/InterviewSetup";
import ResumeAnalysis from "./Pages/ResumeAnalysis";
import Results from "./Pages/Results";
import InterviewHistory from "./Pages/interviewHistory";
import Progress from "./Pages/Progress";
import InterviewReport from "./Pages/InterviewReport";
import CodingSetup from "./Pages/codingSetup";
import CodingRound from "./Pages/CodingRound";
import CodingResults from "./Pages/CodingResults";
import CodingHistory from "./Pages/CodingHistory";
import Activity from "./Pages/Activity";
import EmailVerification from "./Pages/EmailVerification";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/InterviewSetup"
          element={<InterviewSetup />}
        />
        <Route
          path="/Interview"
          element={<Interview />}
        />
        <Route
          path="/resume-analysis"
          element={<ResumeAnalysis />}
        />
        <Route
          path="/results"
          element={<Results />}
        />

        <Route
          path="/interview-history"
          element={<InterviewHistory />}
        />
        <Route
          path="/progress"
          element={<Progress />}
        />
        <Route
          path="/interview-report/:id"
          element={<InterviewReport />}
        />
        <Route
          path="/coding-setup"
          element={<CodingSetup />}
        />
        <Route
          path="/coding-round"
          element={<CodingRound />}
        />
        <Route
          path="/coding-results"
          element={<CodingResults />}
        />
        <Route
          path="/coding-history"
          element={<CodingHistory />}
        />
        <Route
          path="/activity"
          element={<Activity />}
        />
        <Route path="/EmailVerification" element={<EmailVerification />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;