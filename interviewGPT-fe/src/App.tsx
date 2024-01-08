import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Application from './Application';
import MainPage from './MainPage';
import "tw-elements-react/dist/css/tw-elements-react.min.css";
import Register from './Register';
import Login from './Login';
import ForgetPass from './ForgetPass';

function App() {
  return (
    <main>
      <Router>
        <div>
          {/* <Header /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app" element={<Application />} />
            <Route path="/app-submit" element={<MainPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forget-password" element={<ForgetPass />} />

          </Routes>
        </div>
      </Router>
    </main>
  );
}

export default App;
