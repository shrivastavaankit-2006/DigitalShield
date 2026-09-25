import { Link } from 'react-router-dom';
import { Target, Newspaper, Fish, AlertTriangle, Link as LinkIcon, Users, ArrowRight } from 'lucide-react';
import practiceScenarios from '../data/practiceScenarios';
import './Practice.css';

const iconMap = { Newspaper, Fish, AlertTriangle, Link: LinkIcon, Users };
const colorMap = { 'fake-news': '#0ea5e9', phishing: '#8b5cf6', scam: '#f59e0b', 'suspicious-links': '#ef4444', 'social-media': '#ec4899' };

export default function Practice() {
  const categories = Object.values(practiceScenarios);

  return (
    <div className="page">
      <section className="page__hero">
        <div className="container">
          <div className="practice-hero__icon">
            <Target size={32} />
          </div>
          <h1 className="page__hero-title">Practice Digital Safety</h1>
          <p className="page__hero-subtitle">
            Test your judgement with real-life digital situations. Choose a category to start practising.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid grid--3">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] || Target;
              const color = colorMap[cat.id] || '#14b8a6';
              return (
                <Link to={`/practice/${cat.id}`} key={cat.id} className="card card--interactive practice-category-card">
                  <div className="card__icon" style={{ background: `${color}15`, color }}>
                    <Icon size={28} />
                  </div>
                  <h3 className="card__title">{cat.title}</h3>
                  <p className="card__description">{cat.description}</p>
                  <div className="practice-category-card__meta">
                    <span className="practice-category-card__count">{cat.scenarios.length} scenarios</span>
                    <span className="practice-category-card__cta" style={{ color }}>
                      Start <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
