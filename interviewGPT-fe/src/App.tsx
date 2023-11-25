import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Application from './Application';
import MainPage from './MainPage';
import "tw-elements-react/dist/css/tw-elements-react.min.css";

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

          </Routes>
        </div>
      </Router>
    </main>
  );
}

export default App;
