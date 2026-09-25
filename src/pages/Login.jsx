import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, login, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedEmail, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const code = err.code || '';
      const msg = err.message || '';

      if (code === 'auth/invalid-email' || msg.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests' || msg.includes('auth/too-many-requests')) {
        setError('Too many failed attempts. Please wait a few moments and try again.');
      } else if (code === 'auth/user-disabled' || msg.includes('auth/user-disabled')) {
        setError('This account has been disabled.');
      } else if (code === 'auth/operation-not-allowed' || msg.includes('CONFIGURATION_NOT_FOUND') || msg.includes('not configured')) {
        setError('Authentication service is not enabled. Please enable Email/Password in Firebase Console.');
      } else {
        // Safe generic message that does not leak user registration status
        setError('Incorrect email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__badge">
            <ShieldCheck size={14} />
            <span>DigitalShield Profile</span>
          </div>
          <h1 className="auth-card__title">Welcome Back</h1>
          <p className="auth-card__subtitle">
            Log in to access your saved training progress, challenge streaks, and certificates.
          </p>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                required
                className="auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                required
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={isSubmitting}
            style={{ marginTop: 'var(--space-2)' }}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'Logging in...' : 'Log In'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/signup" className="auth-link">Sign Up Free</Link>
        </div>

        <p className="auth-privacy-notice">
          🛡️ We respect your privacy. DigitalShield never asks for OTPs, PINs, or confidential banking information.
        </p>
      </div>
    </div>
  );
}
