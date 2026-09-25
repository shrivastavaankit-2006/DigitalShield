import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Award,
  Flame,
  Target,
  LogOut,
  ArrowRight,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { ACHIEVEMENTS_LIST } from '../services/progressService';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, progress, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if user is logged out (after auth finishes resolving)
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  // While Firebase is restoring session on refresh, show loading screen
  if (loading) {
    return (
      <div className="page auth-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="auth-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div className="auth-card__badge" style={{ margin: '0 auto var(--space-4)' }}>
            <span>Verifying Profile...</span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Community Member';
  const initial = displayName.charAt(0).toUpperCase();

  const userProgress = progress || {
    completedScenarios: [],
    completedTopics: [],
    challengeAttempts: 0,
    bestScore: 0,
    totalPoints: 0,
    bestStreak: 0,
    achievements: []
  };

  const unlockedCount = (userProgress.achievements || []).length;
  const scenariosDone = (userProgress.completedScenarios || []).length;

  return (
    <div className="page">
      <section className="section">
        <div className="container">
          {/* Header Card */}
          <div className="dashboard-header">
            <div className="dashboard-user-info">
              <div className="dashboard-avatar">
                {initial}
              </div>
              <div className="dashboard-user-details">
                <h1 className="dashboard-name">{displayName}</h1>
                <p className="dashboard-email">{currentUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleLogout}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-card__top">
                <span className="dashboard-stat-card__label">Best Score</span>
                <Trophy size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div className="dashboard-stat-card__val" style={{ color: userProgress.bestScore >= 80 ? 'var(--color-risk-low)' : 'var(--color-text)' }}>
                {userProgress.bestScore}<span style={{ fontSize: 'var(--font-size-base)', fontWeight: 500 }}>/100</span>
              </div>
              <span className="dashboard-stat-card__sub">{userProgress.challengeAttempts} challenge attempts</span>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-card__top">
                <span className="dashboard-stat-card__label">Best Streak</span>
                <Flame size={18} style={{ color: '#f97316' }} />
              </div>
              <div className="dashboard-stat-card__val" style={{ color: '#f97316' }}>
                {userProgress.bestStreak}
              </div>
              <span className="dashboard-stat-card__sub">Consecutive correct answers</span>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-card__top">
                <span className="dashboard-stat-card__label">Total Points</span>
                <Award size={18} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div className="dashboard-stat-card__val" style={{ color: 'var(--color-accent)' }}>
                {userProgress.totalPoints}
              </div>
              <span className="dashboard-stat-card__sub">Earned across sessions</span>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-card__top">
                <span className="dashboard-stat-card__label">Scenarios Done</span>
                <Target size={18} style={{ color: '#0ea5e9' }} />
              </div>
              <div className="dashboard-stat-card__val">
                {scenariosDone}
              </div>
              <span className="dashboard-stat-card__sub">Out of 25 community scenarios</span>
            </div>
          </div>

          {/* Panels Grid */}
          <div className="dashboard-sections">
            {/* Achievements Panel */}
            <div className="dashboard-panel">
              <h2 className="dashboard-panel__title">
                <Award size={22} style={{ color: 'var(--color-accent)' }} />
                <span>Achievements ({unlockedCount}/{ACHIEVEMENTS_LIST.length})</span>
              </h2>
              <p className="dashboard-panel__desc">
                Badges unlocked by completing practice scenarios and achieving high challenge scores.
              </p>

              <div className="dashboard-achievements-list">
                {ACHIEVEMENTS_LIST.map((ach) => {
                  const isUnlocked = (userProgress.achievements || []).includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`dashboard-achievement-item ${isUnlocked ? 'dashboard-achievement-item--unlocked' : 'dashboard-achievement-item--locked'}`}
                    >
                      <div className="dashboard-achievement-icon">{ach.icon}</div>
                      <div className="dashboard-achievement-info">
                        <div className="dashboard-achievement-name">{ach.title}</div>
                        <div className="dashboard-achievement-desc">{ach.description}</div>
                      </div>
                      <span className={`dashboard-achievement-tag ${isUnlocked ? 'dashboard-achievement-tag--unlocked' : 'dashboard-achievement-tag--locked'}`}>
                        {isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completed Topics & Continue Training Panel */}
            <div className="dashboard-panel">
              <h2 className="dashboard-panel__title">
                <BookOpen size={22} style={{ color: '#0ea5e9' }} />
                <span>Learning & Training</span>
              </h2>
              <p className="dashboard-panel__desc">
                Review your completed topics and jump back into interactive practice.
              </p>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  Completed Topics ({userProgress.completedTopics?.length || 0})
                </h4>
                {userProgress.completedTopics && userProgress.completedTopics.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {userProgress.completedTopics.map((topic, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-risk-low)' }} />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    No topics marked complete yet. Browse the Learn section to start reading.
                  </p>
                )}
              </div>

              <div className="dashboard-cta-box">
                <div>
                  <h4>Continue Training</h4>
                  <p>Sharpen your instincts in scenario practice or start a new Digital Safety Challenge.</p>
                </div>
                <Link to="/training" className="btn btn--primary" style={{ flexShrink: 0 }}>
                  Open Training <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
