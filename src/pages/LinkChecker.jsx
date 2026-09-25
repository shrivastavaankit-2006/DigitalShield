import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, Search, Loader2 } from 'lucide-react';
import { analyzeLinkContent } from '../services/analysisService';
import RiskResult from '../components/common/RiskResult';
import ImageUploader from '../components/common/ImageUploader';
import './Checker.css';

export default function LinkChecker() {
  const [url, setUrl] = useState('');
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim() && !image) {
      setError('Please enter a website link or upload a screenshot to analyse.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysis = await analyzeLinkContent({
        url,
        image
      });

      if (analysis.isInvalid && !image) {
        setError('Please enter a valid website link (e.g., https://example.com).');
        setIsAnalyzing(false);
        return;
      }

      setResult(analysis);
    } catch {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setUrl('');
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
                <LinkIcon size={24} />
              </div>
              <div>
                <h1 className="checker__heading">Link Check</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Check suspicious website links, URLs, or screenshots of web pages
                </p>
              </div>
            </div>

            <div className="privacy-warning">
              <span>⚠️</span>
              <span>Do not enter URLs or upload screenshots containing passwords, OTPs, PINs, bank details, card details or other sensitive personal information.</span>
            </div>

            <form className="checker__form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="url-input">
                  Website Link / URL (Optional if screenshot is attached)
                </label>
                <input
                  id="url-input"
                  type="text"
                  className="form-input"
                  placeholder="Enter or paste a website link (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {/* Image Upload Area */}
              <ImageUploader
                image={image}
                onImageSelect={setImage}
                onImageRemove={() => setImage(null)}
                label="Add Screenshot of Webpage / Message with Link (Optional)"
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
                      Analysing Link...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Check Link
                    </>
                  )}
                </button>
                {(url || image) && !isAnalyzing && (
                  <button type="button" className="checker__clear" onClick={handleClear}>
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="disclaimer" style={{ marginTop: 'var(--space-6)' }}>
              <span>
                <strong>Note:</strong> This checker safely inspects URL structure, redirects, HTTP response status, and page security indicators via secure server-side analysis. Always verify important websites through official bookmarks or search engines.
              </span>
            </div>
          </div>

          {isAnalyzing && (
            <div className="checker__loading-card">
              <Loader2 size={24} className="spinner" />
              <span>Analysing link structure, redirects, and page security...</span>
            </div>
          )}

          {result && !isAnalyzing && <RiskResult result={result} checkerType="Link" />}
        </div>
      </section>
    </div>
  );
}
