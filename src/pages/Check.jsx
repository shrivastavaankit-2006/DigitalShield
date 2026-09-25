import { Link } from 'react-router-dom';
import { Newspaper, MessageSquare, Mail, Link as LinkIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import './Check.css';

const checkers = [
  {
    to: '/check/news',
    icon: Newspaper,
    title: 'News Check',
    description: 'Check suspicious news, headlines, viral claims, or article screenshots for misinformation indicators.',
    color: '#0ea5e9',
    badge: 'Text & Screenshot'
  },
  {
    to: '/check/message',
    icon: MessageSquare,
    title: 'Message Check',
    description: 'Check SMS, WhatsApp, Telegram, or chat message texts and screenshots for urgency and scam signs.',
    color: '#8b5cf6',
    badge: 'Text & Screenshot'
  },
  {
    to: '/check/email',
    icon: Mail,
    title: 'Email Check',
    description: 'Check suspicious emails, sender addresses, and email body screenshots for phishing red flags.',
    color: '#f59e0b',
    badge: 'Text & Screenshot'
  },
  {
    to: '/check/link',
    icon: LinkIcon,
    title: 'Link Check',
    description: 'Check suspicious URLs and web address structures or upload a screenshot of the web address.',
    color: '#ef4444',
    badge: 'URL & Screenshot'
  },
];

export default function Check() {
  return (
    <div className="page">
      <section className="page__hero">
        <div className="container">
          <div className="check-hero__icon">
            <ShieldCheck size={32} />
          </div>
          <h1 className="page__hero-title">Check Something Suspicious</h1>
          <p className="page__hero-subtitle">
            Choose an educational checker below. You can paste text, upload a screenshot, or analyze both together.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="check-grid">
            {checkers.map((checker) => {
              const Icon = checker.icon;
              return (
                <Link to={checker.to} key={checker.to} className="check-card-large">
                  <div className="check-card-large__icon" style={{ background: `${checker.color}15`, color: checker.color }}>
                    <Icon size={32} />
                  </div>
                  <div className="check-card-large__content">
                    <div className="check-card-large__title-row">
                      <h2 className="check-card-large__title">{checker.title}</h2>
                      <span className="check-card-large__badge">{checker.badge}</span>
                    </div>
                    <p className="check-card-large__desc">{checker.description}</p>
                  </div>
                  <div className="check-card-large__arrow" style={{ color: checker.color }}>
                    <ArrowRight size={22} />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="privacy-warning" style={{ marginTop: 'var(--space-8)' }}>
            <span>🛡️</span>
            <span>
              <strong>Important Privacy Notice:</strong> Do not enter passwords, OTPs, UPI PINs, bank details, card details or other sensitive personal information, and do not upload screenshots containing confidential personal data.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
