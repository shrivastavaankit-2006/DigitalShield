import { BarChart3, Newspaper, MessageSquare, AlertTriangle, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import communityData from '../data/communityData';
import { useTheme } from '../context/useTheme';
import './CommunityFindings.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const iconMap = { Newspaper, MessageSquare, AlertTriangle, ShieldAlert };

const chartColors = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#f97316'];

export default function CommunityFindings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tickColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.18)';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipTitle = isDark ? '#f8fafc' : '#0f172a';
  const tooltipBody = isDark ? '#94a3b8' : '#475569';
  const tooltipBorder = isDark ? 'rgba(148, 163, 184, 0.2)' : '#cbd5e1';
  const doughnutBorder = isDark ? '#141e33' : '#ffffff';

  const commonBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        borderColor: tooltipBorder,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context) => ` ${context.parsed.y !== undefined ? context.parsed.y : context.parsed}% respondents`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, font: { size: 11 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          font: { size: 11 },
          callback: (value) => `${value}%`
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: tickColor, padding: 16, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        borderColor: tooltipBorder,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.parsed}%`
        }
      },
    },
  };

  return (
    <div className="page">
      <section className="page__hero">
        <div className="container">
          <div className="cf-hero__icon">
            <BarChart3 size={32} />
          </div>
          <h1 className="page__hero-title">Community Findings</h1>
          <p className="page__hero-subtitle">
            Authentic insights from our verified community digital safety survey (N = 40) on misinformation, scam exposure, and cyber awareness needs.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {/* Verified Data Banner */}
          <div className="cf-sample-banner">
            <CheckCircle2 size={20} />
            <div>
              <strong>Verified Community Survey Dataset (N = {communityData.summary.totalRespondents})</strong>
              <p>{communityData.disclaimer}</p>
            </div>
          </div>

          {/* Key Findings */}
          <div className="cf-key-findings">
            {communityData.keyFindings.map((finding, i) => {
              const Icon = iconMap[finding.icon] || AlertTriangle;
              return (
                <div key={i} className="cf-key-card">
                  <Icon size={24} className="cf-key-card__icon" />
                  <span className="cf-key-card__stat">{finding.stat}</span>
                  <span className="cf-key-card__label">{finding.label}</span>
                </div>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="cf-charts-grid">
            {/* Platform Usage */}
            <div className="cf-chart-card">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">Regular Digital Platform Usage</h3>
                <span className="cf-chart-subtitle">% of respondents using each platform regularly (Multi-select)</span>
              </div>
              <div className="cf-chart-container">
                <Bar
                  data={{
                    labels: communityData.platformUsage.labels,
                    datasets: [{
                      label: communityData.platformUsage.label,
                      data: communityData.platformUsage.data,
                      backgroundColor: chartColors.slice(0, communityData.platformUsage.data.length),
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={commonBarOptions}
                />
              </div>
            </div>

            {/* Fake News Experience */}
            <div className="cf-chart-card">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">Encountered False or Misleading Posts</h3>
                <span className="cf-chart-subtitle">Have you received a message/post later found false?</span>
              </div>
              <div className="cf-chart-container">
                <Doughnut
                  data={{
                    labels: communityData.fakeNewsExperience.labels,
                    datasets: [{
                      data: communityData.fakeNewsExperience.data,
                      backgroundColor: ['#ef4444', '#10b981', '#64748b'],
                      borderColor: doughnutBorder,
                      borderWidth: 2,
                    }],
                  }}
                  options={doughnutOptions}
                />
              </div>
            </div>

            {/* Content Difficult to Spot as Fake */}
            <div className="cf-chart-card">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">Content Hardest to Identify as Fake</h3>
                <span className="cf-chart-subtitle">Categories reported most deceptively crafted (Multi-select)</span>
              </div>
              <div className="cf-chart-container">
                <Bar
                  data={{
                    labels: communityData.difficultContent.labels,
                    datasets: [{
                      label: communityData.difficultContent.label,
                      data: communityData.difficultContent.data,
                      backgroundColor: '#f59e0b',
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={commonBarOptions}
                />
              </div>
            </div>

            {/* Factors Inducing Trust */}
            <div className="cf-chart-card">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">What Makes an Online Message Believable?</h3>
                <span className="cf-chart-subtitle">Key psychological triggers reported by community (Multi-select)</span>
              </div>
              <div className="cf-chart-container">
                <Bar
                  data={{
                    labels: communityData.beliefFactors.labels,
                    datasets: [{
                      label: communityData.beliefFactors.label,
                      data: communityData.beliefFactors.data,
                      backgroundColor: '#8b5cf6',
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={commonBarOptions}
                />
              </div>
            </div>

            {/* Fraud Experience — Full Width */}
            <div className="cf-chart-card cf-chart-card--full">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">Direct or Indirect Experience With Online Fraud</h3>
                <span className="cf-chart-subtitle">Personal vs. acquaintance scam exposure across respondents</span>
              </div>
              <div className="cf-chart-container">
                <Bar
                  data={{
                    labels: communityData.fraudExperience.labels,
                    datasets: [{
                      label: communityData.fraudExperience.label,
                      data: communityData.fraudExperience.data,
                      backgroundColor: ['#ef4444', '#f97316', '#10b981', '#64748b'],
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={commonBarOptions}
                />
              </div>
            </div>

            {/* Banking / OTP Sharing Vulnerability */}
            <div className="cf-chart-card">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">OTP & Banking Details Vulnerability</h3>
                <span className="cf-chart-subtitle">Would provide OTP/details if asked by someone claiming to be from a bank?</span>
              </div>
              <div className="cf-chart-container">
                <Doughnut
                  data={{
                    labels: communityData.bankingOtpSafety.labels,
                    datasets: [{
                      data: communityData.bankingOtpSafety.data,
                      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                      borderColor: doughnutBorder,
                      borderWidth: 2,
                    }],
                  }}
                  options={doughnutOptions}
                />
              </div>
            </div>

            {/* Verification Frequency */}
            <div className="cf-chart-card">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">Information Verification Before Sharing</h3>
                <span className="cf-chart-subtitle">How often do you verify content before forwarding?</span>
              </div>
              <div className="cf-chart-container">
                <Bar
                  data={{
                    labels: communityData.verificationFrequency.labels,
                    datasets: [{
                      label: communityData.verificationFrequency.label,
                      data: communityData.verificationFrequency.data,
                      backgroundColor: ['#10b981', '#0ea5e9', '#f97316', '#3b82f6', '#ef4444'],
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={commonBarOptions}
                />
              </div>
            </div>

            {/* Confidence Level */}
            <div className="cf-chart-card">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">Confidence in Identifying Fake News & Scams</h3>
                <span className="cf-chart-subtitle">Self-rated confidence scale from 1 (Not confident) to 5 (Very confident)</span>
              </div>
              <div className="cf-chart-container">
                <Bar
                  data={{
                    labels: communityData.confidenceLevel.labels,
                    datasets: [{
                      label: communityData.confidenceLevel.label,
                      data: communityData.confidenceLevel.data,
                      backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b', '#f97316', '#ef4444'],
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={commonBarOptions}
                />
              </div>
            </div>

            {/* Learning Methods Preference */}
            <div className="cf-chart-card">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">Preferred Digital Safety Learning Methods</h3>
                <span className="cf-chart-subtitle">How respondents prefer to receive cyber safety education</span>
              </div>
              <div className="cf-chart-container">
                <Doughnut
                  data={{
                    labels: communityData.learningMethods.labels,
                    datasets: [{
                      data: communityData.learningMethods.data,
                      backgroundColor: chartColors.slice(0, communityData.learningMethods.data.length),
                      borderColor: doughnutBorder,
                      borderWidth: 2,
                    }],
                  }}
                  options={doughnutOptions}
                />
              </div>
            </div>

            {/* Topics of Interest — Full Width */}
            <div className="cf-chart-card cf-chart-card--full">
              <div className="cf-chart-header">
                <h3 className="cf-chart-title">Digital Safety Topics Communities Want to Learn</h3>
                <span className="cf-chart-subtitle">Priority areas requested by participants (Multi-select)</span>
              </div>
              <div className="cf-chart-container">
                <Bar
                  data={{
                    labels: communityData.topicsOfInterest.labels,
                    datasets: [{
                      label: communityData.topicsOfInterest.label,
                      data: communityData.topicsOfInterest.data,
                      backgroundColor: chartColors.slice(0, communityData.topicsOfInterest.data.length),
                      borderRadius: 6,
                      borderSkipped: false,
                    }],
                  }}
                  options={commonBarOptions}
                />
              </div>
            </div>
          </div>

          {/* Qualitative Community Feedback & Recommendations */}
          <div className="cf-themes-section">
            <div className="cf-section-header">
              <h2 className="cf-section-title">Community Insights & Recommendations</h2>
              <p className="cf-section-subtitle">
                Synthesized directly from open-ended survey feedback. Genuine recurring themes reflecting community concerns and educational priorities.
              </p>
            </div>

            <div className="cf-themes-grid">
              {communityData.communityThemes.map((theme, idx) => (
                <div key={idx} className="cf-theme-card">
                  <span className="cf-theme-card__tag">
                    <Sparkles size={13} />
                    {theme.prevalence}
                  </span>
                  <h4 className="cf-theme-card__title">{theme.title}</h4>
                  <p className="cf-theme-card__desc">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
