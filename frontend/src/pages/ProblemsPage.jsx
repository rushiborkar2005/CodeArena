import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemService } from '../services';
import { Search, Terminal, CheckCircle2, ArrowRight, X, Code2 } from 'lucide-react';

export const ProblemsPage = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [selectedProblem, setSelectedProblem] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, [difficultyFilter]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (difficultyFilter !== 'ALL') {
        params.difficulty = difficultyFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }
      const data = await problemService.getProblems(params);
      const list = Array.isArray(data) ? data : (data?.problems || []);
      setProblems(list);
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  const handleSolve = (probId) => {
    navigate(`/problems/${probId}`);
  };

  const getDifficultyClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'diff-easy';
      case 'medium': return 'diff-medium';
      case 'hard': return 'diff-hard';
      default: return '';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="problems-header">
        <div>
          <h1 className="problems-title">Algorithm Problem Set</h1>
          <p className="problems-subtitle">Select a coding challenge to test your data structures & algorithms implementation.</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="controls-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search problems by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </form>

        <div className="filter-pills">
          {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`filter-pill ${difficultyFilter === diff ? 'active' : ''}`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      {loading ? (
        <div className="skeleton-loader">Loading problem set...</div>
      ) : problems.length === 0 ? (
        <div className="empty-state">
          <Terminal size={40} className="empty-icon" />
          <h3>No problems found</h3>
          <p>Try searching for a different keyword or clearing difficulty filters.</p>
        </div>
      ) : (
        <div className="problems-table-wrapper">
          <table className="problems-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Acceptance Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((prob) => (
                <tr key={prob.id} className="problem-row">
                  <td className="status-col">
                    <CheckCircle2 size={16} className="text-dim" />
                  </td>
                  <td className="title-col font-medium">
                    <button 
                      onClick={() => handleSolve(prob.id)}
                      className="problem-title-btn"
                    >
                      {prob.title}
                    </button>
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
                  <td>
                    <button 
                      onClick={() => handleSolve(prob.id)}
                      className="btn-solve"
                    >
                      <span>Solve</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Problem View Modal (Quick Preview) */}
      {selectedProblem && (
        <div className="modal-backdrop" onClick={() => setSelectedProblem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className={`diff-pill ${getDifficultyClass(selectedProblem.difficulty)}`}>
                  {selectedProblem.difficulty}
                </span>
                <h2>{selectedProblem.title}</h2>
              </div>
              <button onClick={() => setSelectedProblem(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="problem-category-badge">{selectedProblem.category}</div>
              
              <div className="problem-description">
                <h3>Description</h3>
                <p>{selectedProblem.description}</p>
              </div>

              <div className="sample-box">
                <h4>Sample Case</h4>
                <div className="sample-io">
                  <div><strong>Input:</strong> <code>{selectedProblem.sampleInput}</code></div>
                  <div><strong>Output:</strong> <code>{selectedProblem.sampleOutput}</code></div>
                </div>
              </div>

              {selectedProblem.constraints && (
                <div className="constraints-box">
                  <h4>Constraints</h4>
                  <ul>
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}><code>{c}</code></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-hero-primary" onClick={() => handleSolve(selectedProblem.id)}>
                <Code2 size={16} />
                <span>Open Code Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
