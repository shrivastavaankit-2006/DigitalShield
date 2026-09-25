import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogIn } from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../context/useAuth';
import DigitalShieldLogo from '../common/DigitalShieldLogo';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/check', label: 'Check' },
  { to: '/learn', label: 'Learn' },
  { to: '/training', label: 'Training' },
  { to: '/safety-tips', label: 'Safety Tips' },
  { to: '/community-findings', label: 'Community Findings' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  // Exact route-aware active state determination
  const isLinkActive = (to) => {
    const currentPath = location.pathname;

    if (to === '/') {
      return currentPath === '/';
    }

    if (to === '/check') {
      return currentPath === '/check' || currentPath.startsWith('/check/');
    }

    if (to === '/learn') {
      return currentPath === '/learn' || currentPath.startsWith('/learn/');
    }

    if (to === '/training') {
      return (
        currentPath === '/training' ||
        currentPath.startsWith('/training/') ||
        currentPath === '/practice' ||
        currentPath.startsWith('/practice/') ||
        currentPath === '/quiz' ||
        currentPath.startsWith('/quiz/')
      );
    }

    if (to === '/safety-tips') {
      return currentPath === '/safety-tips' || currentPath.startsWith('/safety-tips/');
    }

    if (to === '/community-findings') {
      return (
        currentPath === '/community-findings' ||
        currentPath.startsWith('/community-findings/') ||
        currentPath === '/community' ||
        currentPath.startsWith('/community/')
      );
    }

    if (to === '/dashboard') {
      return currentPath === '/dashboard';
    }

    return false;
  };

  const userInitial = currentUser
    ? (currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()
    : null;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <DigitalShieldLogo size={32} />
        </Link>

        {/* Center Desktop Navigation */}
        <div className="navbar__links navbar__links--center">
          {navLinks.map((link) => {
            const active = isLinkActive(link.to);
            const className = `navbar__link ${active ? 'navbar__link--active' : ''}`;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={className}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Desktop Actions: Theme Toggle FIRST, Dashboard at extreme right */}
        <div className="navbar__actions">
          {/* Theme Toggle Button (Comes before Dashboard) */}
          <button
            type="button"
            className="navbar__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Auth Item (Extreme right edge) */}
          {currentUser ? (
            <Link
              to="/dashboard"
              className={`navbar__link navbar__link--user ${isLinkActive('/dashboard') ? 'navbar__link--active' : ''}`}
              title="View Dashboard"
            >
              <span className="navbar__user-avatar-mini">{userInitial}</span>
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="navbar__link navbar__link--login"
              title="Log In / Sign Up"
            >
              <LogIn size={15} />
              <span>Log In</span>
            </Link>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="navbar__mobile-actions">
          <button
            type="button"
            className="navbar__theme-toggle navbar__theme-toggle--mobile"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {currentUser ? (
            <Link
              to="/dashboard"
              className="navbar__user-avatar-mini"
              onClick={closeMenu}
              title="Dashboard"
            >
              {userInitial}
            </Link>
          ) : (
            <Link
              to="/login"
              className="navbar__mobile-login-icon"
              onClick={closeMenu}
              title="Log In"
            >
              <User size={18} />
            </Link>
          )}

          <button
            className="navbar__toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${isOpen ? 'navbar__mobile--open' : ''}`}>
        <div className="navbar__mobile-links">
          {navLinks.map((link) => {
            const active = isLinkActive(link.to);
            const className = `navbar__mobile-link ${active ? 'navbar__mobile-link--active' : ''}`;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={className}
              >
                {link.label}
              </Link>
            );
          })}

          <div style={{ height: '1px', background: 'var(--color-border)', margin: 'var(--space-2) 0' }} />

          {currentUser ? (
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className={`navbar__mobile-link ${isLinkActive('/dashboard') ? 'navbar__mobile-link--active' : ''}`}
            >
              <User size={18} />
              <span>My Profile Dashboard</span>
            </Link>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link
                to="/login"
                onClick={closeMenu}
                className="btn btn--primary btn--block"
              >
                <LogIn size={16} />
                <span>Log In</span>
              </Link>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="btn btn--secondary btn--block"
              >
                <span>Create Free Profile</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
