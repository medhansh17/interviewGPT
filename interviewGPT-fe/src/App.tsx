import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Application from "./Application";
import MainPage from "./MainPage";
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import Register from "./Register";
import Login from "./Login";
import Sample from "./components/Test/Sample"
import ForgetPass from "./ForgetPass";
import Dashboard from "./components/Dashboard";
import OnlineCode from "./components/OnlineComp/OnlineCode";
import AudioRecorder from "./components/AudioQuestions/AudioRecorder";
import RespJdDash from "./components/RespJdDash";

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
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/forget-password" element={<ForgetPass />} />
            <Route path="/test" element={<Sample/>} />
            <Route path="online-code" element={<OnlineCode/>}/>
            <Route path="/online-audio-assesment" element={<AudioRecorder/>}/>
            <Route path="/respective-dashboard" element={<RespJdDash/>}/>
          </Routes>
        </div>
      </Router>
    </main>
  );
}

export default App;
