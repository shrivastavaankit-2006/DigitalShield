// Educational content for all 6 learning topics
// Structure is clean for future multilingual support — just swap content strings

const learnTopics = [
  {
    id: 'fake-news',
    title: 'Fake News & Misinformation',
    icon: 'Newspaper',
    shortDescription: 'Learn how to identify false information, misleading claims, and viral hoaxes before sharing them.',
    sections: [
      {
        title: 'What is Fake News?',
        content: 'Fake news refers to false or misleading information presented as real news. It is often created to influence opinions, generate clicks, or cause confusion. Fake news can appear on social media, messaging apps, websites, and even in forwarded messages from friends and family.'
      },
      {
        title: 'What is Misinformation?',
        content: 'Misinformation is incorrect or misleading information that is spread without the intention to cause harm. People may share it because they genuinely believe it is true. However, even unintentional sharing of false information can cause real damage to individuals and communities.'
      },
      {
        title: 'How Misinformation Spreads',
        content: 'Misinformation spreads quickly through social media shares, WhatsApp forwards, viral posts, and group messages. People tend to share content that triggers strong emotions such as anger, fear, or excitement — often without checking if it is true. The speed of digital communication means a single false claim can reach millions of people in hours.'
      },
      {
        title: 'Why People Believe False Information',
        content: 'People may believe false information because it confirms what they already think (confirmation bias), it comes from someone they trust, it uses emotional or shocking language, or it looks like a legitimate news report. Repeated exposure to the same false claim can also make it seem more believable over time.'
      }
    ],
    warningSignsTitle: 'Warning Signs of Fake News',
    warningSigns: [
      'Sensational or shocking headlines designed to grab attention',
      'No clear source, author, or publication date mentioned',
      'Emotional language intended to provoke anger, fear, or excitement',
      'Claims that seem too good or too bad to be true',
      'Images that do not match the story or look manipulated',
      'Content shared through forwarded messages without verification',
      'Pressure to share the content immediately',
      'No other reliable news sources reporting the same story'
    ],
    dos: [
      'Always check the original source of the information',
      'Compare the claim with multiple reliable news sources',
      'Look for the publication date — old news may be shared as new',
      'Check if the author or organization is credible',
      'Read beyond the headline — the full content may tell a different story',
      'Use fact-checking websites to verify viral claims',
      'Ask yourself: "Is there strong evidence for this claim?"'
    ],
    donts: [
      'Do not share information without verifying it first',
      'Do not believe something just because it has many shares or likes',
      'Do not forward messages that create panic or fear without checking',
      'Do not trust information only because it came from a friend or family member',
      'Do not rely on a single source for important information',
      'Do not ignore your doubts — if something feels wrong, investigate'
    ]
  },
  {
    id: 'phishing',
    title: 'Phishing',
    icon: 'Fish',
    shortDescription: 'Understand how attackers use fake messages, emails, and websites to steal your personal information.',
    sections: [
      {
        title: 'What is Phishing?',
        content: 'Phishing is a type of online fraud where criminals try to trick you into giving away personal or financial information. They pretend to be a trusted organization — such as your bank, a government agency, or a popular website — and contact you through emails, SMS, WhatsApp messages, or fake websites.'
      },
      {
        title: 'How Phishing Works',
        content: 'Phishing typically starts with a message that creates urgency or fear. For example, you might receive a message saying your bank account will be blocked unless you click a link immediately. The link takes you to a fake website that looks like the real one. If you enter your login details, the criminals capture them and can access your real account.'
      },
      {
        title: 'Common Phishing Tactics',
        content: 'Criminals use various methods including fake bank alerts, fake login pages for popular services, fake delivery notifications, fake prize or lottery winning messages, fake job offers requiring upfront fees, and messages pretending to be from customer support asking for your account details.'
      }
    ],
    warningSignsTitle: 'Warning Signs of Phishing',
    warningSigns: [
      'Urgent messages demanding immediate action',
      'Threats of account suspension, legal action, or penalties',
      'Requests for OTP, password, PIN, or bank details',
      'Messages from unknown or suspicious senders',
      'Links that look slightly different from official website addresses',
      'Emails with poor grammar, spelling mistakes, or unusual formatting',
      'Offers that seem too good to be true',
      'Pressure to act quickly without thinking'
    ],
    dos: [
      'Verify the sender before responding to any message',
      'Contact the organization directly using their official number or app',
      'Check the URL carefully before entering any information',
      'Use official banking apps instead of clicking links in messages',
      'Report suspicious messages to the organization being impersonated',
      'Enable two-factor authentication on your important accounts'
    ],
    donts: [
      'Never share your OTP, password, or PIN with anyone',
      'Never click on links in unexpected messages',
      'Never enter personal information on websites you reached through a message link',
      'Never trust a caller or message that asks for your banking credentials',
      'Never download attachments from unknown senders',
      'Never respond to messages asking you to "verify" your account through a link'
    ]
  },
  {
    id: 'online-scams',
    title: 'Online Scams',
    icon: 'AlertTriangle',
    shortDescription: 'Recognise common online scams including fake job offers, lottery frauds, and payment scams.',
    sections: [
      {
        title: 'What are Online Scams?',
        content: 'Online scams are fraudulent schemes designed to steal money or personal information from internet users. Scammers use various techniques to gain trust and exploit emotions such as greed, fear, or urgency. These scams can happen through websites, social media, messaging apps, phone calls, or emails.'
      },
      {
        title: 'Common Types of Online Scams',
        content: 'Common scams include fake job offers that require an upfront fee, lottery or prize scams claiming you have won money, investment scams promising unrealistically high returns, customer support scams where someone pretends to help you, fake government scheme scams, and UPI or payment scams that trick you into sending money.'
      },
      {
        title: 'How Scammers Gain Trust',
        content: 'Scammers often create professional-looking websites, use official-sounding language, create fake social media profiles, provide fake references or testimonials, and may even make small initial payments to gain your trust before asking for larger amounts.'
      }
    ],
    warningSignsTitle: 'Warning Signs of Scams',
    warningSigns: [
      'Promises of easy money or unrealistic returns',
      'Requests for upfront payment to receive a reward or job',
      'Pressure to act quickly or keep the opportunity secret',
      'Requests for personal or financial information',
      'Unsolicited contact from unknown individuals or companies',
      'Deals that seem too good to be true',
      'Requests to pay through unusual methods (gift cards, crypto, direct transfer)',
      'Lack of verifiable company information or physical address'
    ],
    dos: [
      'Research any company or offer before sending money',
      'Verify job offers through the official company website',
      'Consult trusted family members or friends before making financial decisions',
      'Report scams to the relevant authorities',
      'Use secure and traceable payment methods',
      'Trust your instincts — if something feels wrong, it probably is'
    ],
    donts: [
      'Never pay money upfront to receive a prize, job, or reward',
      'Never share financial details with unknown people',
      'Never invest money based only on social media advertisements',
      'Never transfer money to someone you have not verified',
      'Never download unknown apps that ask for banking permissions',
      'Never believe guaranteed high-return investment schemes'
    ]
  },
  {
    id: 'suspicious-links',
    title: 'Suspicious Links',
    icon: 'Link',
    shortDescription: 'Learn how to inspect website links and URLs before clicking them.',
    sections: [
      {
        title: 'Why Links Can Be Dangerous',
        content: 'Clicking on a suspicious link can take you to a fake website designed to steal your information, download harmful software onto your device, or trick you into entering personal details. Many online frauds start with a single click on a deceptive link.'
      },
      {
        title: 'How to Inspect a URL',
        content: 'Before clicking any link, look at the full URL carefully. Check the domain name (the main part of the address). For example, "www.yourbank.com" is different from "www.yourbank-security.com" or "www.yourbannk.com". Small changes in spelling are often used to create fake websites that look real.'
      },
      {
        title: 'Why Domain Names Matter',
        content: 'The domain name is the most important part of a URL. Fake websites often use domain names that are very similar to real ones — with added words, changed letters, or different extensions. For example, "secure-login-bank.com" is not the same as your bank\'s actual website. Always verify the domain before entering any information.'
      }
    ],
    warningSignsTitle: 'Warning Signs of Suspicious Links',
    warningSigns: [
      'Misspelled domain names (e.g., "amaz0n.com" instead of "amazon.com")',
      'Very long URLs with many random characters',
      'URLs that use IP addresses instead of domain names',
      'Links that start with "http://" instead of "https://"',
      'Shortened URLs that hide the actual destination',
      'Links received from unknown senders or unexpected messages',
      'URLs with extra words like "secure", "login", "verify" added to known brands',
      'Pop-up windows asking for personal information'
    ],
    dos: [
      'Hover over links to see the actual URL before clicking',
      'Type important website addresses directly into your browser',
      'Look for HTTPS and the padlock icon on websites where you enter information',
      'Verify shortened links using URL expansion tools',
      'Bookmark important websites and access them from bookmarks',
      'Check for consistent and professional website design'
    ],
    donts: [
      'Do not click links in messages from unknown senders',
      'Do not enter personal information on websites reached through links in messages',
      'Do not trust a website just because it looks professional',
      'Do not ignore browser security warnings',
      'Do not download files from websites you reached through suspicious links',
      'Do not trust links shared in group messages without verification'
    ]
  },
  {
    id: 'social-media-safety',
    title: 'Social Media Safety',
    icon: 'Users',
    shortDescription: 'Protect yourself from fake profiles, misleading posts, and social media manipulation.',
    sections: [
      {
        title: 'Risks on Social Media',
        content: 'Social media platforms can be used to spread misinformation, create fake profiles, run scams, and manipulate public opinion. While social media is a valuable tool for communication and information, it is important to be aware of the risks and use these platforms safely.'
      },
      {
        title: 'Fake Profiles and Impersonation',
        content: 'Anyone can create a social media profile using someone else\'s name and photos. Fake profiles are used to build trust, extract information, run romance scams, or spread false content. Verified badges can help identify authentic accounts, but they are not always present.'
      },
      {
        title: 'Misleading Posts and Viral Content',
        content: 'Content that goes viral on social media is not necessarily true. Posts with many likes, shares, and comments may still contain false or misleading information. Popularity does not equal accuracy. Always verify important claims before believing or sharing them.'
      }
    ],
    warningSignsTitle: 'Warning Signs on Social Media',
    warningSigns: [
      'Profiles with very few posts, friends, or activity history',
      'Accounts that were recently created',
      'Unsolicited friend requests or direct messages from strangers',
      'Posts that create extreme emotions — outrage, fear, or excitement',
      'Giveaway promotions that ask for personal information',
      'Accounts impersonating celebrities, brands, or officials',
      'Content with dramatic claims but no reliable source',
      'Requests for money, donations, or personal details through messages'
    ],
    dos: [
      'Review your privacy settings regularly',
      'Be selective about accepting friend requests',
      'Verify viral information through reliable sources',
      'Report fake profiles and suspicious accounts',
      'Think before posting personal information publicly',
      'Use strong, unique passwords for your social media accounts'
    ],
    donts: [
      'Do not share personal details publicly (address, phone number, ID)',
      'Do not accept friend requests from people you do not know',
      'Do not trust every message, even from known contacts (accounts can be hacked)',
      'Do not participate in "giveaways" that ask for your bank details',
      'Do not forward unverified viral content',
      'Do not share your location with unknown people'
    ]
  },
  {
    id: 'personal-info-safety',
    title: 'Personal Information Safety',
    icon: 'Shield',
    shortDescription: 'Learn what information you should never share online and how to protect your sensitive data.',
    sections: [
      {
        title: 'Why Personal Information Protection Matters',
        content: 'Your personal information is valuable. Criminals can use it to access your bank accounts, make purchases in your name, create fake identities, or commit various types of fraud. Protecting your personal information is one of the most important steps in staying safe online.'
      },
      {
        title: 'Information You Should Never Share',
        content: 'Never share your One-Time Password (OTP), banking password, ATM PIN, UPI PIN, credit or debit card details (including CVV), bank account numbers, Aadhaar number, PAN details, or login credentials with anyone — not even someone claiming to be from your bank or a government agency. No legitimate organization will ever ask for these details through messages, calls, or emails.'
      },
      {
        title: 'How Information Theft Happens',
        content: 'Criminals steal personal information through phishing messages, fake websites, phone calls pretending to be customer support, fake apps that request unnecessary permissions, data breaches at companies, and social engineering — manipulating people into revealing information. Once stolen, this information can be used immediately or sold to other criminals.'
      }
    ],
    warningSignsTitle: 'Warning Signs of Information Theft Attempts',
    warningSigns: [
      'Any request for OTP, password, or PIN through calls, messages, or email',
      'Messages claiming your account will be blocked unless you share details',
      'Calls from people claiming to be bank employees asking for account verification',
      'Apps requesting permissions unrelated to their function',
      'Websites asking for excessive personal information for simple tasks',
      'Emails with forms asking for financial details',
      'Offers that require you to share identity documents with unknown parties'
    ],
    dos: [
      'Use strong, unique passwords for different accounts',
      'Enable two-factor authentication wherever possible',
      'Regularly check your bank statements for unauthorized transactions',
      'Use official apps from your bank or service provider',
      'Keep your phone and apps updated with the latest security patches',
      'Log out of accounts when using shared or public devices'
    ],
    donts: [
      'Never share your OTP, PIN, or password with anyone',
      'Never write passwords on paper or save them in unprotected files',
      'Never use the same password for multiple accounts',
      'Never give your phone to strangers to make calls or use apps',
      'Never install apps from unknown sources',
      'Never respond to calls or messages asking to "verify" your bank details'
    ],
    criticalWarning: 'Never share your OTP, PIN or password with anyone — not even someone claiming to be from your bank, telecom provider, or a government agency.'
  }
];

export default learnTopics;
