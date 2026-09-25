import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  Trophy,
  Newspaper,
  Fish,
  AlertTriangle,
  Link as LinkIcon,
  Users,
  ArrowRight,
  Flame,
  BookOpen
} from 'lucide-react';
import practiceScenarios from '../data/practiceScenarios';
import './Training.css';

const iconMap = {
  Newspaper,
  Fish,
  AlertTriangle,
  Link: LinkIcon,
  Users
};

const colorMap = {
  'fake-news': '#0ea5e9',
  phishing: '#8b5cf6',
  scam: '#f59e0b',
  'suspicious-links': '#ef4444',
  'social-media': '#ec4899'
};

export default function Training() {
  const categories = Object.values(practiceScenarios);

  return (
    <div className="page">
      {/* Hero Header */}
      <section className="page__hero">
        <div className="container">
          <div className="training-hero__icon">
            <GraduationCap size={32} />
          </div>
          <h1 className="page__hero-title">Digital Safety Training</h1>
          <p className="page__hero-subtitle">
            Sharpen your instincts with realistic practice scenarios, or test your overall digital awareness in the Digital Safety Challenge.
          </p>
        </div>
      </section>

      {/* Main Training Options */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {/* Dual Action Highlight Banners */}
          <div className="training-tracks-grid">
            {/* Track 1: Practice Scenarios */}
            <div className="training-track-card">
              <div className="training-track-card__badge">
                <Target size={16} />
                <span>Hands-on Scenarios</span>
              </div>
              <h2 className="training-track-card__title">Scenario Practice</h2>
              <p className="training-track-card__desc">
                Encounter realistic community scenarios including phishing texts, viral misinformation, lottery frauds, and deceptive links. Every session is randomized for fresh learning.
              </p>
              <div className="training-track-card__stats">
                <span className="training-stat-pill">5 Categories</span>
                <span className="training-stat-pill">25 Scenarios</span>
                <span className="training-stat-pill">Instant Feedback</span>
              </div>
              <a href="#practice-categories" className="btn btn--primary">
                Choose a Category
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Track 2: Digital Safety Challenge (Quiz) */}
            <div className="training-track-card training-track-card--quiz">
              <div className="training-track-card__badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Trophy size={16} />
                <span>Gamified Challenge</span>
              </div>
              <h2 className="training-track-card__title">Digital Safety Challenge</h2>
              <p className="training-track-card__desc">
                Take a 10-question challenge drawn at random from our 30-question bank. Build your answer streak, earn points, and receive a personalized scorecard.
              </p>
              <div className="training-track-card__stats">
                <span className="training-stat-pill">100 Max Points</span>
                <span className="training-stat-pill"><Flame size={13} style={{ color: '#f59e0b' }} /> Streaks</span>
                <span className="training-stat-pill">Score Report</span>
              </div>
              <Link to="/quiz" className="btn btn--primary">
                Start Challenge
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Section: Practice Categories */}
          <div id="practice-categories" className="training-section-header">
            <div>
              <h2 className="section__title" style={{ textAlign: 'left', marginBottom: 'var(--space-1)' }}>
                Practice Categories
              </h2>
              <p className="section__subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
                Select a topic to begin an interactive scenario session.
              </p>
            </div>
          </div>

          <div className="grid grid--3">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] || Target;
              const color = colorMap[cat.id] || '#14b8a6';
              return (
                <Link
                  to={`/practice/${cat.id}`}
                  key={cat.id}
                  className="card card--interactive training-category-card"
                >
                  <div className="card__icon" style={{ background: `${color}15`, color }}>
                    <Icon size={26} />
                  </div>
                  <h3 className="card__title">{cat.title}</h3>
                  <p className="card__description">{cat.description}</p>
                  <div className="training-category-card__meta">
                    <span className="training-category-card__count">{cat.scenarios.length} scenarios</span>
                    <span className="training-category-card__cta" style={{ color }}>
                      Start Practice <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Learn More Link Card */}
          <div className="training-learn-card">
            <div className="training-learn-card__icon">
              <BookOpen size={28} />
            </div>
            <div className="training-learn-card__text">
              <h3>Need to study the fundamentals first?</h3>
              <p>Review our in-depth educational modules covering phishing, fake news, personal data security, and safe habits.</p>
            </div>
            <Link to="/learn" className="btn btn--secondary">
              Browse Learn Guides
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
