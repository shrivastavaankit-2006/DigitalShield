import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, XCircle, Target, ShieldAlert } from 'lucide-react';
import learnTopics from '../data/learnTopics';
import './LearnTopic.css';

export default function LearnTopic() {
  const { topicId } = useParams();

  const topicIndex = learnTopics.findIndex(t => t.id === topicId);
  const topic = learnTopics[topicIndex];

  if (!topic) {
    return (
      <div className="page">
        <section className="section">
          <div className="container container--narrow" style={{ textAlign: 'center' }}>
            <h1>Topic Not Found</h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-4) 0' }}>
              The learning topic you are looking for does not exist.
            </p>
            <Link to="/learn" className="btn btn--primary">Back to Learn</Link>
          </div>
        </section>
      </div>
    );
  }

  const prevTopic = topicIndex > 0 ? learnTopics[topicIndex - 1] : null;
  const nextTopic = topicIndex < learnTopics.length - 1 ? learnTopics[topicIndex + 1] : null;

  // Find related practice category
  const practiceMap = {
    'fake-news': 'fake-news',
    'phishing': 'phishing',
    'online-scams': 'scam',
    'suspicious-links': 'suspicious-links',
    'social-media-safety': 'social-media',
    'personal-info-safety': null
  };
  const practiceId = practiceMap[topic.id];

  return (
    <div className="page">
      <section className="section">
        <div className="container container--narrow">
          <Link to="/learn" className="checker__back">
            <ArrowLeft size={16} />
            Back to Learn
          </Link>

          <h1 className="topic__title">{topic.title}</h1>

          {/* Content Sections */}
          {topic.sections.map((section, i) => (
            <div key={i} className="topic__section">
              <h2 className="topic__section-title">{section.title}</h2>
              <p className="topic__section-content">{section.content}</p>
            </div>
          ))}

          {/* Warning Signs */}
          <div className="topic__warning-box">
            <h2 className="topic__warning-title">
              <AlertTriangle size={20} />
              {topic.warningSignsTitle}
            </h2>
            <ul className="topic__warning-list">
              {topic.warningSigns.map((sign, i) => (
                <li key={i}>
                  <ShieldAlert size={16} className="topic__warning-icon" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Do's */}
          <div className="topic__dos-box">
            <h2 className="topic__dos-title">
              <CheckCircle size={20} />
              What You Should Do
            </h2>
            <ul className="topic__dos-list">
              {topic.dos.map((item, i) => (
                <li key={i}>
                  <CheckCircle size={16} className="topic__do-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="topic__donts-box">
            <h2 className="topic__donts-title">
              <XCircle size={20} />
              What You Should Avoid
            </h2>
            <ul className="topic__donts-list">
              {topic.donts.map((item, i) => (
                <li key={i}>
                  <XCircle size={16} className="topic__dont-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Warning */}
          {topic.criticalWarning && (
            <div className="topic__critical">
              <ShieldAlert size={24} />
              <p>{topic.criticalWarning}</p>
            </div>
          )}

          {/* Practice CTA */}
          {practiceId && (
            <div className="topic__practice-cta">
              <Target size={20} />
              <span>Ready to test your knowledge?</span>
              <Link to={`/practice/${practiceId}`} className="btn btn--primary">
                Practice This Topic
              </Link>
            </div>
          )}

          {/* Navigation */}
          <div className="topic__nav">
            {prevTopic ? (
              <Link to={`/learn/${prevTopic.id}`} className="topic__nav-link topic__nav-link--prev">
                <ArrowLeft size={16} />
                <div>
                  <span className="topic__nav-label">Previous</span>
                  <span className="topic__nav-name">{prevTopic.title}</span>
                </div>
              </Link>
            ) : <div />}
            {nextTopic ? (
              <Link to={`/learn/${nextTopic.id}`} className="topic__nav-link topic__nav-link--next">
                <div>
                  <span className="topic__nav-label">Next</span>
                  <span className="topic__nav-name">{nextTopic.title}</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>
    </div>
  );
}
