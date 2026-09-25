import { Link } from 'react-router-dom';
import {
  Search,
  Newspaper,
  MessageSquare,
  Mail,
  Link as LinkIcon,
  BookOpen,
  Target,
  Shield,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import './Home.css';

export default function Home() {
  const checkCards = [
    {
      to: '/check/news',
      icon: Newspaper,
      title: 'News Check',
      description: 'Check suspicious news headlines, viral forwards, claims, or article screenshots.',
      badge: 'Misinformation'
    },
    {
      to: '/check/message',
      icon: MessageSquare,
      title: 'Message Check',
      description: 'Check SMS, WhatsApp, and chat messages for urgency, fraud, and threats.',
      badge: 'SMS / Chat'
    },
    {
      to: '/check/email',
      icon: Mail,
      title: 'Email Check',
      description: 'Check suspicious emails for sender address spoofing, phishing, and fake demands.',
      badge: 'Phishing'
    },
    {
      to: '/check/link',
      icon: LinkIcon,
      title: 'Link Check',
      description: 'Check suspicious URLs and web address structures for deceptive domains and spoofing.',
      badge: 'Malicious URLs'
    },
  ];

  const journeySteps = [
    {
      number: '1',
      title: 'Check',
      desc: 'Received an odd link, text, or viral forward? Run it through our educational checkers.',
      linkText: 'Use Checkers',
      to: '/check',
      icon: Search
    },
    {
      number: '2',
      title: 'Learn',
      desc: 'Understand how scams work through clear guides on phishing, fake news, and personal safety.',
      linkText: 'Browse Topics',
      to: '/learn',
      icon: BookOpen
    },
    {
      number: '3',
      title: 'Practice',
      desc: 'Sharpen your instincts by navigating 25 realistic, interactive community safety scenarios.',
      linkText: 'Start Practice',
      to: '/practice',
      icon: Target
    },
    {
      number: '4',
      title: 'Challenge',
      desc: 'Test your digital awareness with our 10-question challenge and see where you can improve.',
      linkText: 'Take Challenge',
      to: '/quiz',
      icon: HelpCircle
    }
  ];

  return (
    <div className="page">
      {/* Clean, Authoritative Hero Section */}
      <section className="hero">
        <div className="hero__content container">
          <div className="hero__badge">
            <Shield size={16} />
            <span>Community Digital Safety</span>
          </div>

          <h1 className="hero__title">
            Think Before You Click.<br />
            <span className="hero__title-highlight">Verify Before You Trust.</span>
          </h1>

          <p className="hero__subtitle">
            A community-first educational platform helping you recognise fake news, phishing messages,
            online scams, and unsafe links before taking action.
          </p>

          <div className="hero__ctas">
            <Link to="/check" className="btn btn--primary btn--large">
              <Search size={18} />
              Check Something Suspicious
            </Link>
            <Link to="/learn" className="btn btn--secondary btn--large">
              Start Learning
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Prominent Check Before You Trust Section */}
      <section className="section check-area">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Check Before You Trust</h2>
            <p className="section__subtitle">
              Choose an educational checker below. You can paste text, upload a screenshot, or use both together.
            </p>
          </div>

          <div className="grid grid--4">
            {checkCards.map((card) => {
              const CardIcon = card.icon;
              return (
                <Link to={card.to} key={card.to} className="card card--interactive check-card">
                  <div className="check-card__header">
                    <div className="card__icon">
                      <CardIcon size={24} />
                    </div>
                    <span className="check-card__badge">{card.badge}</span>
                  </div>
                  <h3 className="card__title">{card.title}</h3>
                  <p className="card__description">{card.description}</p>
                  <span className="check-card__cta">
                    Open Checker <ArrowRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guided Journey: Understand -> Check -> Learn -> Practice -> Challenge */}
      <section className="section journey-section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Your Digital Safety Journey</h2>
            <p className="section__subtitle">
              Follow four practical steps to build lasting confidence in the digital world.
            </p>
          </div>

          <div className="grid grid--4">
            {journeySteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className="step-card">
                  <div className="step-card__top">
                    <span className="step-card__number">{step.number}</span>
                    <div className="step-card__icon">
                      <StepIcon size={20} />
                    </div>
                  </div>
                  <h3 className="step-card__title">{step.title}</h3>
                  <p className="step-card__description">{step.desc}</p>
                  <Link to={step.to} className="step-card__link">
                    {step.linkText} <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access to Safety Tips & Community Findings */}
      <section className="section resources-highlight">
        <div className="container">
          <div className="grid grid--2">
            <div className="resource-banner">
              <div className="resource-banner__icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Lightbulb size={28} />
              </div>
              <div className="resource-banner__content">
                <h3>Daily Digital Safety Tips</h3>
                <p>Actionable checklists for banking, social media, and protecting sensitive family data.</p>
                <Link to="/safety-tips" className="resource-banner__btn">
                  View Safety Rules <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="resource-banner">
              <div className="resource-banner__icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                <BarChart3 size={28} />
              </div>
              <div className="resource-banner__content">
                <h3>Community Survey Findings</h3>
                <p>Explore real-world insights on common online scams, misinformation prevalence, and user habits.</p>
                <Link to="/community-findings" className="resource-banner__btn">
                  View Survey Data <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Digital Safety Matters */}
      <section className="section why-section">
        <div className="container">
          <div className="why-section__content">
            <div className="why-section__text">
              <h2 className="section__title" style={{ textAlign: 'left' }}>Why Digital Safety Matters</h2>
              <p className="why-section__desc">
                Every day, community members encounter deceptive text messages, altered screenshots, and imposter portals.
                A single rushed click or forward can result in financial loss or compromise your privacy.
              </p>
              <ul className="why-section__list">
                <li><CheckCircle size={18} /> Spot warning signs in suspicious SMS, WhatsApp, and email messages</li>
                <li><CheckCircle size={18} /> Never share OTPs, UPI PINs, passwords, or bank credentials</li>
                <li><CheckCircle size={18} /> Verify claims with reliable official channels before sharing</li>
                <li><CheckCircle size={18} /> Practice real-world scenarios to build resilient instincts</li>
              </ul>
            </div>

            <div className="why-section__stats">
              <div className="stat-card">
                <div className="stat-card__number">4</div>
                <div className="stat-card__label">Content Checkers</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__number">6</div>
                <div className="stat-card__label">Learning Modules</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__number">25</div>
                <div className="stat-card__label">Practice Scenarios</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__number">30</div>
                <div className="stat-card__label">Challenge Questions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Training & Progress CTA */}
      <section className="section cta-banner">
        <div className="container">
          <div className="cta-banner__content">
            <h2>Take Your Digital Defense to the Next Level</h2>
            <p>
              Practice real-world scenarios, test yourself with the Digital Safety Challenge, and track your streaks.
            </p>
            <div className="cta-banner__buttons">
              <Link to="/check" className="btn btn--primary btn--large">
                <Search size={18} />
                Try Checkers
              </Link>
              <Link to="/training" className="btn btn--secondary btn--large">
                <GraduationCap size={18} />
                Start Training
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
