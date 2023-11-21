
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home';
import Application from './Application';




function App() {
  return (
    <main>
      <Router>
        <div>
          {/* <Header /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app" element={<Application />} />
          </Routes>
        </div>
      </Router>
    </main>
  );
}

export default App;
