import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemSolverPage } from './pages/ProblemSolverPage';
import './index.css';

function AppLayout() {
  const location = useLocation();
  const isSolverPage = location.pathname.startsWith('/problems/') && location.pathname !== '/problems';

  return (
    <div className="app-shell">
      {!isSolverPage && <Navbar />}
      <main className={`app-main ${isSolverPage ? 'solver-active-main' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:id" element={<ProblemSolverPage />} />
        </Routes>
      </main>
      {!isSolverPage && (
        <footer className="app-footer">
          <div className="footer-inner">
            <span>© {new Date().getFullYear()} CodeJudge Inc. Precision Competitive Programming Platform.</span>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
