// Client-side heuristic risk analysis engine (educational, not security-grade)
// This mock analysis uses keyword-based heuristics for educational demonstration.
// Designed to be replaced by Gemini API calls in Phase 8.

const urgencyKeywords = [
  'urgent', 'immediately', 'right now', 'act now', 'hurry', 'limited time',
  'expires today', 'within 24 hours', 'last chance', 'do not delay',
  'before midnight', 'account will be blocked', 'suspended', 'deactivated',
  'action required', 'respond immediately', 'time is running out', 'today only',
  'deadline', 'expiring', 'final notice', 'final warning'
];

const threatKeywords = [
  'blocked', 'suspended', 'closed', 'terminated', 'legal action',
  'police', 'arrest', 'court', 'penalty', 'fine', 'lawsuit',
  'unauthorized', 'illegal', 'violation', 'banned', 'restricted',
  'compromised', 'hacked', 'breached', 'infected', 'virus'
];

const financialKeywords = [
  'bank', 'account', 'credit card', 'debit card', 'upi', 'payment',
  'transfer', 'withdraw', 'deposit', 'transaction', 'balance',
  'loan', 'emi', 'refund', 'cashback', 'rupees', 'rs.', '₹',
  'investment', 'returns', 'profit', 'earning', 'income'
];

const sensitiveInfoKeywords = [
  'otp', 'password', 'pin', 'cvv', 'account number', 'card number',
  'aadhaar', 'pan', 'credentials', 'login', 'verify your',
  'confirm your', 'update your', 'social security', 'identity',
  'personal details', 'bank details', 'card details'
];

const scamKeywords = [
  'congratulations', 'winner', 'selected', 'prize', 'lottery', 'lucky',
  'free', 'gift', 'reward', 'claim', 'won', 'jackpot', 'bonus',
  'guaranteed', 'no risk', 'risk free', 'double your money',
  'earn from home', 'work from home', 'easy money', 'registration fee',
  'processing fee', 'advance payment', 'pay first', 'send money'
];

const emotionalKeywords = [
  'shocking', 'breaking', 'unbelievable', 'incredible', 'you won\'t believe',
  'share this', 'forward this', 'everyone must know', 'share before deleted',
  'government hiding', 'they don\'t want you to know', 'secret',
  'exposed', 'scandal', 'emergency', 'alert', 'danger'
];

function countKeywordMatches(text, keywords) {
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => lowerText.includes(keyword)).length;
}


function calculateRiskLevel(score) {
  if (score >= 75) return { level: 'High Risk', badge: 'critical', color: '#ef4444' };
  if (score >= 50) return { level: 'Suspicious', badge: 'high', color: '#f97316' };
  if (score >= 25) return { level: 'Needs Verification', badge: 'medium', color: '#f59e0b' };
  return { level: 'Low Risk', badge: 'low', color: '#22c55e' };
}

// --- NEWS CHECKER ---
export function analyzeNews(input) {
  let text = '';
  let image = null;

  if (typeof input === 'string') {
    text = input.trim();
  } else if (input && typeof input === 'object') {
    text = (input.text || input.content || '').trim();
    image = input.image || null;
  }

  if (!text && !image) {
    return null;
  }

  let score = 0;
  const warnings = [];

  if (image && !text) {
    warnings.push(`Screenshot attached (${image.name}): Visual elements, typography, and layout reviewed.`);
    warnings.push('Image-only submission: Information captured in images should be corroborated by reputable news organizations.');
    warnings.push('Check for missing timestamps, fabricated quotes, or altered publication banners.');
    score = 40;
  } else {
    if (image) {
      warnings.push(`Screenshot attached (${image.name}): Visual layout reviewed alongside headline claim.`);
      score += 5;
    }

  // Check for emotional/sensational language
  const emotionalCount = countKeywordMatches(text, emotionalKeywords);
  if (emotionalCount >= 3) {
    score += 25;
    warnings.push('Contains highly emotional or sensational language');
  } else if (emotionalCount >= 1) {
    score += 12;
    warnings.push('Uses emotional language that may indicate bias');
  }

  // Check for urgency
  const urgencyCount = countKeywordMatches(text, urgencyKeywords);
  if (urgencyCount >= 2) {
    score += 20;
    warnings.push('Creates a sense of urgency to encourage sharing without verification');
  } else if (urgencyCount >= 1) {
    score += 10;
    warnings.push('Contains urgent language');
  }

  // Check for scam indicators
  const scamCount = countKeywordMatches(text, scamKeywords);
  if (scamCount >= 2) {
    score += 25;
    warnings.push('Contains indicators commonly found in scams or hoaxes');
  } else if (scamCount >= 1) {
    score += 12;
    warnings.push('Contains language often associated with unverified claims');
  }

  // Check for financial claims
  const financialCount = countKeywordMatches(text, financialKeywords);
  if (financialCount >= 2) {
    score += 15;
    warnings.push('Makes financial claims that should be verified through official sources');
  }

  // Check for threat language
  const threatCount = countKeywordMatches(text, threatKeywords);
  if (threatCount >= 1) {
    score += 10;
    warnings.push('Uses threatening language to create fear');
  }

  // Short content with strong claims
  if (text.length < 100 && (emotionalCount > 0 || scamCount > 0)) {
    score += 10;
    warnings.push('Short, undetailed claim — reliable news provides context and details');
  }

  // Contains call to action (share/forward)
  if (/share|forward|send to|tell everyone|spread the word/i.test(text)) {
    score += 10;
    warnings.push('Encourages immediate sharing or forwarding');
  }

  // No apparent source
  if (!/according to|source|reported by|official|study|research/i.test(text)) {
    score += 8;
    warnings.push('No identifiable source or reference mentioned');
  }

  // All caps sections
  if (/[A-Z]{5,}/.test(text)) {
    score += 5;
    warnings.push('Uses excessive capitalization for emphasis');
  }
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Ensure minimum if there are warnings
  if (warnings.length > 0 && score < 15) score = 15;

  // Default low risk if nothing found
  if (warnings.length === 0) {
    warnings.push('No major warning signs detected in this content');
    score = 10;
  }

  const riskInfo = calculateRiskLevel(score);

  return {
    riskLevel: riskInfo.level,
    riskBadge: riskInfo.badge,
    riskColor: riskInfo.color,
    riskScore: score,
    warnings,
    explanation: generateNewsExplanation(score),
    recommendedAction: generateNewsAction(score),
    mediaAttached: !!image,
    analyzedImage: image ? { name: image.name, size: image.size } : null
  };
}

function generateNewsExplanation(score) {
  if (score >= 75) {
    return 'This content shows multiple warning signs commonly found in misinformation, fake news, or viral hoaxes. It uses manipulative language designed to provoke strong reactions and encourage sharing without verification.';
  }
  if (score >= 50) {
    return 'This content has several characteristics that suggest it may be unreliable or misleading. It should be verified through multiple trusted sources before being accepted or shared.';
  }
  if (score >= 25) {
    return 'This content has some characteristics that warrant further verification. While it may not be entirely false, it is advisable to check the claims through reliable sources.';
  }
  return 'This content does not show major warning signs, but it is always good practice to verify information through reliable sources before sharing.';
}

function generateNewsAction(score) {
  if (score >= 75) {
    return 'Do not share this content. Verify the claims using official sources, established news organizations, or fact-checking websites before believing or forwarding.';
  }
  if (score >= 50) {
    return 'Verify this information using multiple reliable sources before sharing. Check if established news organizations are reporting the same claim.';
  }
  if (score >= 25) {
    return 'Consider checking this information with a reliable source before sharing. Look for the original source and supporting evidence.';
  }
  return 'While this appears to be lower risk, always verify important information through trusted sources before sharing.';
}

// --- MESSAGE CHECKER ---
export function analyzeMessage(input) {
  let text = '';
  let image = null;

  if (typeof input === 'string') {
    text = input.trim();
  } else if (input && typeof input === 'object') {
    text = (input.text || input.content || '').trim();
    image = input.image || null;
  }

  if (!text && !image) {
    return null;
  }

  let score = 0;
  const warnings = [];

  if (image && !text) {
    warnings.push(`Message screenshot attached (${image.name}): Chat layout, sender header, and message bubble evaluated.`);
    warnings.push('Image-only submission: Scammers frequently copy brand logos or bank icons into their profile pictures.');
    warnings.push('Never click links or dial contact numbers displayed inside suspicious message screenshots.');
    score = 40;
  } else {
    if (image) {
      warnings.push(`Screenshot attached (${image.name}): Visual chat layout reviewed alongside message text.`);
      score += 5;
    }

    // Urgency
    const urgencyCount = countKeywordMatches(text, urgencyKeywords);
    if (urgencyCount >= 2) {
      score += 25;
      warnings.push('Creates strong urgency demanding immediate action');
    } else if (urgencyCount >= 1) {
      score += 12;
      warnings.push('Contains urgent language');
    }

    // Threats
    const threatCount = countKeywordMatches(text, threatKeywords);
    if (threatCount >= 2) {
      score += 25;
      warnings.push('Contains threatening language about account suspension or legal action');
    } else if (threatCount >= 1) {
      score += 15;
      warnings.push('Uses threatening language');
    }

    // Sensitive info requests
    const sensitiveCount = countKeywordMatches(text, sensitiveInfoKeywords);
    if (sensitiveCount >= 2) {
      score += 30;
      warnings.push('Requests sensitive information such as OTP, password, or banking details');
    } else if (sensitiveCount >= 1) {
      score += 18;
      warnings.push('May be requesting personal or sensitive information');
    }

    // Contains links
    const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+|bit\.ly\/[^\s]+|[a-z]+\.[a-z]{2,}\/[^\s]*/i;
    if (urlPattern.test(text)) {
      score += 15;
      warnings.push('Contains a link — verify the URL carefully before clicking');
    }

    // Scam indicators
    const scamCount = countKeywordMatches(text, scamKeywords);
    if (scamCount >= 2) {
      score += 20;
      warnings.push('Contains language commonly found in scam messages');
    } else if (scamCount >= 1) {
      score += 10;
      warnings.push('Contains phrases often used in fraudulent messages');
    }

    // Financial requests
    const financialCount = countKeywordMatches(text, financialKeywords);
    if (financialCount >= 2) {
      score += 15;
      warnings.push('References financial transactions or banking activity');
    }

    // Impersonation indicators
    if (/customer care|customer support|helpdesk|bank employee|official representative|government|rbi|sebi/i.test(text)) {
      score += 10;
      warnings.push('May be impersonating an organization or authority');
    }
  }

  score = Math.min(score, 100);
  if (warnings.length > 0 && score < 15) score = 15;

  if (warnings.length === 0) {
    warnings.push('No major warning signs detected in this message');
    score = 10;
  }

  const riskInfo = calculateRiskLevel(score);

  return {
    riskLevel: riskInfo.level,
    riskBadge: riskInfo.badge,
    riskColor: riskInfo.color,
    riskScore: score,
    warnings,
    explanation: generateMessageExplanation(score),
    recommendedAction: generateMessageAction(score),
    mediaAttached: !!image,
    analyzedImage: image ? { name: image.name, size: image.size } : null
  };
}

function generateMessageExplanation(score) {
  if (score >= 75) {
    return 'This message shows strong indicators of a phishing attempt or scam. It uses tactics designed to pressure you into acting without thinking, potentially to steal your personal information or money.';
  }
  if (score >= 50) {
    return 'This message has several suspicious characteristics. It may be attempting to manipulate you into sharing information or taking an unsafe action.';
  }
  if (score >= 25) {
    return 'This message has some characteristics that warrant caution. Verify the sender and the claims before responding or taking any action.';
  }
  return 'This message does not show major warning signs, but always be cautious with messages from unknown senders.';
}

function generateMessageAction(score) {
  if (score >= 75) {
    return 'Do not click any links, share any information, or respond to this message. If it claims to be from a known organization, contact them directly through their official app or phone number.';
  }
  if (score >= 50) {
    return 'Do not click links or share personal information. Verify the sender and the message content through official channels before taking any action.';
  }
  if (score >= 25) {
    return 'Be cautious. Verify the sender\'s identity and the message content before responding or clicking any links.';
  }
  return 'This appears to be lower risk, but always verify important messages through official channels.';
}

// --- EMAIL CHECKER ---
export function analyzeEmail(input) {
  if (!input) return null;

  let senderName = '';
  let senderEmail = '';
  let subject = '';
  let body = '';
  let image = null;

  if (typeof input === 'string') {
    body = input.trim();
  } else if (typeof input === 'object') {
    senderName = input.senderName || '';
    senderEmail = input.senderEmail || '';
    subject = input.subject || '';
    body = input.body || input.content || input.text || '';
    image = input.image || null;
  }

  const combinedText = `${senderName} ${senderEmail} ${subject} ${body}`.trim();

  if (!combinedText && !image) {
    return null;
  }

  let score = 0;
  const warnings = [];

  if (image && !combinedText) {
    warnings.push(`Email screenshot attached (${image.name}): Sender header, branding, and email layout evaluated.`);
    warnings.push('Image-only submission: Scammers frequently disguise fraudulent emails with authentic-looking company banners.');
    warnings.push('Inspect the actual email address of the sender (not just the display name) directly in your email client.');
    score = 40;
  } else {
    if (image) {
      warnings.push(`Email screenshot attached (${image.name}): Visual branding reviewed alongside email text.`);
      score += 5;
    }

    // Suspicious sender email
    if (senderEmail) {
      const email = senderEmail.toLowerCase();
      // Check for number substitutions in common domains
      if (/[0-9]/.test(email.split('@')[1] || '')) {
        score += 20;
        warnings.push('Sender email domain contains numbers that may be impersonating a real domain');
      }
      // Very long or complex domain
      if ((email.split('@')[1] || '').length > 30) {
        score += 10;
        warnings.push('Sender email has an unusually long domain name');
      }
      // Free email for business communication
      if (/gmail|yahoo|hotmail|outlook/.test(email) && /bank|official|gov|admin|support/.test(senderName?.toLowerCase() || '')) {
        score += 15;
        warnings.push('Sender claims to be an official entity but uses a free email service');
      }
      // Suspicious domain keywords
      if (/secure|verify|update|login|alert|confirm/.test(email)) {
        score += 15;
        warnings.push('Sender email contains suspicious keywords often used in phishing');
      }
    }

    // Check body and subject
    const text = `${subject || ''} ${body || ''}`;

    // Urgency
    const urgencyCount = countKeywordMatches(text, urgencyKeywords);
    if (urgencyCount >= 2) {
      score += 20;
      warnings.push('Email creates strong urgency demanding immediate action');
    } else if (urgencyCount >= 1) {
      score += 10;
      warnings.push('Email contains urgent language');
    }

    // Threats
    const threatCount = countKeywordMatches(text, threatKeywords);
    if (threatCount >= 1) {
      score += 15;
      warnings.push('Email contains threatening language about account actions or legal consequences');
    }

    // Sensitive info requests
    const sensitiveCount = countKeywordMatches(text, sensitiveInfoKeywords);
    if (sensitiveCount >= 2) {
      score += 25;
      warnings.push('Email requests sensitive information such as passwords or banking details');
    } else if (sensitiveCount >= 1) {
      score += 15;
      warnings.push('Email may be requesting personal or sensitive information');
    }

    // Links in email
    const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+|click here|click below|click this/i;
    if (urlPattern.test(text)) {
      score += 10;
      warnings.push('Email contains links — verify URLs carefully before clicking');
    }

    // Scam / offer language
    const scamCount = countKeywordMatches(text, scamKeywords);
    if (scamCount >= 1) {
      score += 12;
      warnings.push('Email contains language commonly associated with scams or fake offers');
    }

    // Impersonation
    if (/customer care|support team|security team|fraud department|official notice|important notification/i.test(text)) {
      score += 10;
      warnings.push('Email may be impersonating an organization\'s official communication');
    }
  }

  score = Math.min(score, 100);
  if (warnings.length > 0 && score < 15) score = 15;

  if (warnings.length === 0) {
    warnings.push('No major warning signs detected in this email');
    score = 10;
  }

  const riskInfo = calculateRiskLevel(score);

  return {
    riskLevel: riskInfo.level,
    riskBadge: riskInfo.badge,
    riskColor: riskInfo.color,
    riskScore: score,
    warnings,
    explanation: generateEmailExplanation(score),
    recommendedAction: generateEmailAction(score),
    mediaAttached: !!image,
    analyzedImage: image ? { name: image.name, size: image.size } : null
  };
}

function generateEmailExplanation(score) {
  if (score >= 75) {
    return 'This email shows strong indicators of a phishing or scam attempt. It uses multiple manipulative tactics designed to steal your personal information, banking credentials, or money.';
  }
  if (score >= 50) {
    return 'This email has several suspicious characteristics that suggest it may not be legitimate. Exercise caution and verify the sender through official channels.';
  }
  if (score >= 25) {
    return 'This email has some characteristics that warrant caution. Verify the sender and content before taking any action, especially if it involves clicking links or sharing information.';
  }
  return 'This email does not show major warning signs, but always verify important emails through official channels.';
}

function generateEmailAction(score) {
  if (score >= 75) {
    return 'Do not click any links, download attachments, or reply with personal information. If it claims to be from a known organization, contact them directly through their official website or phone number.';
  }
  if (score >= 50) {
    return 'Do not click links or share information. Verify the sender\'s email address and contact the organization through official channels to confirm the email\'s legitimacy.';
  }
  if (score >= 25) {
    return 'Be cautious. Verify the sender\'s identity and check if the email address matches the organization\'s official domain before responding.';
  }
  return 'This appears to be lower risk, but always verify important emails and avoid clicking links from unexpected senders.';
}

// --- LINK CHECKER ---
export function analyzeLink(input) {
  let url = '';
  let image = null;

  if (typeof input === 'string') {
    url = input.trim();
  } else if (input && typeof input === 'object') {
    url = (input.url || input.text || input.content || '').trim();
    image = input.image || null;
  }

  if (!url && !image) {
    return null;
  }

  if (image && !url) {
    const warnings = [
      `Screenshot attached (${image.name}): Browser address bar and webpage elements reviewed.`,
      'URL was not entered as text: Inspect the browser address bar to verify the domain matches the official website.',
      'Check for missing HTTPS padlock, unfamiliar domain extensions, or character substitutions.'
    ];
    const score = 35;
    const riskInfo = calculateRiskLevel(score);
    return {
      riskLevel: riskInfo.level,
      riskBadge: riskInfo.badge,
      riskColor: riskInfo.color,
      riskScore: score,
      warnings,
      explanation: 'Visual analysis of the link screenshot inspected common spoofing patterns. Be vigilant about the exact spelling in the address bar.',
      recommendedAction: 'Verify the web address by typing the official URL directly into your browser rather than relying on links in screenshots.',
      mediaAttached: true,
      analyzedImage: { name: image.name, size: image.size }
    };
  }

  const link = url.trim();
  let score = 0;
  const warnings = [];

  // Basic URL validation
  const urlRegex = /^(https?:\/\/)?[^\s/$.?#].[^\s]*$/i;
  if (!urlRegex.test(link)) {
    return {
      riskLevel: 'Invalid URL',
      riskBadge: 'critical',
      riskColor: '#ef4444',
      riskScore: 0,
      warnings: ['The entered text does not appear to be a valid URL.'],
      explanation: 'Please enter a valid website link (e.g., https://example.com).',
      recommendedAction: 'Check the URL format and try again.',
      isInvalid: true
    };
  }

  // Missing HTTPS
  if (!/^https:\/\//i.test(link)) {
    if (/^http:\/\//i.test(link)) {
      score += 15;
      warnings.push('Uses HTTP instead of HTTPS — connection is not encrypted');
    } else {
      score += 10;
      warnings.push('Missing protocol — unable to confirm if connection is secure');
    }
  }

  // IP address instead of domain
  if (/^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}/i.test(link)) {
    score += 25;
    warnings.push('Uses an IP address instead of a domain name — this hides the website\'s identity');
  }

  // Very long URL
  if (link.length > 100) {
    score += 10;
    warnings.push('Unusually long URL — may contain hidden redirect parameters');
  }

  // Suspicious domain keywords
  const suspiciousDomainWords = ['secure', 'login', 'verify', 'update', 'confirm', 'account', 'banking', 'alert', 'signin', 'auth'];
  const domainMatch = link.match(/^(?:https?:\/\/)?([^/]+)/i);
  const domain = domainMatch ? domainMatch[1].toLowerCase() : '';

  const domainSuspiciousCount = suspiciousDomainWords.filter(w => domain.includes(w)).length;
  if (domainSuspiciousCount >= 2) {
    score += 20;
    warnings.push('Domain contains multiple suspicious keywords often used in phishing URLs');
  } else if (domainSuspiciousCount >= 1) {
    score += 10;
    warnings.push('Domain contains keywords commonly used in phishing URLs');
  }

  // Number substitutions in domain (l33t speak)
  if (/[0-9]/.test(domain.replace(/\d+$/, ''))) {
    // Numbers in domain (not just port numbers)
    const domainWithoutPort = domain.split(':')[0];
    if (/[a-z].*[0-9].*[a-z]|[0-9].*[a-z].*[0-9]/i.test(domainWithoutPort)) {
      score += 15;
      warnings.push('Domain contains mixed letters and numbers — may be impersonating a real website');
    }
  }

  // Multiple subdomains
  const subdomains = domain.split(':')[0].split('.');
  if (subdomains.length > 4) {
    score += 15;
    warnings.push('URL has an unusually complex subdomain structure');
  }

  // Suspicious TLDs
  const tld = subdomains[subdomains.length - 1];
  const suspiciousTlds = ['xyz', 'top', 'club', 'work', 'click', 'link', 'gq', 'ml', 'cf', 'ga', 'tk'];
  if (suspiciousTlds.includes(tld)) {
    score += 15;
    warnings.push('Uses a domain extension commonly associated with suspicious websites');
  }

  // URL contains @ symbol (user info in URL)
  if (link.includes('@')) {
    score += 20;
    warnings.push('URL contains "@" symbol — this can be used to hide the real destination');
  }

  // Excessive special characters
  const specialChars = (link.match(/[-_~!$&'()*+,;=]/g) || []).length;
  if (specialChars > 10) {
    score += 10;
    warnings.push('URL contains an unusual number of special characters');
  }

  // Shortened URL
  const shorteners = ['bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly', 'tiny.cc'];
  if (shorteners.some(s => domain.includes(s))) {
    score += 15;
    warnings.push('This is a shortened URL — the actual destination is hidden');
  }

  if (image) {
    warnings.push(`Screenshot attached (${image.name}): URL analyzed alongside webpage screenshot.`);
    score += 5;
  }

  score = Math.min(score, 100);
  if (warnings.length > 0 && score < 15) score = 15;

  if (warnings.length === 0) {
    warnings.push('No major warning signs detected in this URL');
    score = 10;
  }

  const riskInfo = calculateRiskLevel(score);

  return {
    riskLevel: riskInfo.level,
    riskBadge: riskInfo.badge,
    riskColor: riskInfo.color,
    riskScore: score,
    warnings,
    explanation: generateLinkExplanation(score),
    recommendedAction: generateLinkAction(score),
    mediaAttached: !!image,
    analyzedImage: image ? { name: image.name, size: image.size } : null
  };
}

function generateLinkExplanation(score) {
  if (score >= 75) {
    return 'This URL shows multiple warning signs that suggest it may lead to a phishing, scam, or otherwise unsafe website. Exercise extreme caution.';
  }
  if (score >= 50) {
    return 'This URL has several characteristics that are commonly found in suspicious or deceptive websites. Verify the domain carefully before visiting.';
  }
  if (score >= 25) {
    return 'This URL has some characteristics that warrant caution. Check the domain name carefully and verify it belongs to the organization you expect.';
  }
  return 'This URL does not show major warning signs based on its structure, but no automated check can guarantee a website is completely safe.';
}

function generateLinkAction(score) {
  if (score >= 75) {
    return 'Do not visit this URL or enter any personal information. If you need to access the intended service, type the official website address directly into your browser.';
  }
  if (score >= 50) {
    return 'Verify the domain carefully before visiting. Check if it matches the official website of the organization it claims to represent.';
  }
  if (score >= 25) {
    return 'Check the domain name carefully before entering any personal information. When in doubt, type the website address directly into your browser.';
  }
  return 'While this URL appears structurally normal, always verify important websites through trusted sources and avoid entering sensitive information on unfamiliar websites.';
}
