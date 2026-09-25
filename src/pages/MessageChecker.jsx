import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Search, Loader2 } from 'lucide-react';
import { analyzeMessageContent } from '../services/analysisService';
import RiskResult from '../components/common/RiskResult';
import ImageUploader from '../components/common/ImageUploader';
import './Checker.css';

export default function MessageChecker() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim() && !image) {
      setError('Please enter message text or upload a screenshot to analyse.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysis = await analyzeMessageContent({
        text: content,
        image
      });
      setResult(analysis);
    } catch {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setContent('');
    setImage(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="page">
      <section className="section">
        <div className="checker">
          <Link to="/check" className="checker__back">
            <ArrowLeft size={16} />
            Back to Check
          </Link>

          <div className="checker__card">
            <div className="checker__icon-header">
              <div className="checker__icon-circle">
                <MessageSquare size={24} />
              </div>
              <div>
                <h1 className="checker__heading">Message Check</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Check SMS, WhatsApp, Telegram, and other suspicious message texts or screenshots
                </p>
              </div>
            </div>

            <div className="privacy-warning">
              <span>⚠️</span>
              <span>Do not enter text or upload screenshots containing passwords, OTPs, UPI PINs, bank details, card details or other sensitive personal information.</span>
            </div>

            <form className="checker__form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="message-content">
                  Message Text (Optional if screenshot is attached)
                </label>
                <textarea
                  id="message-content"
                  className="form-textarea"
                  placeholder="Paste the suspicious SMS, WhatsApp, or chat message here..."
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {/* Image Upload Area */}
              <ImageUploader
                image={image}
                onImageSelect={setImage}
                onImageRemove={() => setImage(null)}
                label="Add Screenshot of SMS / WhatsApp Message (Optional)"
              />

              {error && <p className="form-error">{error}</p>}

              <div className="checker__submit-row">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      Analysing Message...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Check Message
                    </>
                  )}
                </button>
                {(content || image) && !isAnalyzing && (
                  <button type="button" className="checker__clear" onClick={handleClear}>
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {isAnalyzing && (
            <div className="checker__loading-card">
              <Loader2 size={24} className="spinner" />
              <span>Analysing message content and checking for warning signs...</span>
            </div>
          )}

          {result && !isAnalyzing && <RiskResult result={result} checkerType="Message" />}
        </div>
      </section>
    </div>
  );
}
