// 30 quiz questions covering all major digital safety topics
// The quiz randomly selects 10 per attempt

const quizQuestions = [
  // --- Fake News & Misinformation ---
  {
    id: 1,
    topic: 'Fake News',
    question: 'A news article has been shared 100,000 times on social media. Does this prove the information is true?',
    options: [
      'Yes, popular content is always accurate',
      'No, popularity does not prove accuracy',
      'Yes, if many people believe it, it must be true',
      'Yes, social media platforms verify popular posts'
    ],
    correctAnswer: 1,
    explanation: 'The number of shares does not verify the accuracy of information. False and misleading content can go viral just as easily as true information.'
  },
  {
    id: 2,
    topic: 'Fake News',
    question: 'Which of the following is the BEST way to verify a news claim you received on WhatsApp?',
    options: [
      'Check if it has been forwarded many times',
      'Ask friends if they received the same message',
      'Check multiple reliable and established news sources',
      'Look at the quality of the images in the message'
    ],
    correctAnswer: 2,
    explanation: 'Comparing claims with multiple reliable news sources is the most effective way to verify information. Forwarding counts, friends\' opinions, and image quality are not reliable verification methods.'
  },
  {
    id: 3,
    topic: 'Fake News',
    question: 'A message begins with "URGENT: Share this with everyone before it gets deleted!" What does this suggest?',
    options: [
      'The information is very important',
      'The message may be trying to create urgency to encourage sharing without verification',
      'The government is trying to hide the truth',
      'You should share it immediately'
    ],
    correctAnswer: 1,
    explanation: 'Creating false urgency is a common tactic used to spread misinformation. The pressure to share immediately discourages people from taking time to verify the information.'
  },
  {
    id: 4,
    topic: 'Fake News',
    question: 'Which of these sources is MOST reliable for checking if a viral claim is true or false?',
    options: [
      'A WhatsApp group with many members',
      'Comments under the viral post',
      'Established fact-checking websites',
      'YouTube videos about the topic'
    ],
    correctAnswer: 2,
    explanation: 'Established fact-checking websites investigate and verify viral claims using evidence-based methods. WhatsApp groups, comments, and YouTube videos may themselves contain unverified information.'
  },
  {
    id: 5,
    topic: 'Fake News',
    question: 'Why is it risky to forward health-related advice received through WhatsApp without verification?',
    options: [
      'It wastes mobile data',
      'False health information could lead people to take harmful actions or delay proper treatment',
      'It is not risky — all health tips are helpful',
      'It only affects older people'
    ],
    correctAnswer: 1,
    explanation: 'Unverified health information can be dangerous. People may follow harmful advice or avoid seeking proper medical treatment, which could have serious consequences.'
  },
  // --- Phishing ---
  {
    id: 6,
    topic: 'Phishing',
    question: 'You receive an SMS saying your bank account will be suspended unless you click a link and verify your details. What should you do?',
    options: [
      'Click the link immediately to save your account',
      'Reply with your account number',
      'Ignore the SMS and contact your bank directly through their official app or number',
      'Forward the SMS to friends to warn them'
    ],
    correctAnswer: 2,
    explanation: 'Banks never ask customers to verify accounts through SMS links. Always contact your bank directly using official channels if you have any concerns about your account.'
  },
  {
    id: 7,
    topic: 'Phishing',
    question: 'An email from "support@your-bank-secure.com" asks you to update your password by clicking a link. What is suspicious?',
    options: [
      'Nothing — it says "support" so it is from the bank',
      'The domain "your-bank-secure.com" is not your bank\'s official domain',
      'The email mentions passwords',
      'Emails cannot be suspicious'
    ],
    correctAnswer: 1,
    explanation: 'The sender\'s email domain is not your bank\'s official domain. Anyone can register a domain with words like "bank" and "secure" in it. Always verify the exact domain matches your bank\'s official website.'
  },
  {
    id: 8,
    topic: 'Phishing',
    question: 'What is a common characteristic of phishing messages?',
    options: [
      'They are always written in bad English',
      'They always come from email',
      'They create a sense of urgency or fear to make you act without thinking',
      'They are only sent to elderly people'
    ],
    correctAnswer: 2,
    explanation: 'While phishing messages may have various characteristics, creating urgency or fear is the most common tactic across all types of phishing attacks. This pressure reduces the victim\'s ability to think critically.'
  },
  {
    id: 9,
    topic: 'Phishing',
    question: 'Someone calls claiming to be from your bank and asks for your OTP to "cancel a fraudulent transaction". What should you do?',
    options: [
      'Share the OTP quickly to stop the fraud',
      'Share only the last 2 digits of the OTP',
      'Never share your OTP with anyone — hang up and call your bank directly',
      'Text the OTP instead of saying it'
    ],
    correctAnswer: 2,
    explanation: 'Your OTP should never be shared with anyone. If someone asks for your OTP, they are the ones trying to commit fraud, not prevent it. Banks never ask for OTPs over the phone.'
  },
  {
    id: 10,
    topic: 'Phishing',
    question: 'A pop-up on a website says "Your device is infected! Call this number immediately for support." What should you do?',
    options: [
      'Call the number immediately',
      'Download the suggested security software',
      'Close the browser tab — this is a fake warning designed to scam you',
      'Enter your phone number to receive help'
    ],
    correctAnswer: 2,
    explanation: 'Websites cannot detect viruses on your device. These fake warnings try to get you to call a scam number where "technicians" will ask for remote access to your device or payment for fake repairs.'
  },
  // --- Online Scams ---
  {
    id: 11,
    topic: 'Online Scams',
    question: 'A job posting offers ₹80,000 per month salary for data entry work but requires a ₹5,000 "training fee" upfront. Is this likely legitimate?',
    options: [
      'Yes — ₹5,000 is a small amount for such a high-paying job',
      'No — legitimate employers do not charge fees to provide jobs',
      'Yes — training fees are common in the industry',
      'Maybe — pay the fee and see what happens'
    ],
    correctAnswer: 1,
    explanation: 'Legitimate employers never charge fees to hire employees. This is a classic job scam that uses an attractive salary to make the "fee" seem insignificant. Once paid, the "employer" disappears.'
  },
  {
    id: 12,
    topic: 'Online Scams',
    question: 'Someone promises "guaranteed 40% monthly returns" on an investment with "no risk at all". What does this indicate?',
    options: [
      'This is an excellent investment opportunity',
      'This is likely an investment scam — no legitimate investment guarantees such high returns with zero risk',
      'The returns are possible with the right strategy',
      'Only invest a small amount to be safe'
    ],
    correctAnswer: 1,
    explanation: 'Guaranteed high returns with zero risk is the primary indicator of a Ponzi scheme or investment scam. All legitimate investments carry some level of risk, and returns are never guaranteed.'
  },
  {
    id: 13,
    topic: 'Online Scams',
    question: 'You receive a message saying you have won a lottery prize of ₹25 lakhs but need to pay ₹10,000 as "tax" to claim it. What should you do?',
    options: [
      'Pay the tax — ₹10,000 is nothing compared to ₹25 lakhs',
      'Ask for the lottery company details',
      'Ignore it — you cannot win a lottery you never entered, and real prizes never require upfront payment',
      'Negotiate a lower tax amount'
    ],
    correctAnswer: 2,
    explanation: 'You cannot win a lottery you did not enter. The "tax" is the actual scam — once paid, the scammer will either disappear or ask for more fees. Legitimate lottery winnings have taxes deducted automatically.'
  },
  {
    id: 14,
    topic: 'Online Scams',
    question: 'A "customer support agent" asks you to install a remote access app to "fix a problem" with your account. What is the risk?',
    options: [
      'No risk — they need to see your screen to help',
      'Remote access apps give the other person complete control of your device, including banking apps and OTPs',
      'The risk is minimal if you watch what they do',
      'It is safe if the app is from the Play Store'
    ],
    correctAnswer: 1,
    explanation: 'Remote access apps give another person full control of your device. They can access your banking apps, read your OTPs, transfer money, and steal personal information. Legitimate support never requires remote access.'
  },
  {
    id: 15,
    topic: 'Online Scams',
    question: 'What is the safest way to verify if an online shopping deal is legitimate?',
    options: [
      'Check the number of reviews on the product page',
      'Verify the seller and deal through the official app or website of the shopping platform',
      'Trust the deal if it was shared by a friend',
      'The deal is safe if it has a countdown timer'
    ],
    correctAnswer: 1,
    explanation: 'Always verify deals through official apps or websites. Fake shopping websites can imitate real ones. Reviews can be fabricated, friends may share unverified deals, and countdown timers create false urgency.'
  },
  // --- Suspicious Links ---
  {
    id: 16,
    topic: 'Suspicious Links',
    question: 'Which of the following is a warning sign in a URL?',
    options: [
      'The URL starts with "https://"',
      'The URL uses the correct domain name',
      'The URL contains an IP address (numbers) instead of a domain name',
      'The URL is short and simple'
    ],
    correctAnswer: 2,
    explanation: 'URLs with IP addresses (like http://192.168.1.1/login) instead of domain names (like https://www.bank.com) are suspicious because they hide the identity of the website. Legitimate businesses use recognizable domain names.'
  },
  {
    id: 17,
    topic: 'Suspicious Links',
    question: 'What does "HTTPS" at the beginning of a URL indicate?',
    options: [
      'The website is guaranteed to be safe',
      'The connection between your browser and the website is encrypted',
      'The website is owned by the government',
      'The website has been verified by Google'
    ],
    correctAnswer: 1,
    explanation: 'HTTPS means the data transmitted between your browser and the website is encrypted. However, it does not guarantee the website itself is legitimate — scam websites can also use HTTPS.'
  },
  {
    id: 18,
    topic: 'Suspicious Links',
    question: 'You receive a link: "https://www.amaz0n-deals-india.com/offer". What is suspicious about this URL?',
    options: [
      'Nothing — it mentions Amazon and India',
      'The domain uses "amaz0n" (with a zero) and has extra words — it is not Amazon\'s real domain',
      'The URL starts with HTTPS so it is safe',
      'The word "deals" makes it suspicious'
    ],
    correctAnswer: 1,
    explanation: 'The domain "amaz0n-deals-india.com" replaces the letter "o" with the number "0" and adds extra words. Amazon\'s real domains are "amazon.in" or "amazon.com". This is a phishing technique called typosquatting.'
  },
  {
    id: 19,
    topic: 'Suspicious Links',
    question: 'What is the safest way to access your bank\'s website?',
    options: [
      'Click a link from an SMS or email',
      'Search for it on Google and click the first result',
      'Type the official URL directly into your browser or use the official app',
      'Use a link shared in a WhatsApp group'
    ],
    correctAnswer: 2,
    explanation: 'Typing the official URL directly or using the official banking app is the safest way to access your bank. SMS/email links could be phishing, search results could include ads for fake sites, and WhatsApp links are unverified.'
  },
  {
    id: 20,
    topic: 'Suspicious Links',
    question: 'Why should you be cautious of shortened URLs (like bit.ly links)?',
    options: [
      'Shortened URLs are always dangerous',
      'They use less data',
      'They hide the actual destination URL, making it impossible to verify where the link leads before clicking',
      'They are used only by scammers'
    ],
    correctAnswer: 2,
    explanation: 'Shortened URLs hide the real destination. While many legitimate services use URL shorteners, you cannot see where the link actually leads, which makes it risky to click, especially from unknown sources.'
  },
  // --- OTP / Password / Personal Info Safety ---
  {
    id: 21,
    topic: 'Personal Information',
    question: 'Under what circumstances should you share your OTP with someone?',
    options: [
      'When a bank employee calls and asks for it',
      'When a customer support agent asks for it',
      'When a family member asks for it over the phone',
      'Never — OTPs should never be shared with anyone'
    ],
    correctAnswer: 3,
    explanation: 'An OTP (One-Time Password) is meant for your use only. No legitimate organization — including banks, government agencies, or service providers — will ever ask for your OTP. If someone asks, they are attempting fraud.'
  },
  {
    id: 22,
    topic: 'Personal Information',
    question: 'What is the best practice for creating strong passwords?',
    options: [
      'Use your date of birth for easy memorization',
      'Use the same password for all accounts',
      'Use a unique combination of letters, numbers, and symbols for each account',
      'Write passwords on a note stuck to your computer'
    ],
    correctAnswer: 2,
    explanation: 'Strong passwords use a combination of uppercase letters, lowercase letters, numbers, and special characters. Each account should have a unique password so that if one is compromised, others remain safe.'
  },
  {
    id: 23,
    topic: 'Personal Information',
    question: 'You receive a call from someone claiming to be from a government agency. They ask for your Aadhaar number to "update your records". What should you do?',
    options: [
      'Provide the number — it is a government request',
      'Verify their identity by hanging up and calling the agency\'s official number',
      'Give only the last 4 digits',
      'Provide it if they know your name and address'
    ],
    correctAnswer: 1,
    explanation: 'Government agencies do not call people to collect Aadhaar numbers. If you receive such a call, hang up and contact the agency directly through their official numbers to verify the request.'
  },
  {
    id: 24,
    topic: 'Personal Information',
    question: 'Why is using public Wi-Fi for banking transactions risky?',
    options: [
      'Public Wi-Fi is slow',
      'Public Wi-Fi networks may be monitored, and your data could be intercepted',
      'It uses too much battery',
      'Public Wi-Fi is always safe if it has a password'
    ],
    correctAnswer: 1,
    explanation: 'Public Wi-Fi networks may not be secure. Attackers can potentially monitor network traffic and intercept sensitive data like login credentials and banking information. Use mobile data for financial transactions.'
  },
  {
    id: 25,
    topic: 'Personal Information',
    question: 'Which of the following should you NEVER share with an unknown caller or message sender?',
    options: [
      'Your full name',
      'Your city of residence',
      'Your UPI PIN or banking password',
      'Your email address'
    ],
    correctAnswer: 2,
    explanation: 'While you should be cautious with all personal information, your UPI PIN and banking password should absolutely never be shared with anyone. These give direct access to your financial accounts.'
  },
  // --- Social Media Safety ---
  {
    id: 26,
    topic: 'Social Media',
    question: 'A social media account with a verified badge sends you a message asking for personal information. Is it safe to share?',
    options: [
      'Yes — verified accounts are always trustworthy',
      'No — verified accounts can be hacked, and legitimate organizations do not request personal information through direct messages',
      'Yes — but only share non-financial information',
      'Yes — if the account has many followers'
    ],
    correctAnswer: 1,
    explanation: 'Verified accounts can be hacked or impersonated. Even legitimate organizations do not typically request personal information through social media direct messages. Always verify through official channels.'
  },
  {
    id: 27,
    topic: 'Social Media',
    question: 'Why should you review your social media privacy settings regularly?',
    options: [
      'To gain more followers',
      'To control who can see your personal information and posts, reducing the risk of misuse',
      'Privacy settings do not matter',
      'Only celebrities need to review privacy settings'
    ],
    correctAnswer: 1,
    explanation: 'Privacy settings control who can access your personal information, photos, and posts. Regular review is important because platforms update their settings, and your needs may change over time.'
  },
  {
    id: 28,
    topic: 'Social Media',
    question: 'A social media contest asks you to share your phone number, date of birth, and address to "claim a prize". Should you participate?',
    options: [
      'Yes — it is just a contest',
      'Yes — if the page has many followers',
      'No — legitimate contests do not ask for sensitive personal information upfront',
      'Yes — but use a friend\'s information instead'
    ],
    correctAnswer: 2,
    explanation: 'Legitimate contests do not require sensitive personal information to enter. Scam contests collect personal data that can be used for identity theft, targeted phishing, or sold to third parties.'
  },
  {
    id: 29,
    topic: 'Social Media',
    question: 'What is the biggest risk of sharing your daily location, travel plans, and routines on social media?',
    options: [
      'Using too much mobile data',
      'It can help potential criminals know when you are away from home or establish your patterns',
      'Your friends might get jealous',
      'It slows down your phone'
    ],
    correctAnswer: 1,
    explanation: 'Sharing location and routine details publicly can help criminals know when your home is empty or predict your movements. This information can be used for burglary, stalking, or targeted scams.'
  },
  {
    id: 30,
    topic: 'Social Media',
    question: 'You notice a friend\'s social media account is sending unusual messages asking people to click links and send money. What has likely happened?',
    options: [
      'Your friend is promoting a business',
      'Your friend\'s account may have been hacked — contact them through a different channel to warn them',
      'The messages are probably automated but harmless',
      'Ignore it — it is not your problem'
    ],
    correctAnswer: 1,
    explanation: 'Unusual messages from a friend\'s account asking for money or sending links often indicate the account has been compromised. Contact your friend through another channel (phone call, in person) to alert them.'
  }
];

export default quizQuestions;
