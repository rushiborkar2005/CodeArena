import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemService } from '../services';
import { CodeEditor } from '../components/CodeEditor';
import { useAuth } from '../context/AuthContext';
import { useBackendStatus } from '../context/BackendContext';
import { io } from 'socket.io-client';
import { 
  ArrowLeft, Play, Send, RotateCcw, Clock, Pause, CheckCircle2, 
  XCircle, FileText, Lightbulb, History, Code2, Terminal,
  ChevronUp, ChevronDown, AlertCircle, Users, Activity
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ArenaSolverPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isOffline } = useBackendStatus();

  // Socket
  const [socket, setSocket] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [partnerEvents, setPartnerEvents] = useState([]); // List of messages like "UserX submitted code", "UserX got an error"

  // Problem state
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Lobby State
  const [isStarted, setIsStarted] = useState(false);
  const [problemsList, setProblemsList] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState('');

  // Workspace controls
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [activeLeftTab, setActiveLeftTab] = useState('description');

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Bottom console state
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase'); // testcase | result | arena
  const [testInput, setTestInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch problem list for the lobby
    const fetchProblemsList = async () => {
      const data = await problemService.getProblems();
      setProblemsList(data.problems || []);
      if (data.problems && data.problems.length > 0) {
        setSelectedProblemId(data.problems[0].id);
      }
    };
    fetchProblemsList();

    // Init Socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', { roomId, username: user.username });
    });

    newSocket.on('room_full', ({ message }) => {
      alert(message);
      navigate('/arena');
    });

    newSocket.on('user_joined', ({ users, message }) => {
      setRoomUsers(users);
      addEvent(message, 'info');
    });

    newSocket.on('user_left', ({ users, message }) => {
      setRoomUsers(users);
      addEvent(message, 'warning');
    });

    newSocket.on('partner_submission', ({ username, status, message }) => {
      if (status === 'success') {
        addEvent(`${username} successfully submitted the solution!`, 'success');
      } else {
        addEvent(`${username} submitted code and got an error: ${message}`, 'error');
      }
    });

    newSocket.on('arena_started', ({ problemId }) => {
      setIsStarted(true);
      fetchProblemDetails(problemId);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, isAuthenticated, user]);

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

  const addEvent = (msg, type) => {
    setPartnerEvents(prev => [...prev, { id: Date.now(), msg, type, time: new Date() }]);
    // Flash arena tab if not open
    if (activeConsoleTab !== 'arena' || !consoleOpen) {
        setActiveConsoleTab('arena');
        setConsoleOpen(true);
    }
  };

  const fetchProblemDetails = async (id) => {
    setLoading(true);
    try {
      const data = await problemService.getProblemById(id);
      setProblem(data);
      setTestInput(data.sampleInput || '');
      setCode(data.starterTemplates?.[language] || `// Arena ready`);
      setIsTimerRunning(true);
    } catch (err) {
      setError('Failed to load arena problem.');
    } finally {
      setLoading(false);
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
      setExecutionResult({ type: 'run', ...res });
    } catch (err) {
      setExecutionResult({
        type: 'run',
        status: 'Compilation Error',
        output: err.response?.data?.message || 'Error executing code'
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
      setExecutionResult({ type: 'submit', ...res });
      
      // Notify partner
      socket?.emit('code_submission', {
        roomId,
        username: user.username,
        status: res.status === 'Accepted' ? 'success' : 'error',
        message: res.status
      });

    } catch (err) {
      const errMsg = err.response?.data?.message || 'Submission failed';
      setExecutionResult({
        type: 'submit',
        status: 'Error',
        message: errMsg
      });
      
      // Notify partner
      socket?.emit('code_submission', {
        roomId,
        username: user.username,
        status: 'error',
        message: errMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="solver-loading-screen">
        <div className="spinner"></div>
        <p>Loading Arena Workspace...</p>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="auth-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div className="auth-header">
            <Users size={40} className="text-primary" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h1>Arena Lobby: {roomId}</h1>
            <p>Wait for your opponent and select a challenge</p>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'left', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Players Joined</span>
              <span className="text-primary">{roomUsers.length}/2</span>
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {roomUsers.map((u, i) => (
                <li key={u.id} style={{ padding: '0.5rem 0', borderBottom: i < roomUsers.length - 1 ? '1px solid var(--border-color)' : 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <span>{u.username} {u.id === socket?.id && '(You)'}</span>
                </li>
              ))}
              {roomUsers.length < 2 && (
                <li style={{ padding: '0.5rem 0', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px dashed var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ?
                  </div>
                  Waiting for opponent...
                </li>
              )}
            </ul>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Problem:</label>
            <select 
              className="language-select" 
              style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-secondary)' }}
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
            >
              {problemsList.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.difficulty})</option>
              ))}
            </select>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '15px', marginTop: '2rem', fontSize: '1.1rem', opacity: roomUsers.length === 2 ? 1 : 0.5, cursor: roomUsers.length === 2 ? 'pointer' : 'not-allowed' }}
            disabled={roomUsers.length !== 2}
            onClick={() => {
              if (roomUsers.length === 2 && socket) {
                socket.emit('start_arena', { roomId, problemId: selectedProblemId });
              }
            }}
          >
            Start Arena Battle
          </button>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <AlertCircle size={40} className="empty-icon text-red" />
          <h3>{error}</h3>
          <button className="btn-primary" onClick={() => navigate('/arena')} style={{ marginTop: '1rem' }}>
            Leave Arena
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="solver-workspace">
      {/* Top Workspace Header Bar */}
      <header className="solver-topbar" style={{ borderBottomColor: 'var(--accent-primary)' }}>
        <div className="topbar-left">
          <button onClick={() => navigate('/arena')} className="btn-back">
            <ArrowLeft size={16} />
            <span>Leave Room</span>
          </button>

          <div className="problem-title-header">
            <span className="prob-title">Arena Room: {roomId}</span>
            <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                {roomUsers.map(u => (
                    <span key={u.id} className="diff-pill" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                        <Users size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> 
                        {u.username}
                        {u.id === socket?.id && ' (You)'}
                    </span>
                ))}
            </div>
          </div>
        </div>

        <div className="topbar-center">
          <div className="timer-widget">
            <Clock size={14} className="timer-icon" />
            <span className="timer-display" style={{ color: 'var(--accent-primary)' }}>{formatTimer(timerSeconds)}</span>
          </div>
        </div>

        <div className="topbar-right">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            <option value="c">C (GCC 12)</option>
            <option value="cpp">C++ 20</option>
            <option value="java">Java 17</option>
          </select>

          <button 
            onClick={handleRunCode} 
            disabled={isRunning || isSubmitting || isOffline}
            className="btn-run"
          >
            <Play size={14} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button 
            onClick={handleSubmitCode} 
            disabled={isRunning || isSubmitting || isOffline}
            className="btn-submit"
            style={{ background: 'var(--accent-primary)', color: 'black' }}
          >
            <Send size={14} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit to Arena'}</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <div className="solver-main-container">
        <div className="solver-pane left-pane">
          <div className="pane-tabs-header">
            <button className="pane-tab active">
              <FileText size={15} />
              <span>{problem.title}</span>
            </button>
          </div>
          <div className="pane-content">
             <div className="problem-details-wrapper">
                <div className="prob-description-text">
                  <p>{problem.description}</p>
                </div>
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
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="solver-pane right-pane">
          <div className="editor-pane-inner">
            <CodeEditor 
              value={code} 
              onChange={setCode}
              language={language}
            />
          </div>

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
                  <span>Result</span>
                </button>
                <button 
                  className={`console-tab ${activeConsoleTab === 'arena' ? 'active' : ''}`}
                  onClick={() => { setActiveConsoleTab('arena'); setConsoleOpen(true); }}
                  style={{ color: partnerEvents.length > 0 && !consoleOpen ? 'var(--accent-primary)' : '' }}
                >
                  <Activity size={14} />
                  <span>Arena Activity</span>
                  {partnerEvents.length > 0 && <span style={{ background: 'var(--accent-primary)', color: 'black', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', marginLeft: '5px' }}>{partnerEvents.length}</span>}
                </button>
              </div>
              <button onClick={() => setConsoleOpen(!consoleOpen)} className="btn-toggle-console">
                {consoleOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            {consoleOpen && (
              <div className="console-drawer-body">
                {activeConsoleTab === 'testcase' && (
                  <div className="testcase-tab-content">
                    <textarea value={testInput} onChange={(e) => setTestInput(e.target.value)} className="testcase-input" rows={3}/>
                  </div>
                )}
                {activeConsoleTab === 'result' && (
                  <div className="test-result-content">
                    {!executionResult ? (
                      <div className="console-prompt">Run or submit code to see results.</div>
                    ) : (
                      <div className="result-details">
                         <div className={`verdict-banner ${executionResult.status === 'Accepted' ? 'banner-pass' : 'banner-fail'}`}>
                           {executionResult.status === 'Accepted' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                           <div className="verdict-text">
                             <h3>{executionResult.status}</h3>
                             <span>{executionResult.message || `Testcases: ${executionResult.testcasesPassed || '1 / 1'}`}</span>
                           </div>
                         </div>
                         {executionResult.output && (
                             <div className="io-result-box">
                               <div className="io-group">
                                 <span className="io-title">Output:</span>
                                 <pre className="io-code">{executionResult.output}</pre>
                               </div>
                             </div>
                         )}
                      </div>
                    )}
                  </div>
                )}
                {activeConsoleTab === 'arena' && (
                  <div className="arena-activity-content" style={{ padding: '15px' }}>
                    {partnerEvents.length === 0 ? (
                        <div className="console-prompt text-dim">No activity yet. Invite a friend!</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {partnerEvents.map(ev => (
                                <div key={ev.id} style={{ 
                                    padding: '10px', 
                                    borderRadius: '8px', 
                                    background: ev.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : ev.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                                    borderLeft: `4px solid ${ev.type === 'success' ? 'var(--text-green)' : ev.type === 'error' ? 'var(--text-red)' : 'var(--accent-primary)'}`
                                }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        {ev.time.toLocaleTimeString()}
                                    </div>
                                    <div style={{ color: 'var(--text-primary)' }}>
                                        {ev.msg}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
