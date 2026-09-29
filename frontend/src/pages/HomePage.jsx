import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../services';
import { Terminal, Cpu, Trophy, ArrowRight, CheckCircle2, Sparkles, Code2 } from 'lucide-react';

export const HomePage = () => {
  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await problemService.getProblems();
        setFeaturedProblems(data.problems?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to load featured problems:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const getDifficultyClass = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'diff-easy';
      case 'medium': return 'diff-medium';
      case 'hard': return 'diff-hard';
      default: return '';
    }
  };

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>Next-Generation Competitive Coding Platform</span>
        </div>
        <h1 className="hero-title">
          Hone your algorithmic precision with <span className="text-gradient">CodeJudge</span>.
        </h1>
        <p className="hero-description">
          A minimalist Online Judge engineered for developers preparing for technical interviews, 
          competitive algorithms, and data structure mastery.
        </p>

        <div className="hero-actions">
          <Link to="/problems" className="btn-hero-primary">
            <span>Explore Problem Set</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/signup" className="btn-hero-secondary">
            <span>Create Free Account</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Terminal size={20} /></div>
            <div className="stat-value">500+</div>
            <div className="stat-label">Algorithmic Problems</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Cpu size={20} /></div>
            <div className="stat-value">&lt; 50ms</div>
            <div className="stat-label">Execution Latency</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Trophy size={20} /></div>
            <div className="stat-value">25,000+</div>
            <div className="stat-label">Active Developers</div>
          </div>
        </div>
      </section>

      {/* Featured Problems Section */}
      <section className="featured-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Challenges</h2>
            <p className="section-subtitle">Hand-picked curated problems to jumpstart your daily practice.</p>
          </div>
          <Link to="/problems" className="view-all-link">
            <span>View All Problems</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="skeleton-loader">Loading challenge set...</div>
        ) : (
          <div className="problems-table-wrapper">
            <table className="problems-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {featuredProblems.map((prob) => (
                  <tr key={prob.id} className="problem-row">
                    <td className="status-col">
                      <CheckCircle2 size={16} className="text-dim" />
                    </td>
                    <td className="title-col">
                      <Link to={`/problems/${prob.id}`} className="problem-link">
                        {prob.title}
                      </Link>
                    </td>
                    <td className="category-col">
                      <span className="category-tag">{prob.category}</span>
                    </td>
                    <td className="difficulty-col">
                      <span className={`diff-pill ${getDifficultyClass(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="acceptance-col">{prob.acceptanceRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Features Banner */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <Code2 size={24} className="feature-icon" />
            <h3>Multi-Language Judge</h3>
            <p>Support for C, C++, and Java with isolated sandbox execution environments.</p>
          </div>
          <div className="feature-card">
            <Cpu size={24} className="feature-icon" />
            <h3>Detailed Runtime Analysis</h3>
            <p>Get exact execution times, memory overhead profiling, and comprehensive test case breakdowns.</p>
          </div>
          <div className="feature-card">
            <Trophy size={24} className="feature-icon" />
            <h3>Global Leaderboards</h3>
            <p>Compare performance against top competitive programmers across speed, efficiency, and consistency.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
