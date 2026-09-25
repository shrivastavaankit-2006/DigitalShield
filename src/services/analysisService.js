// DigitalShield Analysis Service
// Dispatches all analysis requests directly to the secure Cloudflare Worker Gemini API.
// Strictly enforces real AI inspection: no mock, hardcoded, or random results.

import { callGeminiMultimodalAnalysis } from './geminiService.js';

// ---------------------------------------------------------------------------
// Standard Result Formatter
// ---------------------------------------------------------------------------

function formatAnalysisResult({
  imageDescription = '',
  detectedContentType = 'Unknown/unclear',
  relevanceToChecker = '',
  riskLevel = 'LOW RISK',
  riskScore = 0,
  warningSigns = [],
  explanation = '',
  recommendedAction = '',
  disclaimer = '',
  type = 'Check',
  image = null,
  // News verification fields
  verificationStatus = null,
  claim = '',
  evidenceSummary = '',
  sources = [],
  // Link safety fields
  url = '',
  finalUrl = '',
  httpStatus = null,
  contentType = '',
  pageTitle = '',
  domain = '',
  https = null,
  redirects = [],
  analysisEvidence = []
}) {
  const normalizedLevel = (riskLevel || '').toUpperCase();
  let riskBadge = 'low';
  let riskColor = '#22c55e';

  if (normalizedLevel.includes('HIGH') || normalizedLevel.includes('CRITICAL')) {
    riskBadge = 'critical';
    riskColor = '#ef4444';
  } else if (normalizedLevel.includes('SUSPICIOUS')) {
    riskBadge = 'high';
    riskColor = '#f97316';
  } else if (normalizedLevel.includes('VERIFICATION') || normalizedLevel.includes('MEDIUM')) {
    riskBadge = 'medium';
    riskColor = '#f59e0b';
  }

  const standardDisclaimer = disclaimer ||
    'This educational platform evaluates digital communication threats, phishing, and misinformation. A low risk result means no digital safety red flags were detected, not that the content is verified.';

  return {
    // 9 Required Specifications from Gemini API
    imageDescription,
    detectedContentType,
    relevanceToChecker,
    riskLevel,
    riskScore: Math.min(100, Math.max(0, Math.round(riskScore))),
    warningSigns: Array.isArray(warningSigns) ? warningSigns : [],
    explanation,
    recommendedAction,
    disclaimer: standardDisclaimer,

    // News Check verification additions
    verificationStatus,
    claim,
    evidenceSummary,
    sources: Array.isArray(sources) ? sources : [],

    // Link Check technical additions
    url,
    finalUrl,
    httpStatus,
    contentType,
    pageTitle,
    domain,
    https,
    redirects: Array.isArray(redirects) ? redirects : [],
    analysisEvidence: Array.isArray(analysisEvidence) ? analysisEvidence : [],

    // Backward-compatible UI properties
    warnings: Array.isArray(warningSigns) ? warningSigns : [],
    riskBadge,
    riskColor,
    mediaAttached: Boolean(image),
    analyzedImage: image ? {
      name: image.name,
      size: image.size,
      classification: detectedContentType
    } : null,
    checkerType: type
  };
}

// ---------------------------------------------------------------------------
// Main Analysis Entry Point (Direct to Real Gemini API via Cloudflare Worker)
// ---------------------------------------------------------------------------

export async function analyzeContent({ type, text = '', image = null }) {
  const cleanText = (text || '').trim();

  if (!cleanText && !image) {
    throw new Error('Please enter text or upload an image to analyze.');
  }

  // Call the real Gemini Multimodal API via Cloudflare Worker
  const geminiResult = await callGeminiMultimodalAnalysis({
    type,
    text: cleanText,
    image
  });

  return formatAnalysisResult({
    ...geminiResult,
    type,
    image
  });
}

// ---------------------------------------------------------------------------
// Public Checker Adapters
// ---------------------------------------------------------------------------

export async function analyzeNewsContent({ text = '', image = null }) {
  return analyzeContent({ type: 'News', text, image });
}

export async function analyzeMessageContent({ text = '', image = null }) {
  return analyzeContent({ type: 'Message', text, image });
}

export async function analyzeEmailContent({ senderName = '', senderEmail = '', subject = '', body = '', image = null }) {
  const parts = [];
  if (senderName) parts.push(`From Name: ${senderName}`);
  if (senderEmail) parts.push(`From Email: ${senderEmail}`);
  if (subject) parts.push(`Subject: ${subject}`);
  if (body) parts.push(`Body:\n${body}`);
  const combinedText = parts.join('\n').trim();

  return analyzeContent({
    type: 'Email',
    text: combinedText,
    image
  });
}

export async function analyzeLinkContent({ url = '', image = null }) {
  const cleanUrl = (url || '').trim();
  return analyzeContent({
    type: 'Link',
    text: cleanUrl,
    image
  });
}
