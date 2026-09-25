import './DigitalShieldLogo.css';

export function DigitalShieldLogoMark({ size = 30, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`digitalshield-logo-mark ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dsShieldGradient" x1="4.5" y1="2.8" x2="27.5" y2="28.9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="dsInnerGlow" x1="16" y1="4" x2="16" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Outer Modern Shield */}
      <path
        d="M16 2.8C20.5 4.6 25.2 5.9 26.8 6.5C27.2 6.7 27.5 7.1 27.5 7.6C27.5 16.8 22.8 24.2 16.4 28.9C16.15 29.08 15.85 29.08 15.6 28.9C9.2 24.2 4.5 16.8 4.5 7.6C4.5 7.1 4.8 6.7 5.2 6.5C6.8 5.9 11.5 4.6 16 2.8Z"
        fill="url(#dsShieldGradient)"
      />

      {/* Subtle Inner Contour */}
      <path
        d="M16 4.8C19.6 6.3 23.5 7.4 25.1 7.9C25.2 15.5 21.4 21.9 16 26.4C10.6 21.9 6.8 15.5 6.9 7.9C8.5 7.4 12.4 6.3 16 4.8Z"
        fill="none"
        stroke="url(#dsInnerGlow)"
        strokeWidth="1.2"
      />

      {/* Centered Verification Checkmark */}
      <path
        d="M10.5 16.2L14.2 19.9L21.5 12.2"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DigitalShieldLogo({ size = 30, showWordmark = true, className = '' }) {
  return (
    <div className={`digitalshield-logo ${className}`}>
      <DigitalShieldLogoMark size={size} />
      {showWordmark && (
        <span className="digitalshield-logo__wordmark">
          <span className="digitalshield-logo__text-main">Digital</span>
          <span className="digitalshield-logo__text-accent">Shield</span>
        </span>
      )}
    </div>
  );
}
