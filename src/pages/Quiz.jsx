import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Target,
  BookOpen,
  Flame,
  Award,
  Sparkles,
  AlertTriangle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import quizQuestions from '../data/quizQuestions';
import { useAuth } from '../context/useAuth';
import { generateTrainingQuestions } from '../services/geminiService';
import { formatIndianCurrency } from '../utils/formatCurrency';
import './Quiz.css';

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const TOPIC_URL_MAP = {
  'Fake News': '/learn/fake-news',
  'Phishing': '/learn/phishing',
  'Scams': '/learn/online-scams',
  'Online Scams': '/learn/online-scams',
  'Suspicious Links': '/learn/suspicious-links',
  'Social Media': '/learn/social-media',
  'Personal Information': '/learn/personal-info',
};

export default function Quiz() {
  const { currentUser, progress, saveProgress } = useAuth();
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);
  const quizCardRef = useRef(null);

  // Gamification state
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);

  const startQuiz = async (forceOffline = false) => {
    setError(null);

    if (!forceOffline) {
      setLoading(true);
      try {
        const aiQuestions = await generateTrainingQuestions({ topic: 'challenge', count: 10 });
        if (aiQuestions && aiQuestions.length > 0) {
          setQuestions(aiQuestions);
          setLoading(false);
          setCurrentIndex(0);
          setSelectedAnswer(null);
          setShowExplanation(false);
          setAnswers([]);
          setCompleted(false);
          setPoints(0);
          setStreak(0);
          setMaxStreak(0);
          setShowStreakBonus(false);
          setStarted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } catch (err) {
        console.warn('Quiz question generation failed, offering fallback options:', err);
        setError('Unable to generate challenge questions. Please try again.');
        setLoading(false);
        return;
      }
    }

    // Offline fallback using curated question pool
    const selected = shuffleArray(quizQuestions).slice(0, 10);
    setQuestions(selected);
    setLoading(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setCompleted(false);
    setPoints(0);
    setStreak(0);
    setMaxStreak(0);
    setShowStreakBonus(false);
    setStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentQuestion = questions[currentIndex];
  const totalCorrect = answers.filter(a => a.correct).length;

  const handleSelect = (optionIndex) => {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    let newStreak = streak;
    if (isCorrect) {
      newStreak = streak + 1;
      setPoints(prev => prev + 10);
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      if (newStreak >= 2) {
        setShowStreakBonus(true);
      }
    } else {
      setStreak(0);
      setShowStreakBonus(false);
    }

    setShowExplanation(true);
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        selected: selectedAnswer,
        correct: isCorrect,
        topic: currentQuestion.topic
      }
    ]);
  };

  const handleNext = () => {
    setShowStreakBonus(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      requestAnimationFrame(() => {
        if (quizCardRef.current) {
          const top = quizCardRef.current.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      });
    } else {
      setCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (currentUser) {
        saveProgress({
          challengeAttempts: (progress?.challengeAttempts || 0) + 1,
          bestScore: Math.max(progress?.bestScore || 0, points),
          totalPoints: (progress?.totalPoints || 0) + points,
          bestStreak: Math.max(progress?.bestStreak || 0, maxStreak)
        });
      }
    }
  };

  // Start Screen
  if (!started) {
    return (
      <div className="page">
        <section className="page__hero">
          <div className="container">
            <div className="quiz-hero__icon">
              <ShieldCheck size={32} />
            </div>
            <h1 className="page__hero-title">Digital Safety Challenge</h1>
            <p className="page__hero-subtitle">
              Test your digital safety skills. Complete 10 interactive scenarios, build your streak, and earn your Digital Safety Score.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container container--narrow">
            <Link to="/training" className="checker__back">
              <ArrowLeft size={16} />
              Back
            </Link>

            <div className="quiz-start">
              <div className="quiz-start__badge">
                Challenge Mode
              </div>
              <h2 className="quiz-start__title">Are you ready to test your awareness?</h2>
              <p className="quiz-start__desc">
                Earn 10 points for each correct answer. Maintain streaks and see how well you can protect yourself and your community online.
              </p>

              <div className="quiz-start__info">
                <div className="quiz-start__stat">
                  <span className="quiz-start__stat-number">10</span>
                  <span className="quiz-start__stat-label">Questions</span>
                </div>
                <div className="quiz-start__stat">
                  <span className="quiz-start__stat-number">100</span>
                  <span className="quiz-start__stat-label">Max Points</span>
                </div>
                <div className="quiz-start__stat">
                  <span className="quiz-start__stat-number">AI</span>
                  <span className="quiz-start__stat-label">Dynamic Pool</span>
                </div>
              </div>

              <div className="quiz-start__rules">
                <div className="quiz-rule-item">
                  <span>🎯</span>
                  <span><strong>+10 Points</strong> for each correct answer</span>
                </div>
                <div className="quiz-rule-item">
                  <span>🔥</span>
                  <span><strong>Answer Streaks</strong> for consecutive correct answers</span>
                </div>
                <div className="quiz-rule-item">
                  <span>✨</span>
                  <span><strong>Dynamic Scenarios</strong> fresh, unique questions every challenge</span>
                </div>
                <div className="quiz-rule-item">
                  <span>💡</span>
                  <span><strong>Instant Feedback</strong> with actionable safety takeaways</span>
                </div>
              </div>

              {error && (
                <div style={{ margin: 'var(--space-4) 0', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-risk-critical)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                    <AlertCircle size={18} />
                    <span>Question Generation Notice</span>
                  </div>
                  <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {error}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn--primary btn--sm" onClick={() => startQuiz(false)}>
                      <RotateCcw size={14} /> Retry Generation
                    </button>
                    <button className="btn btn--secondary btn--sm" onClick={() => startQuiz(true)}>
                      Use Standard Questions
                    </button>
                  </div>
                </div>
              )}

              {!loading ? (
                <button className="btn btn--primary btn--large" onClick={() => startQuiz(false)}>
                  Start Challenge
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button className="btn btn--primary btn--large" disabled style={{ opacity: 0.85, cursor: 'wait' }}>
                  <Loader2 size={18} className="spin" />
                  Creating 10 training scenarios...
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Final Results Screen
  if (completed) {
    const finalScore = points;
    const percentage = points; // points out of 100

    let performanceLevel, performanceColor, performanceDesc;
    if (percentage >= 90) {
      performanceLevel = 'Excellent Awareness';
      performanceColor = 'var(--color-risk-low)';
      performanceDesc = 'Outstanding! You demonstrated exceptional digital safety awareness and sharp critical thinking skills.';
    } else if (percentage >= 70) {
      performanceLevel = 'Good Awareness';
      performanceColor = '#0ea5e9';
      performanceDesc = 'Well done! You have solid awareness with a few areas where you can sharpen your verification habits.';
    } else if (percentage >= 50) {
      performanceLevel = 'Needs Improvement';
      performanceColor = 'var(--color-risk-medium)';
      performanceDesc = 'You have basic awareness, but several deceptive patterns caught you off guard. Review the recommended topics below.';
    } else {
      performanceLevel = 'Keep Learning';
      performanceColor = 'var(--color-risk-critical)';
      performanceDesc = 'You need to strengthen your digital safety habits. Explore our learning guides to stay protected.';
    }

    // Find weak topics
    const topicStats = {};
    answers.forEach(a => {
      if (!topicStats[a.topic]) topicStats[a.topic] = { correct: 0, total: 0 };
      topicStats[a.topic].total++;
      if (a.correct) topicStats[a.topic].correct++;
    });

    const weakTopics = Object.entries(topicStats)
      .filter(([, stats]) => stats.correct / stats.total < 0.7)
      .map(([topic]) => topic);

    return (
      <div className="page">
        <section className="section">
          <div className="container container--narrow">
            <Link to="/training" className="checker__back">
              <ArrowLeft size={16} />
              Back
            </Link>

            <div className="quiz-results">
              <div className="quiz-results__trophy">
                <Trophy size={48} style={{ color: performanceColor }} />
              </div>
              <h1 className="quiz-results__title">Challenge Complete</h1>

              <div className="quiz-results__score-box">
                <span className="quiz-results__score-label">Your Digital Safety Score:</span>
                <div className="quiz-results__score-val" style={{ color: performanceColor }}>
                  {finalScore}<span className="quiz-results__score-max">/100</span>
                </div>
              </div>

              <div className="quiz-results__level-badge" style={{ borderColor: performanceColor, color: performanceColor }}>
                <Award size={18} />
                <span>{performanceLevel}</span>
              </div>

              <p className="quiz-results__desc">{performanceDesc}</p>

              {/* Stats Grid */}
              <div className="quiz-results__stats-grid">
                <div className="quiz-results__stat-card">
                  <span className="quiz-results__stat-num" style={{ color: 'var(--color-risk-low)' }}>
                    {totalCorrect}
                  </span>
                  <span className="quiz-results__stat-lbl">Correct Answers</span>
                </div>
                <div className="quiz-results__stat-card">
                  <span className="quiz-results__stat-num" style={{ color: 'var(--color-risk-critical)' }}>
                    {10 - totalCorrect}
                  </span>
                  <span className="quiz-results__stat-lbl">Incorrect Answers</span>
                </div>
                <div className="quiz-results__stat-card">
                  <span className="quiz-results__stat-num" style={{ color: '#f59e0b' }}>
                    {maxStreak > 0 ? `🔥 ${maxStreak}` : '0'}
                  </span>
                  <span className="quiz-results__stat-lbl">Best Streak</span>
                </div>
              </div>

              {/* Topics Needing Improvement */}
              {weakTopics.length > 0 ? (
                <div className="quiz-results__weak-box">
                  <div className="quiz-results__weak-header">
                    <AlertTriangle size={18} />
                    <h4>Recommended Topics to Improve</h4>
                  </div>
                  <p>Strengthen your knowledge in these specific areas:</p>
                  <div className="quiz-results__topic-links">
                    {weakTopics.map((topic) => (
                      <Link
                        key={topic}
                        to={TOPIC_URL_MAP[topic] || '/learn'}
                        className="quiz-results__topic-pill"
                      >
                        <BookOpen size={14} />
                        <span>Learn: {topic}</span>
                        <ArrowRight size={14} />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="quiz-results__perfect-box">
                  <Sparkles size={20} />
                  <p>Mastery demonstrated across all topics tested in this session!</p>
                </div>
              )}

              {/* Profile Save Status */}
              <div style={{ margin: 'var(--space-6) 0', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                {currentUser ? (
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-risk-low)', fontWeight: 600 }}>
                    ✓ Score & streaks saved to your <Link to="/dashboard" style={{ textDecoration: 'underline', color: 'var(--color-accent)' }}>DigitalShield Profile</Link>!
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    💡 Want to track your score history and unlock badges?{' '}
                    <Link to="/signup" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Create a free account</Link> or <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Log in</Link>.
                  </p>
                )}
              </div>

              <div className="quiz-results__actions">
                <button className="btn btn--primary" onClick={() => startQuiz(false)}>
                  <RotateCcw size={18} />
                  Play Again (Fresh Challenge)
                </button>
                <Link to="/learn" className="btn btn--secondary">
                  Explore Learning Topics
                </Link>
                <Link to="/training" className="btn btn--secondary">
                  Back to Training
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Question Screen
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="page">
      <section className="section">
        <div className="container container--narrow">
          <Link to="/training" className="checker__back">
            <ArrowLeft size={16} />
            Back
          </Link>

          {/* Header Scoreboard */}
          <div className="quiz-scoreboard">
            <div className="quiz-scoreboard__left">
              <span className="quiz-scoreboard__title">Digital Safety Challenge</span>
              <span className="quiz-scoreboard__topic">
                {currentQuestion.topic}
              </span>
            </div>

            <div className="quiz-scoreboard__right">
              {streak >= 2 && (
                <div className="quiz-streak-badge">
                  <Flame size={16} />
                  <span>{streak} Streak!</span>
                </div>
              )}
              <div className="quiz-points-pill">
                <span>{points} / 100 PTS</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="quiz-question-meta">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>+10 PTS per correct answer</span>
          </div>

          {/* Question Card */}
          <div className="quiz-question-card" ref={quizCardRef}>
            {currentQuestion.scenario && currentQuestion.scenario.trim() !== currentQuestion.question.trim() && (
              <div className="quiz-question__scenario">
                <Target size={20} className="quiz-question__scenario-icon" />
                <p className="quiz-question__scenario-text">{formatIndianCurrency(currentQuestion.scenario)}</p>
              </div>
            )}
            <h2 className="quiz-question__text">{formatIndianCurrency(currentQuestion.question)}</h2>

            <div className="quiz-options">
              {currentQuestion.options.map((option, i) => {
                let optionClass = 'practice-option';
                if (showExplanation) {
                  if (i === currentQuestion.correctAnswer) optionClass += ' practice-option--correct';
                  else if (i === selectedAnswer) optionClass += ' practice-option--incorrect';
                } else if (i === selectedAnswer) {
                  optionClass += ' practice-option--selected';
                }
                return (
                  <button
                    key={i}
                    className={optionClass}
                    onClick={() => handleSelect(i)}
                    disabled={showExplanation}
                  >
                    <span className="practice-option__letter">{String.fromCharCode(65 + i)}</span>
                    <span className="practice-option__text">{formatIndianCurrency(option)}</span>
                    {showExplanation && i === currentQuestion.correctAnswer && <CheckCircle size={18} />}
                    {showExplanation && i === selectedAnswer && i !== currentQuestion.correctAnswer && <XCircle size={18} />}
                  </button>
                );
              })}
            </div>

            {!showExplanation && (
              <button
                className="btn btn--primary btn--block"
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
              >
                Submit Answer
              </button>
            )}

            {showExplanation && (
              <div className={`practice-feedback ${isCorrect ? 'practice-feedback--correct' : 'practice-feedback--incorrect'}`}>
                <div className="practice-feedback__header">
                  {isCorrect ? (
                    <div className="quiz-feedback-correct">
                      <CheckCircle size={20} />
                      <span>Correct! +10 Points</span>
                      {showStreakBonus && (
                        <span className="quiz-streak-tag">
                          <Flame size={14} /> {streak} Streak!
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="quiz-feedback-incorrect">
                      <XCircle size={20} />
                      <span>Incorrect</span>
                    </div>
                  )}
                </div>
                <p className="practice-feedback__explanation">{formatIndianCurrency(currentQuestion.explanation)}</p>
                <button className="btn btn--primary btn--block" onClick={handleNext}>
                  {currentIndex < questions.length - 1 ? (
                    <>Next Question <ArrowRight size={18} /></>
                  ) : (
                    'View Final Score'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
