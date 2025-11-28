import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Shield, Server } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [server, setServer] = useState('');
  const [showServerSelect, setShowServerSelect] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const servers = [
    { name: 'Local Server', url: 'http://localhost:5001/api' },
    { name: 'Remote Server (Vercel)', url: 'https://store-backend-eta.vercel.app/api' },
  ];

  useEffect(() => {
    const savedServer = localStorage.getItem('apiServer');
    if (savedServer) {
      setServer(savedServer);
      setShowServerSelect(false);
    }
  }, []);

  const handleServerSelect = (serverUrl) => {
    setServer(serverUrl);
    localStorage.setItem('apiServer', serverUrl);
    // Update the API client base URL
    import('../api/client').then((module) => {
      module.default.defaults.baseURL = serverUrl;
    });
    setShowServerSelect(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  if (showServerSelect) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <Server size={48} className="login-icon" />
            <h1>Select Server</h1>
            <p>Choose which backend server to connect to</p>
          </div>

          <div className="server-selection">
            {servers.map((srv) => (
              <button
                key={srv.url}
                onClick={() => handleServerSelect(srv.url)}
                className="server-card"
              >
                <h3>{srv.name}</h3>
                <p>{srv.url}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Shield size={48} className="login-icon" />
          <h1>Admin Panel</h1>
          <p>Sign in to access the dashboard</p>
          <button
            onClick={() => setShowServerSelect(true)}
            className="change-server-btn"
          >
            <Server size={16} />
            Change Server
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <Button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="login-footer">
          <p>eCommerce Admin Panel v1.0</p>
          <p className="server-info">Connected to: {server}</p>
        </div>
      </div>
    </div>
  );
}
