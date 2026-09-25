import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, BookOpen, Trophy, Target, Loader2, AlertCircle } from 'lucide-react';
import practiceScenarios from '../data/practiceScenarios';
import { useAuth } from '../context/useAuth';
import { generateTrainingQuestions } from '../services/geminiService';
import { formatIndianCurrency } from '../utils/formatCurrency';
import './PracticeSession.css';

// Fisher-Yates shuffle algorithm for fallback offline scenarios
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function PracticeSession() {
  const { categoryId } = useParams();
  const category = practiceScenarios[categoryId];

  if (!category) {
    return (
      <div className="page">
        <section className="section">
          <div className="container container--narrow" style={{ textAlign: 'center' }}>
            <h1>Category Not Found</h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-4) 0' }}>
              The practice category you are looking for does not exist.
            </p>
            <Link to="/training" className="btn btn--primary">Back to Training</Link>
          </div>
        </section>
      </div>
    );
  }

  return <PracticeSessionContent key={categoryId} category={category} categoryId={categoryId} />;
}

function PracticeSessionContent({ category, categoryId }) {
  const { currentUser, progress, saveProgress } = useAuth();
  const [sessionScenarios, setSessionScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);
  const scenarioCardRef = useRef(null);

  const loadQuestions = useCallback(async (useAi = true) => {
    setLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setCompleted(false);
    setCurrentIndex(0);

    if (useAi) {
      try {
        const aiQuestions = await generateTrainingQuestions({ topic: categoryId, count: 5 });
        if (aiQuestions && aiQuestions.length > 0) {
          setSessionScenarios(aiQuestions);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Question generation failed, providing fallback option:', err);
        setError('Unable to generate practice questions. Please try again.');
        setLoading(false);
        return;
      }
    }

    // Fallback to shuffled offline question bank
    const offlineScenarios = shuffleArray(category.scenarios || []).slice(0, 5);
    setSessionScenarios(offlineScenarios);
    setLoading(false);
  }, [categoryId, category.scenarios]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      try {
        const aiQuestions = await generateTrainingQuestions({ topic: categoryId, count: 5 });
        if (isSubscribed && aiQuestions && aiQuestions.length > 0) {
          setSessionScenarios(aiQuestions);
          setLoading(false);
        }
      } catch (err) {
        if (isSubscribed) {
          console.warn('Question generation failed, providing fallback option:', err);
          setError('Unable to generate practice questions. Please try again.');
          setLoading(false);
        }
      }
    })();
    return () => {
      isSubscribed = false;
    };
  }, [categoryId]);

  const currentScenario = sessionScenarios[currentIndex];
  const isCorrect = selectedAnswer === currentScenario?.correctAnswer;
  const totalCorrect = answers.filter(a => a.correct).length;

  const handleSelect = (optionIndex) => {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !currentScenario) return;
    setShowExplanation(true);
    setAnswers([
      ...answers,
      {
        questionId: currentScenario.id,
        selected: selectedAnswer,
        correct: selectedAnswer === currentScenario.correctAnswer,
      }
    ]);
  };

  const handleNext = () => {
    if (currentIndex < sessionScenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      // Smoothly reposition viewport to top of next question
      requestAnimationFrame(() => {
        if (scenarioCardRef.current) {
          const top = scenarioCardRef.current.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      });
    } else {
      setCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (currentUser) {
        const scenarioIds = sessionScenarios.map(s => s.id);
        const existingScenarios = progress?.completedScenarios || [];
        const mergedScenarios = Array.from(new Set([...existingScenarios, ...scenarioIds]));
        const existingTopics = progress?.completedTopics || [];
        const mergedTopics = Array.from(new Set([...existingTopics, category.title]));

        saveProgress({
          completedScenarios: mergedScenarios,
          completedTopics: mergedTopics,
          totalPoints: (progress?.totalPoints || 0) + (totalCorrect * 5)
        });
      }
    }
  };

  const handleRestart = () => {
    // Generate a fresh new batch of dynamic questions
    loadQuestions(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading screen
  if (loading) {
    return (
      <div className="page">
        <section className="section">
          <div className="container container--narrow" style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
              <Loader2 size={32} className="spin" />
            </div>
            <h2 style={{ marginBottom: 'var(--space-2)' }}>Creating 5 fresh training questions...</h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 460, margin: '0 auto var(--space-6)' }}>
              Preparing realistic digital safety scenarios tailored for <strong>{category.title}</strong>.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // Error screen when no questions could be loaded
  if (error && sessionScenarios.length === 0) {
    return (
      <div className="page">
        <section className="section">
          <div className="container container--narrow" style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-risk-critical)', marginBottom: 'var(--space-4)' }}>
              <AlertCircle size={32} />
            </div>
            <h2 style={{ marginBottom: 'var(--space-2)' }}>Question Generation Error</h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 480, margin: '0 auto var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn--primary" onClick={() => loadQuestions(true)}>
                <RotateCcw size={16} /> Retry Generation
              </button>
              <button className="btn btn--secondary" onClick={() => loadQuestions(false)}>
                Use Offline Scenarios
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Score screen
  if (completed) {
    const score = totalCorrect;
    const total = sessionScenarios.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    let performanceLevel, performanceColor;
    if (percentage >= 80) { performanceLevel = 'Excellent Awareness!'; performanceColor = 'var(--color-risk-low)'; }
    else if (percentage >= 60) { performanceLevel = 'Good Understanding!'; performanceColor = 'var(--color-risk-medium)'; }
    else if (percentage >= 40) { performanceLevel = 'Needs Improvement'; performanceColor = 'var(--color-risk-high)'; }
    else { performanceLevel = 'Keep Learning & Practicing'; performanceColor = 'var(--color-risk-critical)'; }

    return (
      <div className="page">
        <section className="section">
          <div className="container container--narrow">
            <Link to="/training" className="checker__back">
              <ArrowLeft size={16} />
              Back
            </Link>

            <div className="practice-score">
              <div className="practice-score__trophy">
                <Trophy size={48} style={{ color: performanceColor }} />
              </div>
              <h1 className="practice-score__title">Practice Completed</h1>
              <div className="practice-score__circle" style={{ borderColor: performanceColor }}>
                <span className="practice-score__number" style={{ color: performanceColor }}>{score}</span>
                <span className="practice-score__total">/{total}</span>
              </div>
              <p className="practice-score__level" style={{ color: performanceColor }}>{performanceLevel}</p>
              <p className="practice-score__percentage">{percentage}% correct in this session</p>

              <div className="practice-score__breakdown">
                <div className="practice-score__stat">
                  <CheckCircle size={18} style={{ color: 'var(--color-risk-low)' }} />
                  <span>{score} correct</span>
                </div>
                <div className="practice-score__stat">
                  <XCircle size={18} style={{ color: 'var(--color-risk-critical)' }} />
                  <span>{total - score} incorrect</span>
                </div>
              </div>

              {percentage < 80 && (
                <p className="practice-score__suggestion">
                  Tip: Review the <Link to={`/learn/${categoryId === 'scam' ? 'online-scams' : categoryId}`}>learning module</Link> for this topic to improve your skills.
                </p>
              )}

              {/* Profile Save Status */}
              <div style={{ margin: 'var(--space-6) 0', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                {currentUser ? (
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-risk-low)', fontWeight: 600 }}>
                    ✓ Practice progress saved to your <Link to="/dashboard" style={{ textDecoration: 'underline', color: 'var(--color-accent)' }}>DigitalShield Profile</Link>!
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    💡 Want to save your completed scenarios and earn badges?{' '}
                    <Link to="/signup" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Create a free account</Link> or <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Log in</Link>.
                  </p>
                )}
              </div>

              <div className="practice-score__actions">
                <button className="btn btn--primary" onClick={handleRestart}>
                  <RotateCcw size={18} />
                  Practice Again (Fresh Questions)
                </button>
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

  if (!currentScenario) return null;

  return (
    <div className="page">
      <section className="section">
        <div className="container container--narrow">
          <Link to="/training" className="checker__back">
            <ArrowLeft size={16} />
            Back
          </Link>

          {/* Progress */}
          <div className="practice-progress">
            <div className="practice-progress__text">
              <span className="practice-progress__title">
                {category.title}
              </span>
              <span>Scenario {currentIndex + 1} of {sessionScenarios.length}</span>
            </div>
            <div className="practice-progress__bar">
              <div
                className="practice-progress__fill"
                style={{ width: `${((currentIndex + 1) / sessionScenarios.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Scenario */}
          <div className="practice-scenario" ref={scenarioCardRef}>
            {currentScenario.scenario && (
              <div className="practice-scenario__content">
                <Target size={22} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }} />
                <p>{formatIndianCurrency(currentScenario.scenario)}</p>
              </div>
            )}

            <h3 className="practice-scenario__question">{formatIndianCurrency(currentScenario.question)}</h3>

            <div className="practice-options">
              {currentScenario.options.map((option, i) => {
                let optionClass = 'practice-option';
                if (showExplanation) {
                  if (i === currentScenario.correctAnswer) optionClass += ' practice-option--correct';
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
                    {showExplanation && i === currentScenario.correctAnswer && <CheckCircle size={18} />}
                    {showExplanation && i === selectedAnswer && i !== currentScenario.correctAnswer && <XCircle size={18} />}
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
                    <>
                      <CheckCircle size={20} />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      <span>Incorrect Choice</span>
                    </>
                  )}
                </div>
                <p className="practice-feedback__explanation">{formatIndianCurrency(currentScenario.explanation)}</p>
                <div className="practice-feedback__lesson">
                  <BookOpen size={18} />
                  <p><strong>Safety Lesson:</strong> {formatIndianCurrency(currentScenario.safetyLesson || currentScenario.explanation)}</p>
                </div>
                <button className="btn btn--primary btn--block" onClick={handleNext}>
                  {currentIndex < sessionScenarios.length - 1 ? (
                    <>Next Scenario <ArrowRight size={18} /></>
                  ) : (
                    'View Final Results'
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
