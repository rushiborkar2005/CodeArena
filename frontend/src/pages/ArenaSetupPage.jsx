import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Users, Swords } from 'lucide-react';

export const ArenaSetupPage = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCreateRoom = () => {
    if (!isAuthenticated) {
      alert("Please login before playing.");
      navigate('/login');
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 9);
    navigate(`/arena/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (!isAuthenticated) {
      alert("Please login before playing.");
      navigate('/login');
      return;
    }
    if (roomId.trim()) {
      navigate(`/arena/${roomId.trim()}`);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="auth-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div className="auth-header">
          <div className="auth-icon" style={{ margin: '0 auto 1rem', display: 'flex', justifyContent: 'center' }}>
            <Swords size={40} className="text-primary" />
          </div>
          <h1>1v1 Coding Arena</h1>
          <p>Compete head-to-head in real-time coding battles</p>
        </div>

        <div className="auth-form" style={{ marginTop: '2rem' }}>
          <button className="btn-primary" onClick={handleCreateRoom} style={{ width: '100%', padding: '12px', fontSize: '1.1rem', marginBottom: '2rem' }}>
            <Code2 size={20} style={{ marginRight: '8px' }} /> Create New Room
          </button>
          
          <div style={{ position: 'relative', margin: '2rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-secondary)', padding: '0 10px', color: 'var(--text-muted)' }}>OR</span>
          </div>

          <div className="input-group">
            <label>Join Existing Room</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Enter Room ID" 
                value={roomId} 
                onChange={(e) => setRoomId(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn-secondary" onClick={handleJoinRoom}>
                <Users size={16} style={{ marginRight: '8px' }} /> Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
