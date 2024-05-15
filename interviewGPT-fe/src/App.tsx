import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Application from "./Application";
import MainPage from "./MainPage";
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import Register from "./Register";
import Login from "./Login";
import Sample from "./components/Test/Sample";
import ForgetPass from "./ForgetPass";
import Dashboard from "./components/Dashboard";
import OnlineCode from "./components/OnlineComp/OnlineCode";
import AudioRecorder from "./components/AudioQuestions/AudioRecorder";
import RespJdDash from "./components/RespJdDash";
import InstructionPage from "./components/OnlineComp/Intruction";
import IntroScreen from "./components/OnlineComp/OnlineCode";
import McqComp from "./components/McqComp/McqComp";
// import Audio from "./components/Test/VideoRecorder";
import Mcq from "./components/McqComp/Mcq";
import Code from "./components/OnlineComp/Code";
import MainAssessment from "./components/MainAssessment";
import Success from "./components/OnlineComp/Sucess";

function App() {
  return (
    <main>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app" element={<Application />} />
            <Route path="/app-submit" element={<MainPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forget-password" element={<ForgetPass />} />
            <Route path="/test" element={<Sample />} />
            <Route path="/mcq" element={<McqComp />} />
            <Route path="/online-assess" element={<IntroScreen />} />
            <Route path="/instruction" element={<InstructionPage />} />
            <Route path="/success" element={<Success />} />
            <Route path="/mcq-main" element={<Mcq />} />
            <Route path="/code" element={<Code />} />
            <Route path="/respective-dashboard/:id" element={<RespJdDash />} />
            <Route path="/assess-main" element={<MainAssessment />}>
              <Route path="audio-ques" element={<Sample />} />
              <Route path="mcq-main" element={<Mcq />} />
              <Route path="code" element={<Code />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </main>
  );
}

export default App;
