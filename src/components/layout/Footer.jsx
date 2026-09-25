import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import DigitalShieldLogo from '../common/DigitalShieldLogo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo-link">
              <DigitalShieldLogo size={28} />
            </Link>
            <p className="footer__tagline">
              Community Digital Safety Awareness Platform
            </p>
            <p className="footer__motto">
              Think Before You Click. Verify Before You Trust. Check Before You Share.
            </p>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Quick Links</h4>
            <div className="footer__links">
              <Link to="/check" className="footer__link">Check Something</Link>
              <Link to="/learn" className="footer__link">Learn</Link>
              <Link to="/training" className="footer__link">Training</Link>
              <Link to="/safety-tips" className="footer__link">Safety Tips</Link>
            </div>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Resources</h4>
            <div className="footer__links">
              <Link to="/safety-tips" className="footer__link">Safety Tips</Link>
              <Link to="/community-findings" className="footer__link">Community Findings</Link>
              <Link to="/dashboard" className="footer__link">My Profile</Link>
            </div>
          </div>
        </div>

        <div className="footer__divider"></div>

        <div className="footer__bottom">
          <p className="footer__privacy">
            This platform does not ask users to enter sensitive information such as passwords, OTPs, UPI PINs, bank details, card details or other confidential information.
          </p>
          <p className="footer__disclaimer">
            This is an educational awareness platform. It does not guarantee the detection of all threats and should not be used as a substitute for professional cybersecurity services.
          </p>
          <p className="footer__copy">
            Made with <Heart size={14} className="footer__heart" /> for community digital safety awareness
          </p>
        </div>
      </div>
    </footer>
  );
}
