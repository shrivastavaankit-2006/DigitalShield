import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Check from './pages/Check';
import NewsChecker from './pages/NewsChecker';
import MessageChecker from './pages/MessageChecker';
import EmailChecker from './pages/EmailChecker';
import LinkChecker from './pages/LinkChecker';
import Learn from './pages/Learn';
import LearnTopic from './pages/LearnTopic';
import Training from './pages/Training';
import Practice from './pages/Practice';
import PracticeSession from './pages/PracticeSession';
import SafetyTips from './pages/SafetyTips';
import Quiz from './pages/Quiz';
import CommunityFindings from './pages/CommunityFindings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Route-aware footer: Full footer is displayed ONLY on Home ('/')
function RouteAwareFooter() {
  const { pathname } = useLocation();
  if (pathname !== '/') {
    return null;
  }
  return <Footer />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/check" element={<Check />} />
            <Route path="/check/news" element={<NewsChecker />} />
            <Route path="/check/message" element={<MessageChecker />} />
            <Route path="/check/email" element={<EmailChecker />} />
            <Route path="/check/link" element={<LinkChecker />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:topicId" element={<LearnTopic />} />
            <Route path="/training" element={<Training />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:categoryId" element={<PracticeSession />} />
            <Route path="/safety-tips" element={<SafetyTips />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/community-findings" element={<CommunityFindings />} />
            <Route path="/community" element={<CommunityFindings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <RouteAwareFooter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
