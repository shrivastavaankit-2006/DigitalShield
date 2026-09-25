// Practice scenarios for all 5 categories — 5 scenarios each (25 total)

const practiceScenarios = {
  'fake-news': {
    id: 'fake-news',
    title: 'Fake News Practice',
    icon: 'Newspaper',
    description: 'Can you spot fake and misleading news? Test your ability to identify false claims and viral hoaxes.',
    scenarios: [
      {
        id: 1,
        scenario: 'You receive a WhatsApp forward that says: "Government announces ₹50,000 for every citizen! Click here to register before midnight!"',
        question: 'What would you do?',
        options: [
          'Share it immediately with family and friends',
          'Click the link to register',
          'Verify it using an official government website',
          'Forward it to all WhatsApp groups'
        ],
        correctAnswer: 2,
        explanation: 'Official government schemes are announced through official websites and media — not WhatsApp forwards. This uses urgency ("before midnight") and a too-good-to-be-true offer to make people click without thinking.',
        safetyLesson: 'Always verify government-related claims through official government websites or trusted news sources before clicking any link or sharing.'
      },
      {
        id: 2,
        scenario: 'You see a news article on social media with the headline: "SHOCKING: Popular brand of water bottles found to contain dangerous chemicals!" The article has 50,000 shares but comes from a website you have never heard of.',
        question: 'Should you believe and share this article?',
        options: [
          'Yes, 50,000 shares prove it is true',
          'No — check if reliable news sources are reporting the same story',
          'Yes, the headline mentions a specific brand so it must be real',
          'Share it to warn people, better safe than sorry'
        ],
        correctAnswer: 1,
        explanation: 'The number of shares does not prove that information is true. This article comes from an unknown source and uses sensational language ("SHOCKING"). Reliable news would be reported by established news organizations.',
        safetyLesson: 'Popularity and shares do not equal truth. Always look for the same story from multiple reliable sources before believing or sharing.'
      },
      {
        id: 3,
        scenario: 'A forwarded message claims: "Breaking: Major earthquake predicted in your city tomorrow morning! Share this with everyone to save lives!"',
        question: 'How should you respond?',
        options: [
          'Forward it to everyone immediately to help save lives',
          'Post it on all social media platforms',
          'Check official earthquake monitoring agency websites and news channels',
          'Call everyone you know to warn them'
        ],
        correctAnswer: 2,
        explanation: 'Earthquakes cannot be predicted with certainty. Official agencies do not send predictions through WhatsApp forwards. This message uses fear and urgency to encourage rapid sharing without verification.',
        safetyLesson: 'Messages that create panic and urge immediate sharing are often false. Verify emergency-related claims through official agencies and established news sources.'
      },
      {
        id: 4,
        scenario: 'An Instagram post shows a screenshot of a "news article" claiming a famous person made a controversial statement. The screenshot has no visible website name, no date, and no journalist name.',
        question: 'Is this a reliable source of news?',
        options: [
          'Yes, it looks like a real news article',
          'Yes, screenshots cannot be edited',
          'No — it has no source, date, or author and could easily be fabricated',
          'Yes, the famous person probably said it'
        ],
        correctAnswer: 2,
        explanation: 'Screenshots of news articles can easily be created or manipulated. Without a verifiable source, date, and author, there is no way to confirm the information. Always look for the original article from a credible publication.',
        safetyLesson: 'Never trust screenshots of news articles without verifying the original source. Screenshots can be easily fabricated.'
      },
      {
        id: 5,
        scenario: 'You see a video on social media claiming that a common home remedy cures a serious disease. The video has emotional music and personal testimonials but no medical professional is featured.',
        question: 'Should you follow this advice?',
        options: [
          'Yes, personal testimonials are proof enough',
          'Try the remedy — it cannot hurt',
          'No — consult a qualified medical professional for health advice',
          'Share it with people who have the disease'
        ],
        correctAnswer: 2,
        explanation: 'Health misinformation can be dangerous. Personal testimonials and emotional presentation do not replace medical evidence. Unverified remedies can delay proper treatment or cause harm.',
        safetyLesson: 'Always consult qualified medical professionals for health-related decisions. Do not rely on social media videos for medical advice.'
      }
    ]
  },
  'phishing': {
    id: 'phishing',
    title: 'Phishing Practice',
    icon: 'Fish',
    description: 'Can you identify phishing attempts? Practice recognising fake messages designed to steal your information.',
    scenarios: [
      {
        id: 1,
        scenario: 'You receive an SMS: "Dear Customer, your bank account will be blocked today. Click this link immediately to verify your account: http://secure-bankverify.com/update"',
        question: 'What should you identify as warning signs?',
        options: [
          'Nothing suspicious — banks send such messages regularly',
          'The urgency, threat of account blocking, and suspicious link are all warning signs',
          'The message is fine because it says "Dear Customer"',
          'The link is safe because it contains the word "secure"'
        ],
        correctAnswer: 1,
        explanation: 'This message has multiple phishing indicators: urgency ("will be blocked today"), a threat (account blocking), and a suspicious link that is not the official bank website. Banks do not send account verification links through SMS.',
        safetyLesson: 'Banks never ask you to verify your account through links in SMS messages. If concerned, open the official bank app or visit the bank directly.'
      },
      {
        id: 2,
        scenario: 'You receive an email from "support@amaz0n-india.com" saying: "Your order has been cancelled. Please confirm your payment details to process your refund." The email has Amazon-like branding.',
        question: 'Is this email legitimate?',
        options: [
          'Yes, it has Amazon branding so it must be real',
          'No — the sender email uses "amaz0n" (with a zero) which is not Amazon\'s real domain',
          'Yes, because it mentions a refund',
          'Click the link to check if the refund is real'
        ],
        correctAnswer: 1,
        explanation: 'The sender domain "amaz0n-india.com" uses a zero instead of the letter "o" — this is a common phishing technique. Legitimate Amazon emails come from "@amazon.in" or "@amazon.com". The email tries to lure you with a refund to capture your payment details.',
        safetyLesson: 'Always check the sender\'s email address carefully. Small changes in spelling are used to create fake sender addresses that look similar to real ones.'
      },
      {
        id: 3,
        scenario: 'You receive a WhatsApp message from an unknown number: "Hi, I am from the telecom company. Your SIM will be deactivated in 2 hours. Share your Aadhaar number and OTP to complete re-verification."',
        question: 'What should you do?',
        options: [
          'Share the information quickly to avoid losing your phone number',
          'Ask the person for their employee ID to verify',
          'Do not share any information — contact your telecom provider directly through their official number or store',
          'Share only the Aadhaar number but not the OTP'
        ],
        correctAnswer: 2,
        explanation: 'Telecom companies do not contact customers through WhatsApp from unknown numbers asking for Aadhaar or OTP. This is a social engineering attack designed to steal your identity and potentially clone your SIM.',
        safetyLesson: 'No legitimate organization will ask for your Aadhaar number and OTP through WhatsApp messages. Always contact service providers through their official channels.'
      },
      {
        id: 4,
        scenario: 'You receive an email saying you have won a ₹10 lakh lottery from a company you have never interacted with. To claim the prize, you need to pay a "processing fee" of ₹5,000.',
        question: 'Is this legitimate?',
        options: [
          'Yes — pay the fee to receive the larger amount',
          'Maybe — reply to ask for more details',
          'No — you cannot win a lottery you never entered, and legitimate prizes never require upfront payment',
          'Ask a friend to pay the fee on your behalf'
        ],
        correctAnswer: 2,
        explanation: 'This is a classic advance-fee scam. You cannot win a lottery you never entered. The small fee is designed to seem worth the risk compared to the "prize", but there is no prize — only a loss of your money.',
        safetyLesson: 'If you never entered a lottery, you cannot win it. Legitimate prizes never require upfront payment. This is always a scam.'
      },
      {
        id: 5,
        scenario: 'A pop-up appears on your phone browser saying: "Your phone has 3 viruses! Download this security app immediately to protect your data!" It shows a countdown timer.',
        question: 'What should you do?',
        options: [
          'Download the app immediately to remove the viruses',
          'Close the browser tab — this is a fake warning designed to trick you into installing potentially harmful software',
          'Click the countdown timer to stop the viruses',
          'Enter your phone number to receive the security app link'
        ],
        correctAnswer: 1,
        explanation: 'Websites cannot detect viruses on your phone. These fake warning pop-ups use urgency (countdown timer) and fear (virus threat) to trick you into downloading harmful apps or sharing personal information.',
        safetyLesson: 'Legitimate virus warnings come from security software installed on your device — not from website pop-ups. Close such tabs immediately.'
      }
    ]
  },
  'scam': {
    id: 'scam',
    title: 'Scam Practice',
    icon: 'AlertTriangle',
    description: 'Can you recognise online scams? Practice identifying fraudulent schemes before they trick you.',
    scenarios: [
      {
        id: 1,
        scenario: 'Someone calls you claiming to be a bank employee. They say there is a "suspicious transaction" on your account and ask for your OTP to "block the transaction and secure your account".',
        question: 'What should you do?',
        options: [
          'Share the OTP to protect your account',
          'Ask them to send an SMS instead',
          'Hang up immediately — call your bank directly using the official number on your bank card or app',
          'Share only part of the OTP'
        ],
        correctAnswer: 2,
        explanation: 'Bank employees never ask for your OTP over the phone. The OTP is sent to you for your use only. If someone asks for your OTP, they are trying to complete a fraudulent transaction on your account.',
        safetyLesson: 'Your OTP is your last line of defence. Never share it with anyone, regardless of who they claim to be. Banks will never ask for your OTP.'
      },
      {
        id: 2,
        scenario: 'You see a social media advertisement for an investment scheme that promises "guaranteed 30% monthly returns" with "zero risk". The ad shows testimonials from people who claim to have become rich.',
        question: 'Is this investment opportunity legitimate?',
        options: [
          'Yes — the testimonials prove it works',
          'Yes — 30% returns are possible with the right investment',
          'No — guaranteed high returns with zero risk is a hallmark of investment scams',
          'Invest a small amount to test it'
        ],
        correctAnswer: 2,
        explanation: 'No legitimate investment guarantees high returns with zero risk. This is a classic Ponzi scheme indicator. The testimonials may be fake or from early investors who were paid with later investors\' money.',
        safetyLesson: 'If an investment promises guaranteed high returns with no risk, it is almost certainly a scam. All legitimate investments carry some risk.'
      },
      {
        id: 3,
        scenario: 'You receive a message offering a work-from-home job that pays ₹50,000 per month for just 2 hours of work per day. To start, you need to pay a "registration fee" of ₹2,000.',
        question: 'Should you take this job?',
        options: [
          'Yes — the pay is excellent for minimal work',
          'Pay the registration fee — ₹2,000 is small compared to the salary',
          'No — legitimate employers do not charge registration fees, and the offer seems unrealistically attractive',
          'Negotiate the registration fee down'
        ],
        correctAnswer: 2,
        explanation: 'Legitimate jobs never require you to pay money to start working. This scam uses an unrealistically attractive salary to make the small registration fee seem insignificant. Once you pay, the "employer" disappears.',
        safetyLesson: 'Never pay money to get a job. If an employer asks for money, it is a scam. Research any job offer through official company channels.'
      },
      {
        id: 4,
        scenario: 'Someone contacts you on WhatsApp saying they are a customer support executive from a popular e-commerce site. They say your recent order refund is pending and ask you to download a "remote access app" so they can help process it.',
        question: 'Should you cooperate?',
        options: [
          'Download the app — they need access to help with the refund',
          'Give them your order number so they can check',
          'Refuse — legitimate customer support never asks you to install remote access apps. Check the refund status on the official app',
          'Share your screen with them to speed up the process'
        ],
        correctAnswer: 2,
        explanation: 'Remote access apps give the other person complete control over your phone, including access to your banking apps, messages, and OTPs. Legitimate companies never ask customers to install such apps.',
        safetyLesson: 'Never install remote access apps at anyone\'s request. Legitimate customer support operates through official apps, websites, and verified phone numbers.'
      },
      {
        id: 5,
        scenario: 'You receive an SMS saying you have been selected for a government subsidy of ₹15,000. You need to click a link and enter your Aadhaar number, bank account details, and an OTP to "receive the amount within 24 hours".',
        question: 'Is this a real government subsidy?',
        options: [
          'Yes — government schemes often work through SMS',
          'Yes — enter the details to receive the money quickly',
          'No — government subsidies are not distributed through SMS links asking for Aadhaar and bank details',
          'Share only the Aadhaar number but not bank details'
        ],
        correctAnswer: 2,
        explanation: 'Government subsidies are distributed through official channels and verified procedures — not through SMS links. This scam collects your Aadhaar, bank details, and OTP to empty your bank account.',
        safetyLesson: 'Verify any government scheme through official government websites (ending in .gov.in) or by visiting the nearest government office. Never share sensitive details through SMS links.'
      }
    ]
  },
  'suspicious-links': {
    id: 'suspicious-links',
    title: 'Suspicious Link Practice',
    icon: 'Link',
    description: 'Can you identify suspicious links? Practice examining URLs to determine which ones are safe.',
    scenarios: [
      {
        id: 1,
        scenario: 'You need to log in to your email. Which URL should you use?',
        question: 'Which link is the safest to click?',
        options: [
          'http://gmail-login-secure.com/signin',
          'https://accounts.google.com/signin',
          'http://www.gmai1.com/login',
          'https://gmail-verify.net/account'
        ],
        correctAnswer: 1,
        explanation: 'The correct Google sign-in URL is "accounts.google.com". The other URLs use deceptive techniques: "gmail-login-secure.com" is a different domain entirely, "gmai1.com" replaces the letter "l" with the number "1", and "gmail-verify.net" is a different domain.',
        safetyLesson: 'Always check the exact domain name when accessing important websites. Bookmark the correct URLs and use them instead of clicking links in messages.'
      },
      {
        id: 2,
        scenario: 'You receive a message with these four links. One is a legitimate banking URL and the others are suspicious.',
        question: 'Which link should you be MOST careful with?',
        options: [
          'https://www.sbi.co.in/personal-banking',
          'https://www.sbi-secure-login.com/verify',
          'https://www.onlinesbi.sbi/personal',
          'https://bank.sbi/internet-banking'
        ],
        correctAnswer: 1,
        explanation: '"sbi-secure-login.com" is a completely different domain from SBI\'s actual domains (sbi.co.in, onlinesbi.sbi, bank.sbi). It adds the words "secure-login" to create a false sense of safety. The other three are legitimate SBI domains.',
        safetyLesson: 'Adding words like "secure", "login", or "verify" to a domain does not make it legitimate. Always verify the actual domain name against the official website.'
      },
      {
        id: 3,
        scenario: 'You see a link in a promotional email: "http://192.168.45.102/special-offer/claim-now"',
        question: 'What is suspicious about this link?',
        options: [
          'Nothing, it looks normal',
          'It uses an IP address instead of a domain name and lacks HTTPS — both are red flags',
          'The word "special-offer" makes it suspicious',
          'It is suspicious only because of "claim-now"'
        ],
        correctAnswer: 1,
        explanation: 'Legitimate companies use domain names (like "company.com"), not IP addresses (numbers like 192.168.45.102). Using an IP address hides the actual identity of the website. Additionally, the lack of HTTPS means the connection is not encrypted.',
        safetyLesson: 'Be very cautious of links that use IP addresses instead of domain names. Legitimate businesses always use recognizable domain names.'
      },
      {
        id: 4,
        scenario: 'You receive a shortened link in a WhatsApp message: "bit.ly/Free-iPhone15-Win" with the message "You\'ve been selected! Claim your free iPhone 15 now!"',
        question: 'How should you handle this?',
        options: [
          'Click it immediately — free iPhone!',
          'Do not click — shortened links hide the real URL, and the message uses a too-good-to-be-true offer to lure clicks',
          'Click it to see what happens',
          'Forward it to friends so they can also get a free iPhone'
        ],
        correctAnswer: 1,
        explanation: 'Shortened links (bit.ly, tinyurl, etc.) hide the actual destination URL. Combined with a "free iPhone" offer from an unknown source, this is almost certainly a scam or phishing attempt designed to steal personal information.',
        safetyLesson: 'Be cautious with shortened links, especially when combined with unrealistic offers. Use URL expansion tools to check the real destination before clicking.'
      },
      {
        id: 5,
        scenario: 'You want to download a popular app. You find these download options.',
        question: 'Which is the safest way to download?',
        options: [
          'From a link shared in a WhatsApp group',
          'From a website called "free-apps-download.net"',
          'From the official Google Play Store or Apple App Store',
          'From a link in an email from an unknown sender'
        ],
        correctAnswer: 2,
        explanation: 'Official app stores (Google Play Store and Apple App Store) verify apps before listing them and are the safest source for downloading apps. Third-party websites, WhatsApp links, and email links may contain modified or harmful versions of apps.',
        safetyLesson: 'Always download apps from official app stores. Avoid downloading apps from unknown websites or links shared in messages.'
      }
    ]
  },
  'social-media': {
    id: 'social-media',
    title: 'Social Media Practice',
    icon: 'Users',
    description: 'Can you navigate social media safely? Practice identifying fake profiles, misleading posts, and social media scams.',
    scenarios: [
      {
        id: 1,
        scenario: 'You see a post on social media with shocking news and thousands of likes and shares. The post says: "BREAKING: Major company announces free laptops for all students! Share this post to claim yours!"',
        question: 'Does the popularity of this post prove it is true?',
        options: [
          'Yes — thousands of people cannot be wrong',
          'No — popularity does not prove accuracy. This looks like engagement bait using a too-good-to-be-true offer',
          'Yes — it says "BREAKING" so it must be real news',
          'Share it just in case it is true'
        ],
        correctAnswer: 1,
        explanation: 'Likes, shares, and comments do not verify the truth of a claim. This post uses engagement bait tactics: a sensational claim, urgency, and an unrealistic offer. Real corporate giveaways are announced through official company channels, not social media shares.',
        safetyLesson: 'Popularity on social media does not equal accuracy. Always verify information through official sources, regardless of how many people have liked or shared it.'
      },
      {
        id: 2,
        scenario: 'You receive a friend request from someone who claims to be a well-known celebrity. Their profile was created 2 days ago, has 15 followers, no verified badge, and their first post asks followers to send money to a charity link.',
        question: 'Is this a real celebrity account?',
        options: [
          'Yes — celebrities create new accounts sometimes',
          'Maybe — send a small donation first to test',
          'No — a new account with very few followers, no verification, and immediate money requests is almost certainly fake',
          'Accept the request and message them to verify'
        ],
        correctAnswer: 2,
        explanation: 'This profile has all the signs of impersonation: recently created, very few followers, no verification badge, and immediate requests for money. Real celebrity accounts typically have verification badges and established followings.',
        safetyLesson: 'Be sceptical of social media accounts claiming to be famous people, especially new accounts with few followers that ask for money or personal information.'
      },
      {
        id: 3,
        scenario: 'Someone you recently connected with on social media sends you a direct message saying: "I earn ₹1 lakh per day through this amazing platform. I can help you too. Just invest ₹10,000 to start."',
        question: 'How should you respond?',
        options: [
          'Send ₹10,000 to start earning',
          'Ask them for more details about the platform',
          'Ignore and report — this is a common social media investment scam',
          'Invest a smaller amount first'
        ],
        correctAnswer: 2,
        explanation: 'This is a social media investment scam. The person may be a scammer or someone who has been scammed themselves and is unknowingly recruiting victims. Unrealistic daily earnings of ₹1 lakh are a clear red flag.',
        safetyLesson: 'Be wary of unsolicited investment advice on social media, especially from people you have recently connected with. No legitimate investment offers guaranteed daily returns.'
      },
      {
        id: 4,
        scenario: 'A viral post claims: "If you share this post 10 times, Facebook/WhatsApp will donate ₹100 to a children\'s hospital for each share."',
        question: 'Should you share this post?',
        options: [
          'Yes — sharing costs nothing and could help children',
          'Yes — big companies do this kind of thing regularly',
          'No — platforms do not donate money based on post shares. This is a hoax designed to go viral',
          'Share it just in case it is real'
        ],
        correctAnswer: 2,
        explanation: 'Social media platforms do not track and monetize individual post shares for charitable donations. These viral hoaxes are designed to generate engagement, collect personal data, or build fake page followings that can be used for scams later.',
        safetyLesson: 'Sharing-based donation claims are almost always hoaxes. If you want to support a cause, donate directly through verified charitable organizations.'
      },
      {
        id: 5,
        scenario: 'You are filling out a "fun quiz" on social media that asks for your full name, date of birth, mother\'s maiden name, first pet\'s name, and the city where you were born.',
        question: 'Should you complete this quiz?',
        options: [
          'Yes — it is just a fun quiz',
          'Yes — everyone shares these things online',
          'No — these are common security questions for bank accounts and online services. Sharing them publicly is risky',
          'Complete it but set the post to private'
        ],
        correctAnswer: 2,
        explanation: 'Many "fun quizzes" on social media are designed to collect answers to common security questions used by banks and online services. With this information, criminals can attempt to reset passwords and access your accounts.',
        safetyLesson: 'Be cautious of social media quizzes that ask for personal information — especially details commonly used as security questions (mother\'s maiden name, first pet, birthplace, etc.).'
      }
    ]
  }
};

export default practiceScenarios;
