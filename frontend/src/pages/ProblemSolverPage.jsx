import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemService } from '../services';
import { CodeEditor } from '../components/CodeEditor';
import { 
  ArrowLeft, Play, Send, RotateCcw, Clock, Pause, CheckCircle2, 
  XCircle, FileText, Lightbulb, History, Code2, Terminal,
  ChevronUp, ChevronDown, AlertCircle 
} from 'lucide-react';

export const ProblemSolverPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Problem state
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Workspace controls
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [activeLeftTab, setActiveLeftTab] = useState('description'); // description | editorial | submissions
  const [submissions, setSubmissions] = useState([]);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Bottom console state
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase'); // testcase | result
  const [testInput, setTestInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // AI Features State
  const [isFetchingAi, setIsFetchingAi] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalTitle, setAiModalTitle] = useState('');
  const [aiModalContent, setAiModalContent] = useState('');

  useEffect(() => {
    fetchProblemDetails();
  }, [id]);

  // Timer ticker
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const fetchProblemDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // If no id in params, fallback to prob-1
      const problemId = id || 'prob-1';
      const data = await problemService.getProblemById(problemId);
      setProblem(data);
      setSubmissions(data.submissions || []);
      setTestInput(data.sampleInput || '');
      
      // Set starter code for default language
      const initialCode = data.starterTemplates?.[language] || getDefaultStarter(language, data.title);
      setCode(initialCode);
      setIsTimerRunning(true);
    } catch (err) {
      console.error('Failed to load problem:', err);
      setError('Problem not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStarter = (lang, title) => {
    switch (lang) {
      case 'c':
        return `// Solution for ${title || 'Problem'} in C\n#include <stdio.h>\n#include <stdlib.h>\n\nvoid solve() {\n    // Write your code here\n}`;
      case 'cpp':
        return `// Solution for ${title || 'Problem'} in C++\n#include <iostream>\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your code here\n    }\n};`;
      case 'java':
        return `// Solution for ${title || 'Problem'} in Java\nclass Solution {\n    public void solve() {\n        // Write your code here\n    }\n};`;
      default:
        return `// Solution for ${title || 'Problem'}`;
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem && problem.starterTemplates && problem.starterTemplates[newLang]) {
      setCode(problem.starterTemplates[newLang]);
    } else if (problem) {
      setCode(getDefaultStarter(newLang, problem.title));
    }
  };

  const handleResetCode = () => {
    if (problem && problem.starterTemplates && problem.starterTemplates[language]) {
      setCode(problem.starterTemplates[language]);
    } else if (problem) {
      setCode(getDefaultStarter(language, problem.title));
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setConsoleOpen(true);
    setActiveConsoleTab('result');
    try {
      const res = await problemService.runCode(problem.id, {
        language,
        code,
        testInput
      });
      setExecutionResult({
        type: 'run',
        ...res
      });
    } catch (err) {
      console.error('Execution error:', err);
      setExecutionResult({
        type: 'run',
        status: 'Compilation Error',
        output: err.response?.data?.message || 'Error executing code',
        stdout: err.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setConsoleOpen(true);
    setActiveConsoleTab('result');
    try {
      const res = await problemService.submitCode(problem.id, {
        language,
        code
      });
      setExecutionResult({
        type: 'submit',
        ...res
      });

      // Refresh submissions list
      const updatedSub = [
        {
          id: res.submissionId || 'sub-' + Date.now(),
          timestamp: new Date().toISOString(),
          status: res.status,
          language: language.toUpperCase(),
          runtime: res.runtime,
          memory: res.memory,
          passCount: res.testcasesPassed
        },
        ...submissions
      ];
      setSubmissions(updatedSub);
    } catch (err) {
      console.error('Submission error:', err);
      setExecutionResult({
        type: 'submit',
        status: 'Error',
        message: err.response?.data?.message || 'Failed to submit code.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    if (!problem) return;
    setIsFetchingAi(true);
    setAiModalTitle('AI Hint');
    setAiModalContent('Thinking...');
    setShowAiModal(true);
    
    try {
      const hint = await problemService.getHint(problem.id, { code, language });
      setAiModalContent(hint);
    } catch (err) {
      setAiModalContent('Failed to generate hint.');
    } finally {
      setIsFetchingAi(false);
    }
  };

  const handleGetReview = async () => {
    if (!problem || !executionResult) return;
    setIsFetchingAi(true);
    setAiModalTitle('AI Code Review');
    setAiModalContent('Analyzing your code...');
    setShowAiModal(true);

    try {
      const review = await problemService.getReview(problem.id, { 
        code, 
        language, 
        status: executionResult.status,
        runtime: executionResult.runtime,
        memory: executionResult.memory
      });
      setAiModalContent(review);
    } catch (err) {
      setAiModalContent('Failed to generate code review.');
    } finally {
      setIsFetchingAi(false);
    }
  };

  const getDifficultyClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'diff-easy';
      case 'medium': return 'diff-medium';
      case 'hard': return 'diff-hard';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="solver-loading-screen">
        <div className="spinner"></div>
        <p>Loading code workspace...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <AlertCircle size={40} className="empty-icon text-red" />
          <h3>{error || 'Problem not found'}</h3>
          <button className="btn-primary" onClick={() => navigate('/problems')} style={{ marginTop: '1rem' }}>
            Back to Problem Set
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="solver-workspace">
      {/* Top Workspace Header Bar */}
      <header className="solver-topbar">
        <div className="topbar-left">
          <button onClick={() => navigate('/problems')} className="btn-back">
            <ArrowLeft size={16} />
            <span>Problems</span>
          </button>

          <div className="problem-title-header">
            <span className="prob-title">{problem.title}</span>
            <span className={`diff-pill ${getDifficultyClass(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="topbar-center">
          {/* Timer Tool */}
          <div className="timer-widget">
            <Clock size={14} className="timer-icon" />
            <span className="timer-display">{formatTimer(timerSeconds)}</span>
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)} 
              className="timer-btn"
              title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button 
              onClick={() => { setTimerSeconds(0); setIsTimerRunning(false); }} 
              className="timer-btn"
              title="Reset Timer"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        <div className="topbar-right">
          {/* Language Dropdown Selector */}
          <div className="language-selector-wrapper">
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="language-select"
            >
              <option value="c">C (GCC 12)</option>
              <option value="cpp">C++ 20</option>
              <option value="java">Java 17</option>
            </select>
          </div>

          <button onClick={handleResetCode} className="btn-icon-control" title="Reset starter code">
            <RotateCcw size={15} />
          </button>

          <button onClick={handleGetHint} disabled={isFetchingAi} className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
            <Lightbulb size={14} />
            <span>Hint</span>
          </button>

          {/* Action Buttons */}
          <button 
            onClick={handleRunCode} 
            disabled={isRunning || isSubmitting}
            className="btn-run"
          >
            <Play size={14} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button 
            onClick={handleSubmitCode} 
            disabled={isRunning || isSubmitting}
            className="btn-submit"
          >
            <Send size={14} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <div className="solver-main-container">
        {/* Left Pane: Problem Details & Tabs */}
        <div className="solver-pane left-pane">
          <div className="pane-tabs-header">
            <button 
              className={`pane-tab ${activeLeftTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('description')}
            >
              <FileText size={15} />
              <span>Description</span>
            </button>
            <button 
              className={`pane-tab ${activeLeftTab === 'editorial' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('editorial')}
            >
              <Lightbulb size={15} />
              <span>Editorial</span>
            </button>
            <button 
              className={`pane-tab ${activeLeftTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('submissions')}
            >
              <History size={15} />
              <span>Submissions ({submissions.length})</span>
            </button>
          </div>

          <div className="pane-content">
            {activeLeftTab === 'description' && (
              <div className="problem-details-wrapper">
                <div className="prob-header-meta">
                  <h1 className="prob-main-title">{problem.title}</h1>
                  <div className="prob-tags">
                    <span className={`diff-pill ${getDifficultyClass(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className="category-tag">{problem.category}</span>
                    <span className="meta-info">Acceptance: <strong>{problem.acceptanceRate}</strong></span>
                  </div>
                </div>

                <div className="prob-description-text">
                  <p>{problem.description}</p>
                </div>

                {/* Sample Case Box */}
                <div className="sample-case-container">
                  <div className="sample-case-title">Sample Case</div>
                  <div className="sample-case-block">
                    <div className="sample-row">
                      <span className="sample-label">Input:</span>
                      <code className="sample-code">{problem.sampleInput}</code>
                    </div>
                    <div className="sample-row">
                      <span className="sample-label">Output:</span>
                      <code className="sample-code">{problem.sampleOutput}</code>
                    </div>
                    {problem.explanation && (
                      <div className="sample-row explanation">
                        <span className="sample-label">Explanation:</span>
                        <span className="explanation-text">{problem.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Constraints Box */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="constraints-container">
                    <div className="constraints-title">Constraints</div>
                    <ul className="constraints-list">
                      {problem.constraints.map((c, i) => (
                        <li key={i}><code>{c}</code></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'editorial' && (
              <div className="editorial-wrapper">
                <h2>Editorial & Approach</h2>
                <div className="editorial-section">
                  <h3>Approach 1: Hash Map (Optimal)</h3>
                  <p>
                    Using a hash map allows us to store the complements of numbers we have already seen as we iterate through the input array. 
                    This reduces the time complexity from $O(N^2)$ to $O(N)$.
                  </p>
                  <div className="complexity-box">
                    <div><strong>Time Complexity:</strong> $O(N)$ - Single pass through the list.</div>
                    <div><strong>Space Complexity:</strong> $O(N)$ - Map storage for elements.</div>
                  </div>
                </div>
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div className="submissions-wrapper">
                <h2>Submission History</h2>
                {submissions.length === 0 ? (
                  <div className="empty-sub-state">
                    <History size={32} className="text-dim" />
                    <p>No submissions recorded for this problem yet.</p>
                  </div>
                ) : (
                  <div className="submissions-list">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="submission-item">
                        <div className="sub-status-line">
                          <span className={`sub-status ${sub.status === 'Accepted' ? 'pass' : 'fail'}`}>
                            {sub.status === 'Accepted' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            {sub.status}
                          </span>
                          <span className="sub-lang">{sub.language || 'JS'}</span>
                        </div>
                        <div className="sub-details">
                          <span>Runtime: <strong>{sub.runtime}</strong></span>
                          <span>Memory: <strong>{sub.memory}</strong></span>
                          <span className="sub-time">{new Date(sub.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor & Console Drawer */}
        <div className="solver-pane right-pane">
          {/* Top Panel: Code Editor */}
          <div className="editor-pane-inner">
            <CodeEditor 
              value={code} 
              onChange={setCode}
              language={language}
            />
          </div>

          {/* Bottom Drawer: Console & Testcase Panel */}
          <div className={`console-drawer ${consoleOpen ? 'expanded' : 'collapsed'}`}>
            <div className="console-drawer-header">
              <div className="console-tabs">
                <button 
                  className={`console-tab ${activeConsoleTab === 'testcase' ? 'active' : ''}`}
                  onClick={() => { setActiveConsoleTab('testcase'); setConsoleOpen(true); }}
                >
                  <Terminal size={14} />
                  <span>Testcase</span>
                </button>
                <button 
                  className={`console-tab ${activeConsoleTab === 'result' ? 'active' : ''}`}
                  onClick={() => { setActiveConsoleTab('result'); setConsoleOpen(true); }}
                >
                  <Code2 size={14} />
                  <span>Test Result {executionResult && `(${executionResult.status})`}</span>
                </button>
              </div>

              <button 
                onClick={() => setConsoleOpen(!consoleOpen)} 
                className="btn-toggle-console"
                title={consoleOpen ? 'Collapse console' : 'Expand console'}
              >
                {consoleOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            {consoleOpen && (
              <div className="console-drawer-body">
                {activeConsoleTab === 'testcase' && (
                  <div className="testcase-tab-content">
                    <label className="console-label">Sample Test Input:</label>
                    <textarea 
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      className="testcase-input"
                      rows={3}
                    />
                  </div>
                )}

                {activeConsoleTab === 'result' && (
                  <div className="test-result-content">
                    {!executionResult ? (
                      <div className="console-prompt">
                        <Play size={20} className="text-dim" />
                        <span>Run or Submit your code to view full evaluation test results.</span>
                      </div>
                    ) : (
                      <div className="result-details">
                        {/* Result Verdict Banner */}
                        <div className={`verdict-banner ${executionResult.status === 'Accepted' ? 'banner-pass' : 'banner-fail'}`}>
                          {executionResult.status === 'Accepted' ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <XCircle size={20} />
                          )}
                          <div className="verdict-text">
                            <h3>{executionResult.status}</h3>
                            <span>{executionResult.message || `Testcases: ${executionResult.testcasesPassed || '1 / 1'}`}</span>
                          </div>
                          
                          <button onClick={handleGetReview} disabled={isFetchingAi} className="btn-secondary" style={{marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', padding: '5px 10px'}}>
                            <Lightbulb size={14} style={{display: 'inline', marginRight: '5px', verticalAlign: 'middle'}}/>
                            AI Review
                          </button>
                        </div>

                        {/* Metrics Bar */}
                        <div className="metrics-row">
                          <div className="metric-pill">
                            <span className="metric-label">Runtime</span>
                            <span className="metric-value">{executionResult.runtime || '24 ms'}</span>
                          </div>
                          <div className="metric-pill">
                            <span className="metric-label">Memory</span>
                            <span className="metric-value">{executionResult.memory || '41.2 MB'}</span>
                          </div>
                        </div>

                        {/* Input / Output Display */}
                        {executionResult.input && (
                          <div className="io-result-box">
                            <div className="io-group">
                              <span className="io-title">Input:</span>
                              <pre className="io-code">{executionResult.input}</pre>
                            </div>
                            <div className="io-group">
                              <span className="io-title">Output:</span>
                              <pre className="io-code">{executionResult.output}</pre>
                            </div>
                            <div className="io-group">
                              <span className="io-title">Expected:</span>
                              <pre className="io-code">{executionResult.expectedOutput || problem.sampleOutput}</pre>
                            </div>
                          </div>
                        )}

                        {executionResult.stdout && (
                          <div className="stdout-box">
                            <span className="io-title">Stdout:</span>
                            <pre className="stdout-text">{executionResult.stdout}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAiModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{aiModalTitle}</h2>
              <button className="modal-close-btn" onClick={() => setShowAiModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {isFetchingAi ? (
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <div className="spinner" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
                  <span>{aiModalContent}</span>
                </div>
              ) : (
                <p>{aiModalContent}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
