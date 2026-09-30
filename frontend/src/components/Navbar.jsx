import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Terminal, User, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Code2 size={22} className="logo-svg" />
          </div>
          <span className="brand-text">Code<span className="brand-highlight">Judge</span></span>
        </Link>

        {/* Nav Links */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/problems" className={`nav-link ${isActive('/problems') ? 'active' : ''}`}>
            <Terminal size={16} />
            <span>Problems</span>
          </Link>
          <Link to="/arena" className={`nav-link ${isActive('/arena') ? 'active' : ''}`}>
            <Code2 size={16} />
            <span>1v1 Arena</span>
          </Link>
        </nav>

        {/* User Auth Section */}
        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-badge">
                <ShieldCheck size={16} className="user-icon" />
                <span className="username">{user?.username}</span>
                {user?.problemsSolved !== undefined && (
                  <span className="solved-pill">{user.problemsSolved} solved</span>
                )}
              </div>
              <button onClick={handleLogout} className="btn-icon-text text-muted" title="Logout">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">
                Log In
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
