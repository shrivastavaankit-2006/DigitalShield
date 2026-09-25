// Safety tips organized by category per PRD section 26

const safetyTips = [
  {
    id: 'before-sharing',
    title: 'Before Sharing',
    icon: 'Share2',
    color: '#0ea5e9',
    tips: [
      {
        title: 'Verify the Source',
        description: 'Always check where the information originally came from before sharing it with others.'
      },
      {
        title: 'Compare With Reliable Sources',
        description: 'Check if the same information is reported by established and trustworthy news sources.'
      },
      {
        title: 'Do Not Blindly Forward Messages',
        description: 'Just because someone you trust sent it does not mean the information is accurate.'
      },
      {
        title: 'Be Careful With Shocking Claims',
        description: 'Messages designed to shock, scare, or excite you are often created to be shared without thinking.'
      },
      {
        title: 'Check the Date',
        description: 'Old news is sometimes recirculated as new. Verify the publication date before sharing.'
      },
      {
        title: 'Read Beyond the Headline',
        description: 'Headlines can be misleading. Read the full content before deciding to share.'
      }
    ]
  },
  {
    id: 'before-clicking',
    title: 'Before Clicking',
    icon: 'MousePointerClick',
    color: '#8b5cf6',
    tips: [
      {
        title: 'Check the Sender',
        description: 'Verify who sent the message or email before clicking any links.'
      },
      {
        title: 'Inspect the URL',
        description: 'Look at the full URL carefully. Check for misspellings, unusual domains, or suspicious structures.'
      },
      {
        title: 'Avoid Unknown Links',
        description: 'Do not click on links from unknown senders, unexpected messages, or suspicious pop-ups.'
      },
      {
        title: 'Look for HTTPS',
        description: 'Check for HTTPS and a padlock icon on websites where you enter any information.'
      },
      {
        title: 'Be Cautious With Shortened URLs',
        description: 'Shortened links hide the real destination. Verify them before clicking.'
      },
      {
        title: 'Do Not Enter Info on Suspicious Sites',
        description: 'Never enter personal or financial information on websites you reached through links in messages.'
      }
    ]
  },
  {
    id: 'banking-payments',
    title: 'Banking & Payments',
    icon: 'CreditCard',
    color: '#22c55e',
    tips: [
      {
        title: 'Never Share Your OTP',
        description: 'Your OTP is meant for your use only. No bank, company, or government agency will ever ask for it.',
        critical: true
      },
      {
        title: 'Never Share Your UPI PIN',
        description: 'Your UPI PIN is like your ATM PIN. Never share it with anyone for any reason.',
        critical: true
      },
      {
        title: 'Never Share Your Password',
        description: 'Banking passwords and PINs should never be shared — not even with bank employees.',
        critical: true
      },
      {
        title: 'Verify Payment Requests',
        description: 'Always verify payment requests through official channels before transferring money.'
      },
      {
        title: 'Use Official Banking Apps',
        description: 'Download banking apps only from official app stores. Do not use third-party apps.'
      },
      {
        title: 'Avoid Banking on Public Wi-Fi',
        description: 'Use mobile data instead of public Wi-Fi when making financial transactions.'
      }
    ]
  },
  {
    id: 'social-media',
    title: 'Social Media',
    icon: 'Users',
    color: '#f59e0b',
    tips: [
      {
        title: 'Avoid Oversharing',
        description: 'Do not share personal details like your address, phone number, daily routine, or travel plans publicly.'
      },
      {
        title: 'Be Careful With Unknown Profiles',
        description: 'Do not accept friend requests from people you do not know. Verify profiles before connecting.'
      },
      {
        title: 'Verify Viral Information',
        description: 'Just because content has many likes and shares does not mean it is true.'
      },
      {
        title: 'Do Not Trust Every Forward',
        description: 'Forwarded messages may contain misinformation even if they come from trusted contacts.'
      },
      {
        title: 'Review Privacy Settings',
        description: 'Regularly check and update your social media privacy settings to control who sees your information.'
      },
      {
        title: 'Be Wary of "Fun" Quizzes',
        description: 'Social media quizzes often collect information used as security questions (mother\'s maiden name, first pet, etc.).'
      }
    ]
  }
];

export default safetyTips;
