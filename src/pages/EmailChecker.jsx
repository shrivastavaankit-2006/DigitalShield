import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Search, Loader2 } from 'lucide-react';
import { analyzeEmailContent } from '../services/analysisService';
import RiskResult from '../components/common/RiskResult';
import ImageUploader from '../components/common/ImageUploader';
import './Checker.css';

export default function EmailChecker() {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hasText = senderName.trim() || senderEmail.trim() || subject.trim() || body.trim();
    if (!hasText && !image) {
      setError('Please enter email details or upload a screenshot of the email to analyse.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysis = await analyzeEmailContent({
        senderName,
        senderEmail,
        subject,
        body,
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
    setSenderName('');
    setSenderEmail('');
    setSubject('');
    setBody('');
    setImage(null);
    setResult(null);
    setError('');
  };

  const hasContent = senderName || senderEmail || subject || body || image;

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
                <Mail size={24} />
              </div>
              <div>
                <h1 className="checker__heading">Email Check</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Check suspicious or unusual emails using text details or a screenshot
                </p>
              </div>
            </div>

            <div className="privacy-warning">
              <span>⚠️</span>
              <span>Do not enter text or upload screenshots containing passwords, OTPs, PINs, bank details, card details or other sensitive personal information.</span>
            </div>

            <form className="checker__form" onSubmit={handleSubmit}>
              <div className="checker__optional-fields">
                <div className="form-group">
                  <label className="form-label" htmlFor="sender-name">Sender Name (optional)</label>
                  <input
                    id="sender-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Customer Support"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="sender-email">Sender Email Address (optional)</label>
                  <input
                    id="sender-email"
                    type="text"
                    className="form-input"
                    placeholder="e.g. support@example-verify.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email-subject">Email Subject (optional)</label>
                <input
                  id="email-subject"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Urgent: Account Verification Required"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email-body">
                  Email Body / Content (Optional if screenshot is attached)
                </label>
                <textarea
                  id="email-body"
                  className="form-textarea"
                  placeholder="Paste the email message body here..."
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              {/* Image Upload Area */}
              <ImageUploader
                image={image}
                onImageSelect={setImage}
                onImageRemove={() => setImage(null)}
                label="Add Screenshot of the Email (Optional)"
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
                      Analysing Email...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Check Email
                    </>
                  )}
                </button>
                {hasContent && !isAnalyzing && (
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
              <span>Analysing email headers, body, and indicators...</span>
            </div>
          )}

          {result && !isAnalyzing && <RiskResult result={result} checkerType="Email" />}
        </div>
      </section>
    </div>
  );
}
