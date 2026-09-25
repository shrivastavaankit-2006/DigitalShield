// Community Findings — Verified Field Survey Dataset (N = 40)
// Source: cep.xlsx (Community Digital Safety Awareness Survey)
// All calculations are mathematically verified against the 40 valid survey responses.
// Zero personal identifiable information (PII) is included.

const communityData = {
  dataSource: {
    file: 'cep.xlsx',
    totalRespondents: 40,
    validResponseRate: '100%',
    methodology: 'Community field survey covering digital behavior, misinformation encounters, scam exposure, and safety education needs.'
  },

  disclaimer: 'This section presents authentic field findings from our Community Digital Safety Survey (N = 40 respondents). All metrics, percentages, and insights are derived directly from primary survey data.',

  summary: {
    totalRespondents: 40,
    fraudExposure: '80.0%',
    fakeNewsEncountered: '62.5%',
    suspiciousContactReceived: '60.0%',
    otpVulnerable: '47.5%',
    supportAwareness: '67.5%'
  },

  // Key findings summary cards (displayed at top of Community Findings)
  keyFindings: [
    {
      stat: '80.0%',
      label: 'have experienced an online scam or fraud directly (47.5%) or through an acquaintance (32.5%)',
      icon: 'ShieldAlert'
    },
    {
      stat: '62.5%',
      label: 'have encountered social media posts or messages later confirmed to be false or misleading',
      icon: 'Newspaper'
    },
    {
      stat: '47.5%',
      label: 'are vulnerable to banking scams (35.0% would share OTP/banking details with callers claiming to be from a bank, 12.5% unsure)',
      icon: 'AlertTriangle'
    },
    {
      stat: '67.5%',
      label: 'affirm that digital safety awareness programs effectively help avoid scams and misinformation',
      icon: 'MessageSquare'
    }
  ],

  // Demographics: Age distribution
  ageDistribution: {
    labels: ['18–25 (72.5%)', '41–60 (15.0%)', 'Below 18 (12.5%)'],
    data: [72.5, 15.0, 12.5],
    counts: [29, 6, 5],
    label: 'Percentage of Respondents (%)'
  },

  // Demographics: Occupation
  occupationDistribution: {
    labels: ['Students (70.0%)', 'Employed (15.0%)', 'Homemakers (12.5%)', 'Retired (2.5%)'],
    data: [70.0, 15.0, 12.5, 2.5],
    counts: [28, 6, 5, 1],
    label: 'Percentage of Respondents (%)'
  },

  // Digital platform usage (multi-select, % of 40 respondents)
  platformUsage: {
    labels: ['WhatsApp', 'Instagram', 'YouTube', 'UPI / Net Banking', 'Facebook', 'Shopping Apps', 'Other'],
    data: [80.0, 70.0, 65.0, 42.5, 40.0, 20.0, 5.0],
    counts: [32, 28, 26, 17, 16, 8, 2],
    label: 'Usage Rate (% of Respondents)'
  },

  // Experience with fake news / misleading information
  fakeNewsExperience: {
    labels: ['Encountered Fake News (62.5%)', 'Not Encountered (25.0%)', 'Not Sure (12.5%)'],
    data: [62.5, 25.0, 12.5],
    counts: [25, 10, 5],
    label: 'Percentage of Respondents (%)'
  },

  // Frequency of verifying information before sharing
  verificationFrequency: {
    labels: ['Always', 'Sometimes', 'Rarely', 'Often', 'Never'],
    data: [40.0, 20.0, 20.0, 17.5, 2.5],
    counts: [16, 8, 8, 7, 1],
    label: 'Percentage of Respondents (%)'
  },

  // Content most difficult to identify as fake (multi-select, % of 40 respondents)
  difficultContent: {
    labels: ['News Articles', 'Videos / Reels', 'Social Media Posts', 'WhatsApp Forwards', 'Health Info', 'Govt Schemes', 'Offers & Ads'],
    data: [55.0, 52.5, 42.5, 42.5, 37.5, 35.0, 30.0],
    counts: [22, 21, 17, 17, 15, 14, 12],
    label: 'Identification Difficulty (% of Respondents)'
  },

  // Factors that make respondents believe online messages (multi-select, % of 40 respondents)
  beliefFactors: {
    labels: ['Shared by Friend/Family', 'Looks Professional', 'Contains Image/Video', 'Claims Official Source', 'High Likes/Shares', 'Checks Source First', 'Creates Urgency/Fear'],
    data: [55.0, 47.5, 37.5, 37.5, 37.5, 15.0, 7.5],
    counts: [22, 19, 15, 15, 15, 6, 3],
    label: 'Belief Factor (% of Respondents)'
  },

  // Experience with online scams or fraud (self or known)
  fraudExperience: {
    labels: [
      'Personal Experience (47.5%)',
      'Acquaintance Experienced (32.5%)',
      'No Fraud Experienced (12.5%)',
      'Not Sure / Prefer Not to Say (7.5%)'
    ],
    data: [47.5, 32.5, 12.5, 7.5],
    counts: [19, 13, 5, 3],
    label: 'Percentage of Respondents (%)'
  },

  // Received suspicious SMS, email, WhatsApp message, or phone call
  suspiciousContact: {
    labels: ['Received Suspicious Contact (60.0%)', 'Never Received (22.5%)', 'Not Sure (17.5%)'],
    data: [60.0, 22.5, 17.5],
    counts: [24, 9, 7],
    label: 'Percentage of Respondents (%)'
  },

  // Would provide OTP/banking info if requested by someone claiming to be from a bank
  bankingOtpSafety: {
    labels: ['Would Refuse / Safe (52.5%)', 'Would Provide OTP / At Risk (35.0%)', 'Uncertain / Vulnerable (12.5%)'],
    data: [52.5, 35.0, 12.5],
    counts: [21, 14, 5],
    label: 'Percentage of Respondents (%)'
  },

  // Action taken before clicking unknown links
  linkClickBehavior: {
    labels: ['Check link/sender first (47.5%)', 'Ask someone about it (35.0%)', 'Ignore or delete it (7.5%)', 'Click immediately (5.0%)', 'Not sure (5.0%)'],
    data: [47.5, 35.0, 7.5, 5.0, 5.0],
    counts: [19, 14, 3, 2, 2],
    label: 'Percentage of Respondents (%)'
  },

  // Confidence in identifying fake news or suspicious online messages (1 to 5 scale)
  confidenceLevel: {
    labels: ['5 - Very Confident', '4 - Confident', '3 - Neutral', '2 - Low Confidence', '1 - Not Confident at All'],
    data: [35.0, 22.5, 25.0, 7.5, 10.0],
    counts: [14, 9, 10, 3, 4],
    averageScore: '3.65 / 5.0',
    label: 'Percentage of Respondents (%)'
  },

  // Topics respondents want to learn more about (multi-select, % of 40 respondents)
  topicsOfInterest: {
    labels: [
      'Fake News & Misinformation',
      'UPI / Payment Safety',
      'Phishing & Suspicious Links',
      'How to Verify Online Info',
      'Online Scams & Fraud',
      'Social Media Safety',
      'Password & Account Security',
      'Personal Data Protection'
    ],
    data: [60.0, 50.0, 47.5, 45.0, 45.0, 37.5, 37.5, 35.0],
    counts: [24, 20, 19, 18, 18, 15, 15, 14],
    label: 'Percentage Interested (%)'
  },

  // Preferred learning methods for digital safety
  learningMethods: {
    labels: [
      'Awareness Sessions (37.5%)',
      'Practical Demonstrations (15.0%)',
      'Short Videos (15.0%)',
      'Mobile/Web Application (12.5%)',
      'Posters & Pamphlets (10.0%)',
      'Interactive Quizzes (7.5%)',
      'WhatsApp Tips (2.5%)'
    ],
    data: [37.5, 15.0, 15.0, 12.5, 10.0, 7.5, 2.5],
    counts: [15, 6, 6, 5, 4, 3, 1],
    label: 'Preferred Method (%)'
  },

  // Qualitative community feedback themes synthesized from open-ended responses
  // Zero PII included: pure synthesized themes and actionable community recommendations
  communityThemes: [
    {
      title: 'Practical Scenarios & Real-World Demos',
      description: 'Participants strongly requested incorporating real-world scam walkthroughs, live fake website inspections, and hands-on demonstrations into sessions to make warning signs tangible.',
      prevalence: 'High demand across respondents'
    },
    {
      title: 'Banking, UPI & OTP Confidentiality',
      description: 'Given that 47.5% of respondents are vulnerable to OTP or banking solicitations, community members stressed the urgent need for clear guidance against sharing credentials, OTPs, or clicking fake customer-care contacts.',
      prevalence: 'Frequent community concern'
    },
    {
      title: 'Pre-Click Link Verification & Fraud Reporting',
      description: 'Respondents highlighted the importance of learning how to inspect suspicious URLs before clicking, recognizing fabricated WhatsApp forwards, and navigating official reporting portals for cyber fraud.',
      prevalence: 'Key skill gap identified'
    },
    {
      title: 'Regular Community & Campus Outreach',
      description: 'Community members advocated for recurring digital safety drives in colleges, local neighborhoods, and residential communities, complemented by digestible safety micro-tips distributed via messaging apps.',
      prevalence: 'Widely suggested expansion'
    },
    {
      title: 'Password Hygiene & Social Media Privacy',
      description: 'Feedback highlighted the need for straightforward education on setting unique, resilient passwords for separate accounts and preventing excessive exposure of personal data on social platforms.',
      prevalence: 'Essential foundation'
    }
  ]
};

export default communityData;
