import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemSolverPage } from './pages/ProblemSolverPage';
import { ArenaSetupPage } from './pages/ArenaSetupPage';
import { ArenaSolverPage } from './pages/ArenaSolverPage';
import { BackendProvider, useBackendStatus } from './context/BackendContext';
import { AlertTriangle } from 'lucide-react';
import './index.css';

function AppLayout() {
  const location = useLocation();
  const isSolverPage = location.pathname.startsWith('/problems/') && location.pathname !== '/problems' || location.pathname.startsWith('/arena/');
  const { isOffline } = useBackendStatus();

  return (
    <div className="app-shell">
      {isOffline && (
        <div style={{ backgroundColor: '#fbbf24', color: '#000', padding: '10px', textAlign: 'center', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>Demo Mode: The live compiler backend for this academic project is currently offline to conserve AWS resources. UI exploration is enabled, but code execution is disabled.</span>
        </div>
      )}
      {!isSolverPage && <Navbar />}
      <main className={`app-main ${isSolverPage ? 'solver-active-main' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:id" element={<ProblemSolverPage />} />
          <Route path="/arena" element={<ArenaSetupPage />} />
          <Route path="/arena/:roomId" element={<ArenaSolverPage />} />
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
    <BackendProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </BackendProvider>
  );
}

export default App;
