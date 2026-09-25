import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink,
  Globe,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import './RiskResult.css';

const riskIcons = {
  low: CheckCircle,
  medium: Info,
  high: AlertTriangle,
  critical: XCircle,
};

function getAssessmentHeading(checkerType) {
  const type = (checkerType || '').toLowerCase();
  if (type.includes('news')) return 'News Verification Assessment';
  if (type.includes('message')) return 'Message Risk Assessment';
  if (type.includes('email')) return 'Email Risk Assessment';
  if (type.includes('link')) return 'Link Safety Assessment';
  return 'Risk Assessment';
}

function getStatusBadgeClass(status) {
  const s = (status || '').toUpperCase();
  if (s.includes('SUPPORTED') || s.includes('TRUE')) return 'supported';
  if (s.includes('CONTRADICTED') || s.includes('FALSE')) return 'contradicted';
  if (s.includes('MIXED')) return 'mixed';
  return 'unverified';
}

export default function RiskResult({ result, checkerType }) {
  const [expanded, setExpanded] = useState(true);

  if (!result) return null;

  const resolvedCheckerType = checkerType || result.checkerType || 'General';
  const headingTitle = getAssessmentHeading(resolvedCheckerType);

  const Icon = riskIcons[result.riskBadge] || ShieldAlert;
  const isIrrelevant = result.relevanceToChecker && result.relevanceToChecker.toLowerCase().includes('not relevant');
  const isNews = resolvedCheckerType.toLowerCase().includes('news') || Boolean(result.verificationStatus);
  const isLink = resolvedCheckerType.toLowerCase().includes('link') || Boolean(result.url);

  return (
    <div className={`risk-result animate-scale-in risk-result--${result.riskBadge}`}>
      <div className="risk-result__header">
        <h3 className="risk-result__title">{headingTitle}</h3>
        {result.mediaAttached && result.analyzedImage && (
          <span className="risk-result__media-tag">
            📷 {result.analyzedImage.name}
          </span>
        )}
      </div>

      {/* Visual Image Understanding Card */}
      {result.imageDescription && (
        <div className={`risk-result__image-intel ${isIrrelevant ? 'risk-result__image-intel--unrelated' : ''}`}>
          <div className="risk-result__image-intel-header">
            <div className="risk-result__image-intel-title">
              <Eye size={16} />
              <span>Visual Image Understanding</span>
            </div>
            <div className="risk-result__image-intel-badges">
              {result.detectedContentType && (
                <span className="risk-result__type-pill">
                  Type: <strong>{result.detectedContentType}</strong>
                </span>
              )}
              {result.relevanceToChecker && (
                <span className={`risk-result__relevance-pill ${isIrrelevant ? 'risk-result__relevance-pill--unrelated' : 'risk-result__relevance-pill--relevant'}`}>
                  {result.relevanceToChecker}
                </span>
              )}
            </div>
          </div>

          <div className="risk-result__image-desc-box">
            <p className="risk-result__image-desc">
              <strong>Observed Content:</strong> {result.imageDescription}
            </p>
          </div>

          {isIrrelevant && (
            <div className="risk-result__unrelated-notice">
              <span>💡</span>
              <span>This image does not contain content relevant to this checker. The system evaluated the actual image and did not invent artificial warning signs.</span>
            </div>
          )}
        </div>
      )}

      {/* News Check: Real Verification Result Card */}
      {isNews && result.verificationStatus && (
        <div className="risk-result__verification-card">
          <div className="risk-result__verification-header">
            <div className="risk-result__verification-title">
              <Compass size={16} />
              <span>VERIFICATION RESULT</span>
            </div>
            <span className={`risk-result__status-badge risk-result__status-badge--${getStatusBadgeClass(result.verificationStatus)}`}>
              {result.verificationStatus}
            </span>
          </div>

          {result.claim && (
            <div className="risk-result__claim-container">
              <span className="risk-result__sublabel">Claim:</span>
              <blockquote className="risk-result__claim-quote">
                "{result.claim}"
              </blockquote>
            </div>
          )}

          {result.evidenceSummary && (
            <div className="risk-result__evidence-container">
              <span className="risk-result__sublabel">Evidence:</span>
              <p className="risk-result__evidence-body">{result.evidenceSummary}</p>
            </div>
          )}

          <div className="risk-result__sources-container">
            <span className="risk-result__sublabel">Sources:</span>
            {result.sources && result.sources.length > 0 ? (
              <ul className="risk-result__sources-list">
                {result.sources.map((source, idx) => (
                  <li key={idx} className="risk-result__source-item">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="risk-result__source-link"
                    >
                      <ExternalLink size={14} className="risk-result__source-icon" />
                      <span className="risk-result__source-title">{source.title || source.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="risk-result__sources-empty">
                No external web grounding sources returned.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Link Check: Real Server-Side Inspection Card */}
      {isLink && result.url && (
        <div className="risk-result__link-card">
          <div className="risk-result__link-header">
            <div className="risk-result__link-title">
              <Globe size={16} />
              <span>URL & TECHNICAL INSPECTION</span>
            </div>
            <div className="risk-result__link-badges">
              {result.https !== null && (
                <span className={`risk-result__tech-badge ${result.https ? 'risk-result__tech-badge--secure' : 'risk-result__tech-badge--insecure'}`}>
                  {result.https ? 'HTTPS Encrypted' : 'HTTP Unencrypted'}
                </span>
              )}
              {result.httpStatus !== null && result.httpStatus !== undefined && (
                <span className="risk-result__tech-badge risk-result__tech-badge--status">
                  Status {result.httpStatus}
                </span>
              )}
            </div>
          </div>

          <div className="risk-result__link-meta-list">
            <div className="risk-result__link-meta-row">
              <span className="risk-result__meta-label">Submitted URL:</span>
              <code className="risk-result__meta-code">{result.url}</code>
            </div>
            {result.finalUrl && result.finalUrl !== result.url && (
              <div className="risk-result__link-meta-row">
                <span className="risk-result__meta-label">Final Destination:</span>
                <code className="risk-result__meta-code risk-result__meta-code--redirected">{result.finalUrl}</code>
              </div>
            )}
            {result.pageTitle && (
              <div className="risk-result__link-meta-row">
                <span className="risk-result__meta-label">Page Title:</span>
                <span className="risk-result__meta-title">{result.pageTitle}</span>
              </div>
            )}
          </div>

          {result.analysisEvidence && result.analysisEvidence.length > 0 && (
            <div className="risk-result__tech-evidence">
              <span className="risk-result__sublabel">Technical Evidence:</span>
              <ul className="risk-result__tech-evidence-list">
                {result.analysisEvidence.map((item, idx) => (
                  <li key={idx} className="risk-result__tech-evidence-item">
                    <CheckCircle2 size={14} className="risk-result__tech-check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Level & Score Row */}
      <div className="risk-result__level-row">
        <div className={`risk-badge risk-badge--${result.riskBadge}`}>
          <Icon size={16} />
          {result.riskLevel}
        </div>
        <div className="risk-result__score">
          <div className="risk-result__score-label">Risk Score</div>
          <div className="risk-result__score-value" style={{ color: result.riskColor }}>
            {result.riskScore}<span className="risk-result__score-max">/100</span>
          </div>
        </div>
      </div>

      {/* Score Bar */}
      <div className="risk-result__bar-container">
        <div
          className="risk-result__bar"
          style={{
            width: `${Math.max(result.riskScore, 2)}%`,
            background: result.riskColor,
          }}
        />
      </div>

      {/* Warning Signs */}
      {result.warningSigns && result.warningSigns.length > 0 ? (
        <div className="risk-result__section">
          <button
            type="button"
            className="risk-result__section-toggle"
            onClick={() => setExpanded(!expanded)}
          >
            <ShieldAlert size={18} />
            <span>Warning Signs ({result.warningSigns.length})</span>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {expanded && (
            <ul className="risk-result__warnings">
              {result.warningSigns.map((warning, index) => (
                <li key={index} className="risk-result__warning">
                  <AlertTriangle size={14} style={{ color: result.riskColor, flexShrink: 0 }} />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="risk-result__section" style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-risk-low)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            <CheckCircle size={16} />
            <span>No specific warning signs or digital threat patterns identified</span>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="risk-result__explanation">
        <h4>{result.riskBadge === 'low' ? 'Assessment & Findings' : 'Why This May Be Risky'}</h4>
        <p>{result.explanation}</p>
      </div>

      {/* Recommended Action */}
      <div className="risk-result__action">
        <h4>{result.riskBadge === 'low' ? 'Recommended Guidance' : 'What Should You Do?'}</h4>
        <p>{result.recommendedAction}</p>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Important:</strong> {result.disclaimer || 'This result is an educational risk assessment and does not guarantee that the content is genuine or harmful. Always verify information through trusted sources.'}
        </span>
      </div>
    </div>
  );
}
