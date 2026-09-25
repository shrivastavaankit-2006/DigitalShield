import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import './Auth.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, signUp, loading } = useAuth();
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

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(email.trim(), password, name.trim());
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const code = err.code || '';
      const msg = err.message || '';

      if (code === 'auth/email-already-in-use' || msg.includes('auth/email-already-in-use')) {
        setError('This email is already registered. Please log in instead.');
      } else if (code === 'auth/invalid-email' || msg.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password' || msg.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters long.');
      } else if (code === 'auth/operation-not-allowed' || msg.includes('CONFIGURATION_NOT_FOUND') || msg.includes('not configured')) {
        setError('Authentication service is not enabled. Please enable Email/Password in Firebase Console.');
      } else {
        setError('Could not create account. Please check your details and try again.');
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
            <span>Create Profile</span>
          </div>
          <h1 className="auth-card__title">Create Account</h1>
          <p className="auth-card__subtitle">
            Save your scenario practice records, track Digital Safety Challenge streaks, and earn achievements.
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
            <label className="auth-label">Full Name or Nickname</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                type="text"
                required
                className="auth-input"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

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
            <label className="auth-label">Choose Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                required
                minLength={6}
                className="auth-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={isSubmitting}
            style={{ marginTop: 'var(--space-2)' }}
          >
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Creating Account...' : 'Sign Up Free'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-link">Log In</Link>
        </div>

        <p className="auth-privacy-notice">
          🛡️ Privacy Commitment: We only store your training scores and achievements. We never ask for banking credentials or sensitive personal documents.
        </p>
      </div>
    </div>
  );
}
