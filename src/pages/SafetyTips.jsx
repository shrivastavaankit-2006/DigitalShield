import { Shield, Share2, MousePointerClick, CreditCard, Users, AlertTriangle } from 'lucide-react';
import safetyTips from '../data/safetyTips';
import './SafetyTips.css';

const iconMap = { Share2, MousePointerClick, CreditCard, Users };

export default function SafetyTips() {
  return (
    <div className="page">
      <section className="page__hero">
        <div className="container">
          <div className="tips-hero__icon">
            <Shield size={32} />
          </div>
          <h1 className="page__hero-title">Safety Tips</h1>
          <p className="page__hero-subtitle">
            Simple, practical safety tips to protect yourself online. Follow these guidelines to stay safe.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tips-grid">
            {safetyTips.map((category) => {
              const Icon = iconMap[category.icon] || Shield;
              return (
                <div key={category.id} className="tips-category">
                  <div className="tips-category__header" style={{ borderLeftColor: category.color }}>
                    <div className="tips-category__icon" style={{ background: `${category.color}15`, color: category.color }}>
                      <Icon size={24} />
                    </div>
                    <h2 className="tips-category__title">{category.title}</h2>
                  </div>
                  <div className="tips-category__list">
                    {category.tips.map((tip, i) => (
                      <div key={i} className={`tip-item ${tip.critical ? 'tip-item--critical' : ''}`}>
                        {tip.critical && <AlertTriangle size={16} className="tip-item__alert" />}
                        <div>
                          <h4 className="tip-item__title">{tip.title}</h4>
                          <p className="tip-item__desc">{tip.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
