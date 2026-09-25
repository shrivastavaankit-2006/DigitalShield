import { Link } from 'react-router-dom';
import { BookOpen, Newspaper, Fish, AlertTriangle, Link as LinkIcon, Users, Shield, ArrowRight } from 'lucide-react';
import './Learn.css';

const iconMap = { Newspaper, Fish, AlertTriangle, Link: LinkIcon, Users, Shield };

const topicColors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#22c55e'];

import learnTopics from '../data/learnTopics';

export default function Learn() {
  return (
    <div className="page">
      <section className="page__hero">
        <div className="container">
          <div className="learn-hero__icon">
            <BookOpen size={32} />
          </div>
          <h1 className="page__hero-title">Learn Digital Safety</h1>
          <p className="page__hero-subtitle">
            Understand digital threats through simple explanations, real examples, and practical advice. Choose a topic to start learning.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid grid--3">
            {learnTopics.map((topic, index) => {
              const Icon = iconMap[topic.icon] || Shield;
              const color = topicColors[index % topicColors.length];
              return (
                <Link to={`/learn/${topic.id}`} key={topic.id} className="card card--interactive learn-topic-card">
                  <div className="card__icon" style={{ background: `${color}15`, color }}>
                    <Icon size={28} />
                  </div>
                  <h3 className="card__title">{topic.title}</h3>
                  <p className="card__description">{topic.shortDescription}</p>
                  <span className="learn-topic-card__cta" style={{ color }}>
                    Learn More <ArrowRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
