// ═══════════════════════════════════════════════════
// Login Page — SportShield AI
// ═══════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import './Login.css';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('admin@sportshield.ai', 'demo123');
      navigate('/dashboard');
    } catch {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" id="login-page">
      <div className="login-bg-effects">
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
        <div className="grid-overlay" />
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Brand */}
        <div className="login-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#lg2)" />
            <path d="M16 6L22 10V22L16 26L10 22V10L16 6Z" fill="white" fillOpacity="0.9" />
            <path d="M16 12L19 14V20L16 22L13 20V14L16 12Z" fill="url(#lg2)" />
            <defs>
              <linearGradient id="lg2" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <span>SportShield <em>AI</em></span>
        </div>

        <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">
          {isSignUp
            ? 'Start protecting your broadcasts today'
            : 'Sign in to your broadcaster dashboard'}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="form-group">
              <HiOutlineUser className="input-icon" />
              <input
                type="text"
                className="input-field input-with-icon"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="input-name"
              />
            </div>
          )}
          <div className="form-group">
            <HiOutlineMail className="input-icon" />
            <input
              type="email"
              className="input-field input-with-icon"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="input-email"
            />
          </div>
          <div className="form-group">
            <HiOutlineLockClosed className="input-icon" />
            <input
              type="password"
              className="input-field input-with-icon"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="input-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={loading}
            id="btn-login-submit"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button
          className="btn-secondary demo-btn"
          onClick={handleDemoLogin}
          disabled={loading}
          id="btn-demo-login"
        >
          🚀 Quick Demo Login
        </button>

        <p className="login-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            id="btn-toggle-auth"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
