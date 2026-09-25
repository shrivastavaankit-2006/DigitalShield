// Cloudflare Worker: DigitalShield Gemini Multimodal Analysis & URL Security API
// Securely proxies image & text analysis to Google Gemini
// Keeps GEMINI_API_KEY strictly server-side as an encrypted Cloudflare Worker secret.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BASE64_LENGTH = 7 * 1024 * 1024; // Approx 5 MB raw image file

// ---------------------------------------------------------------------------
// Security & SSRF Protection for Link Analysis
// ---------------------------------------------------------------------------

function isSafeUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Only HTTP and HTTPS protocols are supported.' };
    }
    const hostname = parsed.hostname.toLowerCase();

    // Block loopback & localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') {
      return { safe: false, reason: 'Access to loopback/localhost is forbidden.' };
    }

    // Block internal suffixes
    if (
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.lan') ||
      hostname.endsWith('.corp') ||
      hostname.endsWith('.onion')
    ) {
      return { safe: false, reason: 'Access to internal or private domain extensions is forbidden.' };
    }

    // Block private/reserved IPv4 addresses
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const [, a, b, c, d] = ipMatch.map(Number);
      if (a > 255 || b > 255 || c > 255 || d > 255) {
        return { safe: false, reason: 'Invalid IP address format.' };
      }
      if (a === 10) return { safe: false, reason: 'Access to private 10.0.0.0/8 network is forbidden.' };
      if (a === 172 && b >= 16 && b <= 31) return { safe: false, reason: 'Access to private 172.16.0.0/12 network is forbidden.' };
      if (a === 192 && b === 168) return { safe: false, reason: 'Access to private 192.168.0.0/16 network is forbidden.' };
      if (a === 169 && b === 254) return { safe: false, reason: 'Access to link-local/cloud metadata (169.254.0.0/16) is forbidden.' };
      if (a === 127) return { safe: false, reason: 'Access to loopback range is forbidden.' };
      if (a === 0) return { safe: false, reason: 'Access to 0.0.0.0 range is forbidden.' };
      if (a === 100 && b >= 64 && b <= 127) return { safe: false, reason: 'Access to carrier-grade NAT space is forbidden.' };
    }

    // Block private/reserved IPv6 addresses
    if (hostname.startsWith('[') || hostname.includes(':')) {
      const cleanIpv6 = hostname.replace(/^\[|\]$/g, '').toLowerCase();
      if (
        cleanIpv6 === '::1' ||
        cleanIpv6 === '::' ||
        cleanIpv6.startsWith('fe80:') ||
        cleanIpv6.startsWith('fc') ||
        cleanIpv6.startsWith('fd')
      ) {
        return { safe: false, reason: 'Access to private/local IPv6 range is forbidden.' };
      }
    }

    return { safe: true, parsed };
  } catch (err) {
    return { safe: false, reason: `Malformed URL: ${err.message}` };
  }
}

async function inspectTargetUrl(inputUrl) {
  let currentUrl = inputUrl.trim();
  if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
    currentUrl = 'https://' + currentUrl;
  }

  const initialCheck = isSafeUrl(currentUrl);
  if (!initialCheck.safe) {
    return {
      success: false,
      blocked: true,
      errorReason: initialCheck.reason,
      url: currentUrl,
      finalUrl: currentUrl,
      domain: '',
      https: currentUrl.startsWith('https://'),
      httpStatus: null,
      contentType: 'blocked',
      pageTitle: 'Blocked (Unsafe target)',
      redirects: [],
      analysisEvidence: [`Security Policy Violation: ${initialCheck.reason}`],
      htmlSnippet: ''
    };
  }

  const redirects = [];
  let finalUrl = currentUrl;
  let httpStatus = null;
  let contentType = 'unknown';
  let pageTitle = '';
  let accessible = false;
  let errorReason = null;
  const analysisEvidence = [];
  let htmlSnippet = '';

  const maxHops = 5;
  let hopCount = 0;

  try {
    let nextUrl = currentUrl;

    while (hopCount < maxHops) {
      hopCount++;
      const safetyCheck = isSafeUrl(nextUrl);
      if (!safetyCheck.safe) {
        errorReason = `Redirect target blocked: ${safetyCheck.reason}`;
        analysisEvidence.push(`Redirect to ${nextUrl} blocked: ${safetyCheck.reason}`);
        break;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(nextUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (DigitalShield Safety Scanner)',
          'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      httpStatus = response.status;
      finalUrl = nextUrl;
      contentType = response.headers.get('content-type') || 'unknown';

      // Check for HTTP redirect status codes
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location) {
          const resolvedLocation = new URL(location, nextUrl).toString();
          redirects.push({
            from: nextUrl,
            to: resolvedLocation,
            status: response.status
          });
          analysisEvidence.push(`HTTP ${response.status} Redirect: ${nextUrl} -> ${resolvedLocation}`);
          nextUrl = resolvedLocation;
          continue;
        }
      }

      // Reached final destination
      accessible = true;
      analysisEvidence.push(`Final HTTP response status: ${httpStatus} (${contentType})`);

      // Read limited body text if HTML or plain text (max 50 KB)
      if (contentType.toLowerCase().includes('text/html') || contentType.toLowerCase().includes('text/plain')) {
        const reader = response.body?.getReader();
        if (reader) {
          let receivedBytes = 0;
          const chunks = [];
          while (receivedBytes < 51200) {
            const { done, value } = await reader.read();
            if (done || !value) break;
            chunks.push(value);
            receivedBytes += value.length;
          }
          const totalBuffer = new Uint8Array(receivedBytes);
          let offset = 0;
          for (const chunk of chunks) {
            totalBuffer.set(chunk.subarray(0, Math.min(chunk.length, 51200 - offset)), offset);
            offset += chunk.length;
            if (offset >= 51200) break;
          }
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const fullText = decoder.decode(totalBuffer);

          // Extract <title>
          const titleMatch = fullText.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            pageTitle = titleMatch[1].trim().replace(/\s+/g, ' ');
            analysisEvidence.push(`Page Title: "${pageTitle}"`);
          }

          // Check security and threat indicators
          if (/<input[^>]+type=["']password["']/i.test(fullText)) {
            analysisEvidence.push('Page contains password/credential entry fields (<input type="password">)');
          }
          if (/<form[^>]*>/i.test(fullText)) {
            analysisEvidence.push('Interactive HTML form detected on page');
          }
          if (/otp|one[\s-]?time[\s-]?password|verification code/i.test(fullText)) {
            analysisEvidence.push('OTP / verification code terminology detected in page content');
          }
          if (/bank|credit card|cvv|upi pin|atm pin|net banking/i.test(fullText)) {
            analysisEvidence.push('Banking / payment credentials keywords detected in page content');
          }
          if (/lottery|congratulations you won|claim prize|exclusive reward|limited time gift/i.test(fullText)) {
            analysisEvidence.push('Prize, reward, or lottery incentive language detected');
          }
          if (/account suspended|immediate action required|threat of penalty|legal notice/i.test(fullText)) {
            analysisEvidence.push('High-pressure urgency or threatening language detected');
          }

          // Strip HTML tags and scripts to provide clean text snippet to Gemini (max 1000 chars)
          htmlSnippet = fullText
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 1000);
        }
      } else {
        analysisEvidence.push(`Content type is non-HTML (${contentType}); skipped body text parsing.`);
      }
      break;
    }
  } catch (err) {
    accessible = false;
    errorReason = err.name === 'AbortError' ? 'Connection timed out (exceeded 5 seconds)' : (err.message || 'Network fetch failed');
    analysisEvidence.push(`Destination could not be accessed: ${errorReason}`);
  }

  let finalHostname = '';
  let isHttps = false;
  try {
    const finalParsed = new URL(finalUrl);
    finalHostname = finalParsed.hostname;
    isHttps = finalParsed.protocol === 'https:';
    analysisEvidence.push(`Protocol: ${isHttps ? 'HTTPS (Encrypted)' : 'HTTP (Unencrypted)'}`);
  } catch {
    finalHostname = finalUrl;
  }

  return {
    success: true,
    blocked: false,
    accessible,
    errorReason,
    url: currentUrl,
    finalUrl,
    domain: finalHostname,
    https: isHttps,
    httpStatus,
    contentType,
    pageTitle: pageTitle || (accessible ? 'No title tag found' : 'Unable to inspect destination'),
    redirects,
    analysisEvidence,
    htmlSnippet
  };
}

// ---------------------------------------------------------------------------
// Dynamic Practice / Training Question Generation
// ---------------------------------------------------------------------------

const TOPIC_DESCRIPTIONS = {
  'fake-news': 'identifying fake news, manipulated photos, fabricated headlines, clickbait, and verifying claims against authoritative news agencies',
  'phishing': 'recognizing phishing emails, deceptive sender domains, credential harvesting, fake login pages, and urgent OTP/password prompts',
  'scam': 'detecting online scams, lottery frauds, UPI/banking payment traps, fake customer care numbers, job offer frauds, and impersonation',
  'suspicious-links': 'analyzing suspicious web links, typo-squatted domains, fake subdomains, unencrypted HTTP connections, and deceptive redirects',
  'social-media': 'practicing social media privacy, avoiding oversharing, identifying fake profiles, romance/friend scams, and malicious direct messages',
  'challenge': 'a comprehensive mixture of digital safety scenarios covering phishing, scams, fake news, suspicious links, and privacy habits'
};

async function generatePracticeQuestions(env, topic, count) {
  const trimmedKey = env.GEMINI_API_KEY ? env.GEMINI_API_KEY.trim() : '';
  if (!trimmedKey) {
    return { success: false, error: 'GEMINI_API_KEY is not configured.' };
  }

  const topicDesc = TOPIC_DESCRIPTIONS[topic] || TOPIC_DESCRIPTIONS['challenge'];
  const targetCount = count && Number(count) > 0 ? Number(count) : (topic === 'challenge' ? 10 : 5);

  const prompt = `You are DigitalShield's Community Digital Safety Educator.
Generate exactly ${targetCount} unique, high-quality, practical multiple-choice questions for community learners on the topic of: ${topicDesc}.

STRICT REQUIREMENTS:
1. SCENARIO-BASED: Frame each question around a realistic daily scenario (WhatsApp message, SMS alert, bank email, social media DM, suspicious website).
2. COMMUNITY-ORIENTED: Clear, accessible language for everyday citizens, students, and seniors. Avoid overly technical cyber jargon.
3. OPTIONS: Provide exactly 4 realistic, distinct options per question. Exactly ONE clearly correct/safest answer.
4. CORRECT ANSWER: Provide 'correctAnswer' as the zero-based index (0, 1, 2, or 3) pointing to the safest, most responsible option.
5. EXPLANATION: Write a clear educational explanation of why the correct option is safest and the risks associated with the wrong choices.
6. DIFFICULTY: Assign 'easy', 'medium', or 'hard' based on subtlety.
7. NO DUPLICATES: Each of the ${targetCount} questions must present a completely different scenario and concept.
8. INDIAN CONTEXT & CURRENCY: Use realistic Indian community context wherever relevant (e.g., Indian banks like SBI/HDFC, UPI, Aadhaar, PAN card, TRAI). ALWAYS use Indian currency format '₹' (Rupees) instead of '$' (Dollars) for all monetary amounts (e.g. '₹500 gift cards', '₹10,000 cash prize'). NEVER use the '$' dollar sign.

Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "id": 1,
      "scenario": "A concise 1-2 sentence real-life scenario description",
      "question": "The specific question being asked (e.g. 'What should you do?', 'Is this message safe?')",
      "options": [
        "Option 1 text",
        "Option 2 text",
        "Option 3 text",
        "Option 4 text"
      ],
      "correctAnswer": 0,
      "explanation": "Clear explanation of the correct safety guidance",
      "difficulty": "easy"
    }
  ]
}`;

  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  const formatInr = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)/g, '₹$1').replace(/\$/g, '₹');
  };

  for (const model of candidateModels) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': trimmedKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.8
          }
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = extractJsonFromText(rawText);
      const rawList = parsed?.questions || (Array.isArray(parsed) ? parsed : null);

      if (Array.isArray(rawList) && rawList.length >= targetCount) {
        const validated = [];
        const seenQuestions = new Set();

        for (let i = 0; i < rawList.length; i++) {
          const item = rawList[i];
          const scenarioText = formatInr((item.scenario || '').trim());
          const questionText = formatInr((item.question || '').trim());
          const fullQ = scenarioText ? `${scenarioText} ${questionText}` : questionText;

          const normalized = fullQ.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (seenQuestions.has(normalized)) continue;
          seenQuestions.add(normalized);

          if (!Array.isArray(item.options) || item.options.length !== 4) continue;
          const cleanOptions = item.options.map(o => formatInr(String(o || '').trim())).filter(Boolean);
          if (cleanOptions.length !== 4) continue;

          const correctIdx = Number(item.correctAnswer);
          if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) continue;

          validated.push({
            id: i + 1,
            scenario: scenarioText || questionText,
            question: questionText || 'What should you do?',
            options: cleanOptions,
            correctAnswer: correctIdx,
            explanation: formatInr((item.explanation || 'Always verify through official channels.').trim()),
            difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'medium',
            topic: topic
          });

          if (validated.length === targetCount) break;
        }

        if (validated.length === targetCount) {
          return { success: true, questions: validated };
        }
      }
    } catch (err) {
      console.warn(`Failed question generation on ${model}:`, err.message);
    }
  }

  return { success: false, error: 'Unable to generate fresh practice questions at this moment.' };
}

// ---------------------------------------------------------------------------
// Free Web & News Retrieval Engine
// Queries Bing News RSS (current breaking news) + Wikipedia Search API (facts/encyclopedic) + Wikinews API
// 100% Free, requires NO API keys, NO paid billing, NO search grounding.
// ---------------------------------------------------------------------------

function scoreSourceAuthority(item) {
  const url = (item.url || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const source = (item.source || '').toLowerCase();
  let score = 50;

  // 1. Official Government domains & PIB (Press Information Bureau)
  if (
    url.includes('.gov.in') ||
    url.includes('pib.gov.in') ||
    source.includes('pib') ||
    title.includes('pib fact check')
  ) {
    score += 50;
  } else if (url.includes('.gov') || url.includes('.nic.in')) {
    score += 40;
  }

  // 2. Established Independent Fact-Checking Organizations
  if (
    url.includes('boomlive.in') ||
    url.includes('altnews.in') ||
    url.includes('vishvasnews.com') ||
    url.includes('factly.in') ||
    title.includes('fact check') ||
    source.includes('fact check')
  ) {
    score += 35;
  }

  // 3. Established Mainstream News Outlets
  if (
    url.includes('indianexpress.com') ||
    url.includes('thehindu.com') ||
    url.includes('ndtv.com') ||
    url.includes('indiatoday.in') ||
    url.includes('timesofindia.') ||
    url.includes('businesstoday.in') ||
    url.includes('livemint.com') ||
    url.includes('hindustantimes.com') ||
    url.includes('bbc.') ||
    url.includes('reuters.com') ||
    url.includes('apnews.com') ||
    url.includes('wionews.com')
  ) {
    score += 30;
  }

  // 4. Encyclopedic / Historical Knowledge Base
  if (url.includes('wikipedia.org')) {
    score += 15;
  }

  return score;
}

async function searchFreeWebAndNews(queries) {
  const queryList = (Array.isArray(queries) ? queries : [queries])
    .filter(q => q && typeof q === 'string')
    .map(q => q.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 4);

  if (queryList.length === 0) return [];

  const results = [];
  const seenUrls = new Set();

  // Search each query in parallel
  const searchPromises = queryList.map(async (cleanQuery) => {
    const queryItems = [];

    // 1. Bing News RSS (Real-time current web & news reporting)
    try {
      const bingUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(cleanQuery)}&format=rss`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const bRes = await fetch(bingUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, text/xml, */*'
        }
      });
      clearTimeout(timeout);

      if (bRes.ok) {
        const xml = await bRes.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        let match;
        let count = 0;
        while ((match = itemRegex.exec(xml)) !== null && count < 6) {
          count++;
          const block = match[1];
          const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
          const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
          const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i);
          const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
          const sourceMatch = block.match(/<News:Source>([\s\S]*?)<\/News:Source>/i);

          let rawTitle = titleMatch ? titleMatch[1] : '';
          rawTitle = rawTitle
            .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();

          let rawLink = linkMatch ? linkMatch[1].replace(/&amp;/g, '&').trim() : '';
          let articleUrl = rawLink;

          // Extract direct article URL if wrapped in Bing redirect param
          try {
            const parsed = new URL(rawLink);
            const direct = parsed.searchParams.get('url');
            if (direct && (direct.startsWith('http://') || direct.startsWith('https://'))) {
              articleUrl = direct;
            }
          } catch {}

          const sourceName = sourceMatch
            ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').trim()
            : 'News Source';

          let snippet = descMatch ? descMatch[1] : '';
          snippet = snippet
            .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();

          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

          if (rawTitle && articleUrl) {
            queryItems.push({
              title: rawTitle,
              url: articleUrl,
              source: sourceName,
              snippet: snippet.slice(0, 350),
              pubDate
            });
          }
        }
      }
    } catch (err) {
      // Ignore Bing RSS timeout/error
    }

    // 2. Wikipedia Search API (Authoritative encyclopedia and historical records)
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&utf8=&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const wRes = await fetch(wikiUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'DigitalShield/1.0 (Community Misinformation Fact Checker; educational non-commercial)'
        }
      });
      clearTimeout(timeout);

      if (wRes.ok) {
        const wData = await wRes.json();
        const hits = (wData.query?.search || []).slice(0, 2);
        for (const h of hits) {
          const pageTitle = (h.title || '').trim();
          if (!pageTitle) continue;
          const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
          const rawSnippet = (h.snippet || '')
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&#039;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
          queryItems.push({
            title: `${pageTitle} - Wikipedia`,
            url: pageUrl,
            source: 'Wikipedia',
            snippet: rawSnippet.slice(0, 350),
            pubDate: h.timestamp || ''
          });
        }
      }
    } catch (err) {
      // Ignore Wikipedia timeout/error
    }

    return queryItems;
  });

  const settled = await Promise.allSettled(searchPromises);
  for (const s of settled) {
    if (s.status === 'fulfilled' && Array.isArray(s.value)) {
      for (const item of s.value) {
        if (item.url && !seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          results.push(item);
        }
      }
    }
  }

  // Rank sources by credibility and official standing
  results.sort((a, b) => scoreSourceAuthority(b) - scoreSourceAuthority(a));

  return results.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Step 1: Intelligent Claim Understanding & Query Generation
// Understands typos, Hinglish, informal slang, numbers, dates, questions.
// Generates 3-5 diverse search queries without altering factual intent.
// ---------------------------------------------------------------------------

async function understandAndNormalizeClaim(trimmedKey, candidateModels, rawInput, extractedScreenshotClaim) {
  const combinedInput = (rawInput || extractedScreenshotClaim || '').trim();
  if (!combinedInput) {
    return {
      normalizedClaim: '',
      entities: [],
      searchQueries: []
    };
  }

  const normalizePrompt = `You are DigitalShield's Factual Claim Normalizer and Search Strategy AI.
Analyze the user's raw input submitted for news / misinformation fact-checking.
The input may contain typos, spelling errors, grammar mistakes, Hindi-English / Hinglish phrasing (e.g. "kya government sabko 10 hazar rupaye har month de rahi hai?"), casual WhatsApp forward language, short questions, or abbreviations (e.g. '10K', 't20 wc', 'modi', 'PM').

YOUR INSTRUCTIONS:
1. INTENDED FACTUAL CLAIM:
   - Identify what factual statement, event, or government scheme the user is asking to verify.
   - Standardize spelling, grammar, and abbreviations into clean English.
   - Translate any Hindi-English / Hinglish phrasing into clear standard English (e.g. "kya government sabko 10 hazar rupaye har month de rahi hai?" -> "Is the Government of India distributing ₹10,000 per month to every citizen?").
   - PRESERVE all key numbers (e.g. 10,000 / 10K / 10 hazar), dates (e.g. 2024), entities (e.g. Government of India, Narendra Modi, OpenAI, ICC).
   - CRITICAL RESTRICTION: Do NOT answer the claim. Do NOT assume it is true or false. Do NOT invent unrelated facts.

2. SEARCH QUERIES:
   Generate 3 to 5 diverse, high-quality search queries:
   - Query 1 (Main Claim): Clean keywords for the core factual claim.
   - Query 2 (Entity + Scheme/Event): Entity, action, and key terms (e.g. "Government of India 10000 rupees monthly scheme").
   - Query 3 (Fact-Check Query): Targeted at fact-checkers (e.g. "10000 rupees every citizen scheme fact check").
   - Query 4 (Official/PIB Query): Targeted at official sources (e.g. "PIB fact check 10000 rupees per month").
   - Query 5 (Alternative/Synonym Wording): Alternative phrasing or keywords.

Return ONLY a valid JSON object matching this schema:
{
  "normalizedClaim": "A clear, grammatical statement or question of the intended claim.",
  "entities": ["list", "of", "core", "entities", "numbers"],
  "searchQueries": [
    "query 1",
    "query 2",
    "query 3",
    "query 4"
  ]
}

USER INPUT:
"${combinedInput}"`;

  for (const model of candidateModels) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': trimmedKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: normalizePrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = extractJsonFromText(rawText);
        if (parsed && parsed.normalizedClaim) {
          let queries = Array.isArray(parsed.searchQueries) ? parsed.searchQueries.filter(Boolean) : [];
          if (queries.length === 0) {
            queries = [parsed.normalizedClaim];
          }
          return {
            normalizedClaim: parsed.normalizedClaim.trim(),
            entities: Array.isArray(parsed.entities) ? parsed.entities : [],
            searchQueries: queries
          };
        }
      }
    } catch (err) {
      console.warn(`Claim normalization error on ${model}:`, err.message);
    }
  }

  // Fallback if normalization call fails
  return {
    normalizedClaim: combinedInput,
    entities: [],
    searchQueries: [combinedInput, `${combinedInput} fact check`]
  };
}

// ---------------------------------------------------------------------------
// Real-Time News Check Verification Handler
// Flow: Raw Input -> Claim Normalization + Query Gen -> Multi-Source Search
// -> Authority Ranking -> Gemini Evidence-Only Evaluation -> Structured Result + Sources
// ---------------------------------------------------------------------------

async function handleNewsVerification(env, text, imageBase64, mimeType) {
  const trimmedKey = env.GEMINI_API_KEY ? env.GEMINI_API_KEY.trim() : '';
  if (!trimmedKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY secret is not configured on Cloudflare Worker.' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  let imageDescription = '';
  let detectedContentType = imageBase64 ? 'News article screenshot' : 'News claim';
  let relevanceToChecker = 'Relevant to News Check';
  let extractedClaim = '';
  let isPersonalPhoto = false;

  // 1. If image is supplied, inspect image to understand content and extract claim
  if (imageBase64) {
    const inspectPrompt = `You are DigitalShield's Image Content & News Inspector.
Carefully examine the uploaded image.
Determine:
1. Is this an ordinary photograph (personal photo, selfie, landscape, pet, object, nature)?
2. Or is it a screenshot of a news article, headline, news tweet/post, TV broadcast, or social media claim?

Return ONLY a valid JSON object:
{
  "imageDescription": "A concise 1-2 sentence visual description of what is depicted in the image.",
  "detectedContentType": "Personal photograph | News article screenshot | Social media post | Document | Unknown/unclear",
  "relevanceToChecker": "Relevant to News Check | Not relevant to News Check",
  "isPersonalOrUnrelated": true,
  "extractedClaim": "The core factual news headline or claim visible in the screenshot, or empty string if none"
}`;

    for (const model of candidateModels) {
      try {
        const imgRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': trimmedKey
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { inlineData: { mimeType, data: imageBase64 } },
                  { text: inspectPrompt }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          })
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const rawText = imgData.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = extractJsonFromText(rawText);
          if (parsed) {
            imageDescription = parsed.imageDescription || '';
            detectedContentType = parsed.detectedContentType || detectedContentType;
            relevanceToChecker = parsed.relevanceToChecker || relevanceToChecker;
            extractedClaim = parsed.extractedClaim || '';
            isPersonalPhoto = Boolean(
              parsed.isPersonalOrUnrelated ||
              detectedContentType === 'Personal photograph' ||
              relevanceToChecker.toLowerCase().includes('not relevant')
            );
            break;
          }
        }
      } catch (err) {
        console.warn(`Image inspection failed on ${model}:`, err.message);
      }
    }

    // If it's an ordinary personal photograph and no separate news text claim was entered:
    if (isPersonalPhoto && !text) {
      return new Response(
        JSON.stringify({
          imageDescription: imageDescription || 'Uploaded image analyzed.',
          detectedContentType: 'Personal photograph',
          relevanceToChecker: 'Not relevant to News Check',
          riskLevel: 'LOW RISK',
          riskScore: 0,
          warningSigns: [],
          explanation: 'The uploaded image is an ordinary photograph and does not contain a news claim or article to verify.',
          recommendedAction: 'To verify a news event, upload a screenshot of an actual news headline or enter the claim in text.',
          disclaimer: 'This educational platform evaluates digital misinformation. A low risk result means no misinformation red flags were detected, not that the content is permanently verified.',
          verificationStatus: 'INSUFFICIENT EVIDENCE',
          claim: 'N/A - Non-news image',
          evidenceSummary: 'The uploaded image is an ordinary photograph and does not contain a news claim or article to verify.',
          sources: []
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }
  }

  // 2. Intelligent Claim Understanding & Search Query Generation
  const rawInput = (text || extractedClaim || '').trim();
  if (!rawInput) {
    return new Response(
      JSON.stringify({
        imageDescription: imageDescription || 'Visual analysis completed.',
        detectedContentType: detectedContentType || 'Unknown/unclear',
        relevanceToChecker: 'Relevant to News Check',
        riskLevel: 'NEEDS VERIFICATION',
        riskScore: 40,
        warningSigns: ['No specific factual claim could be identified to verify.'],
        explanation: 'No clear factual statement or headline was found to search and verify.',
        recommendedAction: 'Please enter a specific news claim or statement to verify.',
        disclaimer: 'This educational platform evaluates digital misinformation.',
        verificationStatus: 'INSUFFICIENT EVIDENCE',
        claim: 'Unspecified claim',
        evidenceSummary: 'No specific claim provided to verify.',
        sources: []
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  const { normalizedClaim, searchQueries } = await understandAndNormalizeClaim(
    trimmedKey,
    candidateModels,
    text,
    extractedClaim
  );

  const claimToPresent = normalizedClaim || rawInput;

  // 3. Query multiple free web / news search sources dynamically
  let searchResults = [];
  try {
    searchResults = await searchFreeWebAndNews(searchQueries);
  } catch (searchErr) {
    console.warn('Free web/news search exception:', searchErr.message);
    searchResults = [];
  }

  // If no search results are returned:
  if (searchResults.length === 0) {
    return new Response(
      JSON.stringify({
        imageDescription: imageDescription || (imageBase64 ? 'Uploaded screenshot inspected.' : 'Text claim submitted.'),
        detectedContentType: detectedContentType || (imageBase64 ? 'News article screenshot' : 'News claim'),
        relevanceToChecker: 'Relevant to News Check',
        riskLevel: 'NEEDS VERIFICATION',
        riskScore: 40,
        warningSigns: [
          'No current web or news sources found corroborating or addressing this claim'
        ],
        explanation: `We evaluated the claim: "${claimToPresent}". No reliable external web, official government, or news sources were found addressing this specific claim at this time.`,
        recommendedAction: 'Verify this claim directly through reputable, established news organizations or official government bulletins.',
        disclaimer: 'This educational platform evaluates digital misinformation. When external web sources are unavailable, claims cannot be reliably confirmed.',
        verificationStatus: 'NEEDS VERIFICATION',
        claim: claimToPresent,
        evidenceSummary: 'No external web or news sources could be retrieved to corroborate or refute this claim.',
        sources: []
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  // 4. Format retrieved search evidence for Gemini
  const formattedEvidence = searchResults.map((s, idx) =>
    `[Evidence Source ${idx + 1}] (${s.source}${s.pubDate ? ' - ' + s.pubDate : ''})\nTitle: "${s.title}"\nURL: ${s.url}\nExcerpt: ${s.snippet}`
  ).join('\n\n');

  const evidenceAnalysisPrompt = `You are DigitalShield's Professional Misinformation and News Verification AI.
Evaluate the user's claim using ONLY the supplied external web evidence below. Do not rely on your internal knowledge. The normalized claim is only a clarification of the user's intended meaning; it is NOT evidence.

ORIGINAL USER INPUT:
"${rawInput}"

NORMALIZED CLAIM:
"${claimToPresent}"

RETRIEVED EXTERNAL WEB EVIDENCE (Ranked by source authority):
${formattedEvidence}

CRITICAL RULES:
1. STRICT EVIDENCE-ONLY REASONING:
   - Base your assessment strictly and exclusively on the retrieved web evidence above.
   - Do NOT use internal training cutoff knowledge or ungrounded assumptions.
   - If the retrieved evidence clearly supports and confirms the claim, mark verificationStatus as "SUPPORTED" or "LIKELY TRUE".
   - If the retrieved evidence directly contradicts, refutes, or debunks the claim (e.g. official PIB notices debunking a viral fake scheme, or news fact-checks stating it is false), mark verificationStatus as "CONTRADICTED" or "LIKELY FALSE".
   - If the retrieved sources report conflicting facts or disagree with each other, mark verificationStatus as "MIXED EVIDENCE".
   - If the retrieved evidence is inconclusive, too vague, or insufficient to confirm or deny the claim, mark verificationStatus as "INSUFFICIENT EVIDENCE" or "NEEDS VERIFICATION".
   - DO NOT overconfidently call something false without evidence.

2. OBJECTIVE RISK SCORING:
   - SUPPORTED / LIKELY TRUE: riskLevel: "LOW RISK", riskScore: 5-15, warningSigns: []
   - MIXED EVIDENCE: riskLevel: "NEEDS VERIFICATION", riskScore: 45-55, warningSigns: ["Contradictory or conflicting reports found in news sources"]
   - INSUFFICIENT EVIDENCE / NEEDS VERIFICATION: riskLevel: "NEEDS VERIFICATION", riskScore: 35-50, warningSigns: ["Claim lacks definitive corroboration in retrieved sources"]
   - LIKELY FALSE / CONTRADICTED: riskLevel: "HIGH RISK", riskScore: 80-95, warningSigns: ["Retrieved news sources or official fact-checks directly contradict or debunk this claim"]

3. USER-FRIENDLY EXPLANATION:
   - Explain what the user appears to be claiming (without criticizing their spelling, grammar, or phrasing).
   - Explain what the retrieved web sources say.
   - Clearly state why the claim is supported, uncertain, or contradicted.
   - Provide actionable advice on what the user should do next.

Return ONLY a valid JSON object matching this schema:
{
  "verificationStatus": "SUPPORTED | LIKELY TRUE | MIXED EVIDENCE | NEEDS VERIFICATION | LIKELY FALSE | CONTRADICTED | INSUFFICIENT EVIDENCE",
  "claim": "${claimToPresent}",
  "evidenceSummary": "Concise 1-2 sentence summary of what the retrieved web sources say regarding the claim",
  "riskLevel": "LOW RISK | NEEDS VERIFICATION | SUSPICIOUS | HIGH RISK",
  "riskScore": 0,
  "warningSigns": [],
  "explanation": "Clear, transparent explanation comparing the user's claim with the retrieved evidence",
  "recommendedAction": "Actionable guidance for the reader",
  "disclaimer": "This educational platform assesses claims against retrieved web evidence. Readers should verify breaking news across multiple independent sources."
}`;

  // 5. Send claim + retrieved web evidence to Gemini (STANDARD generateContent, NO TOOLS)
  let evalResult = null;
  for (const model of candidateModels) {
    try {
      const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': trimmedKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: evidenceAnalysisPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
        evalResult = extractJsonFromText(rawText);
        if (evalResult) break;
      }
    } catch (err) {
      console.warn(`Gemini evidence evaluation failed on ${model}:`, err.message);
    }
  }

  // Actual sources from search
  const actualSources = searchResults.map(s => ({
    title: s.title,
    url: s.url
  }));

  // If Gemini evidence analysis succeeded
  if (evalResult) {
    return new Response(
      JSON.stringify({
        imageDescription: imageDescription || (imageBase64 ? 'Uploaded screenshot inspected.' : 'Text claim submitted.'),
        detectedContentType: detectedContentType || (imageBase64 ? 'News article screenshot' : 'News claim'),
        relevanceToChecker: 'Relevant to News Check',
        verificationStatus: sanitizeVerificationStatus(evalResult.verificationStatus),
        claim: evalResult.claim || claimToPresent,
        evidenceSummary: evalResult.evidenceSummary || 'Verification completed using retrieved web evidence.',
        riskLevel: sanitizeRiskLevel(evalResult.riskLevel),
        riskScore: typeof evalResult.riskScore === 'number' ? Math.min(100, Math.max(0, Math.round(evalResult.riskScore))) : 10,
        warningSigns: Array.isArray(evalResult.warningSigns) ? evalResult.warningSigns : [],
        explanation: evalResult.explanation || 'Claim evaluated against retrieved web evidence.',
        recommendedAction: evalResult.recommendedAction || 'Consult established news organizations for further context.',
        disclaimer: evalResult.disclaimer || 'This educational platform evaluates digital misinformation.',
        sources: actualSources
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  // If Gemini evidence analysis failed, fallback with actual retrieved sources:
  return new Response(
    JSON.stringify({
      imageDescription: imageDescription || (imageBase64 ? 'Uploaded screenshot inspected.' : 'Text claim submitted.'),
      detectedContentType: detectedContentType || (imageBase64 ? 'News article screenshot' : 'News claim'),
      relevanceToChecker: 'Relevant to News Check',
      verificationStatus: 'NEEDS VERIFICATION',
      claim: claimToPresent,
      evidenceSummary: 'Web sources were retrieved, but automated evidence evaluation could not complete.',
      riskLevel: 'NEEDS VERIFICATION',
      riskScore: 40,
      warningSigns: ['Automated evidence evaluation could not complete.'],
      explanation: 'External news sources were retrieved, but automated evaluation could not complete. Please inspect the retrieved sources directly.',
      recommendedAction: 'Review the attached sources directly to verify the claim.',
      disclaimer: 'This educational platform evaluates digital misinformation.',
      sources: actualSources
    }),
    { status: 200, headers: CORS_HEADERS }
  );
}

// ---------------------------------------------------------------------------
// Main Worker Handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Health check endpoint
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'DigitalShield Cloudflare Worker Gemini API',
          hasApiKey: Boolean(env.GEMINI_API_KEY)
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // Dynamic Training Questions Generation Endpoint
    if (request.method === 'POST' && (url.pathname === '/api/training/generate' || url.pathname === '/training/generate')) {
      let trainingPayload;
      try {
        trainingPayload = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body provided.' }), { status: 400, headers: CORS_HEADERS });
      }
      const topic = (trainingPayload.topic || 'challenge').trim();
      const count = Number(trainingPayload.count) || (topic === 'challenge' ? 10 : 5);
      const genResult = await generatePracticeQuestions(env, topic, count);
      if (!genResult.success) {
        return new Response(JSON.stringify({ error: genResult.error || 'Unable to generate questions.' }), { status: 502, headers: CORS_HEADERS });
      }
      return new Response(JSON.stringify({ questions: genResult.questions }), { status: 200, headers: CORS_HEADERS });
    }

    // Diagnostic Endpoint for Testing Free Web / News Search directly from deployed Worker
    if (request.method === 'GET' && (url.pathname === '/api/debug-news-search' || url.pathname === '/debug-news-search')) {
      const q = url.searchParams.get('q') || 'India won the 2024 T20 World Cup';
      const diagnostics = {};

      // 1. DuckDuckGo Lite
      try {
        const ddgUrl = 'https://lite.duckduckgo.com/lite/';
        const ddgRes = await fetch(ddgUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
          },
          body: `q=${encodeURIComponent(q)}`
        });
        const ddgText = await ddgRes.text();
        diagnostics.ddgLite = {
          status: ddgRes.status,
          ok: ddgRes.ok,
          length: ddgText.length,
          snippet: ddgText.slice(0, 300)
        };
      } catch (e) {
        diagnostics.ddgLite = { error: e.message };
      }

      // 2. DuckDuckGo Instant Answer API
      try {
        const ddgApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
        const ddgApiRes = await fetch(ddgApiUrl, {
          headers: { 'User-Agent': 'DigitalShield/1.0' }
        });
        const ddgApiJson = await ddgApiRes.json();
        diagnostics.ddgApi = {
          status: ddgApiRes.status,
          heading: ddgApiJson.Heading,
          abstractText: ddgApiJson.AbstractText ? ddgApiJson.AbstractText.slice(0, 100) : '',
          relatedCount: (ddgApiJson.RelatedTopics || []).length
        };
      } catch (e) {
        diagnostics.ddgApi = { error: e.message };
      }

      // 3. Bing News RSS
      try {
        const bingUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss`;
        const bRes = await fetch(bingUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, text/xml, */*'
          }
        });
        const bText = await bRes.text();
        diagnostics.bingRss = {
          status: bRes.status,
          ok: bRes.ok,
          length: bText.length,
          hasItem: bText.includes('<item>'),
          snippet: bText.slice(0, 300)
        };
      } catch (e) {
        diagnostics.bingRss = { error: e.message };
      }

      // 4. Wikinews API
      try {
        const wikiNewsUrl = `https://en.wikinews.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&utf8=&format=json`;
        const wnRes = await fetch(wikiNewsUrl, {
          headers: { 'User-Agent': 'DigitalShield/1.0' }
        });
        const wnJson = await wnRes.json();
        diagnostics.wikinews = {
          status: wnRes.status,
          count: (wnJson.query?.search || []).length,
          first: wnJson.query?.search?.[0]
        };
      } catch (e) {
        diagnostics.wikinews = { error: e.message };
      }

      return new Response(
        JSON.stringify({ query: q, diagnostics }, null, 2),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Only accept POST requests on /api/analyze or /analyze or /
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method Not Allowed. Use POST /api/analyze.' }),
        { status: 405, headers: CORS_HEADERS }
      );
    }

    // 1. Verify Secret Key Presence
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim() === '') {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY secret is not configured on the Cloudflare Worker.',
          tip: 'Run "npx wrangler secret put GEMINI_API_KEY" in the worker directory to set it.'
        }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // 2. Parse and Validate Request Payload
    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body provided.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const rawType = (payload.type || payload.checkType || 'General').trim();
    const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
    const text = (payload.text || '').trim();
    let imageBase64 = (payload.imageBase64 || '').trim();
    let mimeType = (payload.mimeType || 'image/jpeg').trim().toLowerCase();

    // Strip data URL prefix if provided (e.g. data:image/png;base64,...)
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '') || mimeType;
      imageBase64 = parts[1];
    }

    if (!text && !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Please provide either text or an image to analyze.' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (imageBase64) {
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return new Response(
          JSON.stringify({
            error: `Unsupported image format: ${mimeType}. Please upload a JPEG, PNG, or WEBP image.`
          }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      if (imageBase64.length > MAX_BASE64_LENGTH) {
        return new Response(
          JSON.stringify({
            error: 'Image file is too large. Please upload an image under 5MB.'
          }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // 3. News Check Route (Free Web/News Search + Evidence-Only Evaluation)
    if (type === 'News') {
      return await handleNewsVerification(env, text, imageBase64, mimeType);
    }

    // 4. Checker-Specific Pre-Processing & Security Handling
    let linkInspection = null;

    if (type === 'Link') {
      if (text) {
        // Validate URL syntax before proceeding
        const urlValidation = isSafeUrl(text.startsWith('http://') || text.startsWith('https://') ? text : `https://${text}`);
        if (!urlValidation.safe && urlValidation.reason.includes('Malformed')) {
          return new Response(
            JSON.stringify({
              isInvalid: true,
              error: 'Please enter a valid website link (e.g., https://example.com).'
            }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        // Perform safe server-side URL inspection
        linkInspection = await inspectTargetUrl(text);

        // If blocked by SSRF defense
        if (linkInspection.blocked) {
          return new Response(
            JSON.stringify({
              imageDescription: 'URL text provided; destination blocked by safety policy.',
              detectedContentType: 'Suspicious link',
              relevanceToChecker: 'Relevant to Link Check',
              riskLevel: 'HIGH RISK',
              riskScore: 98,
              warningSigns: [
                'Target URL resolves to a prohibited local, private, or internal network destination (SSRF protection triggered)',
                linkInspection.errorReason
              ],
              explanation: 'The submitted link attempts to communicate with a restricted private or internal network address, which is a major security hazard.',
              recommendedAction: 'Do not access or trust this link. It appears designed to probe internal network resources.',
              disclaimer: 'This educational platform evaluates digital communication threats and phishing.',
              url: linkInspection.url,
              finalUrl: linkInspection.finalUrl,
              httpStatus: null,
              contentType: 'blocked',
              pageTitle: 'Access Blocked',
              domain: 'restricted',
              https: linkInspection.https,
              redirects: [],
              analysisEvidence: linkInspection.analysisEvidence
            }),
            { status: 200, headers: CORS_HEADERS }
          );
        }
      }
    }

    // 4. Build System Instructions and Request Body for Gemini
    let systemInstruction = '';
    const isNewsCheck = type === 'News';
    const isLinkCheck = type === 'Link';

    if (isNewsCheck) {
      systemInstruction = `You are DigitalShield's Professional Misinformation and News Verification AI.
You evaluate news claims, viral statements, online rumors, and news screenshots using real-time Google Search grounding.

User Claim / Input: ${text || 'None provided (visual analysis from screenshot)'}
Image Attached: ${imageBase64 ? 'Yes' : 'No'}

CRITICAL INSTRUCTIONS FOR NEWS VERIFICATION:
1. Actually inspect the content:
   - If an image is attached, describe the visible content in "imageDescription".
   - If it is an ordinary photograph (personal photo, landscape, animal, selfie, object):
     - imageDescription must describe what is in the photo.
     - detectedContentType must be "Personal photograph".
     - relevanceToChecker must be "Not relevant to News Check".
     - riskLevel must be "LOW RISK".
     - riskScore must be 0.
     - warningSigns must be [].
     - verificationStatus must be "INSUFFICIENT EVIDENCE".
     - claim must be "N/A - Non-news image".
     - evidenceSummary must be "The uploaded image is an ordinary photograph and does not contain a news claim or article to verify.".
     - explanation must clearly state that the image is a personal photo without news content.
     - recommendedAction must advise uploading a news screenshot or entering a claim.
     - Do NOT invent fake news warnings.
   - If it is a news screenshot / article:
     - Describe the headline, visible publisher, dates, or author.
     - Extract the specific claim that requires verification in "claim".

2. REAL FACT CHECKING & EVIDENCE EVALUATION:
   - Search current and authoritative web sources using Google Search grounding.
   - Compare multiple sources where available.
   - Prioritize primary sources, official government portals, established news organizations, and reputable fact-checkers.
   - Distinguish unverified rumors from debunked hoaxes.
   - Summarize the verified facts in "evidenceSummary".

3. VERIFICATION STATUS:
   Must be exactly one of:
   - "SUPPORTED" (Strong corroboration from credible news / official sources)
   - "LIKELY TRUE" (Substantial evidence supports the claim)
   - "MIXED EVIDENCE" (Sources disagree or report conflicting facts)
   - "NEEDS VERIFICATION" (Circulating claim with insufficient reliable corroboration yet)
   - "LIKELY FALSE" (Substantial credible evidence contradicts the claim)
   - "CONTRADICTED" (Directly debunked or proven false by authoritative fact checks)
   - "INSUFFICIENT EVIDENCE" (Too vague or uncorroborated; cannot verify)

4. RISK ASSESSMENT SCHEMA:
   - Well-supported true claim -> riskLevel: "LOW RISK", riskScore: 5-15, warningSigns: []
   - Conflicting or unverified claim -> riskLevel: "NEEDS VERIFICATION", riskScore: 35-50, warningSigns: ["Claim lacks definitive official corroboration"]
   - False / Contradicted claim -> riskLevel: "HIGH RISK", riskScore: 80-95, warningSigns: ["Claim contradicted by credible news sources"]
   - Unrelated personal photo -> riskLevel: "LOW RISK", riskScore: 0, warningSigns: []

Return ONLY valid JSON matching this schema:
{
  "imageDescription": "...",
  "detectedContentType": "News article screenshot | Social media post | Personal photograph | Unknown/unclear",
  "relevanceToChecker": "Relevant to News Check | Not relevant to News Check",
  "riskLevel": "LOW RISK | NEEDS VERIFICATION | SUSPICIOUS | HIGH RISK",
  "riskScore": 0,
  "warningSigns": [],
  "explanation": "...",
  "recommendedAction": "...",
  "disclaimer": "This educational platform evaluates digital misinformation. A low risk result means no misinformation red flags were detected, not that the content is permanently verified.",
  "verificationStatus": "SUPPORTED | LIKELY TRUE | MIXED EVIDENCE | NEEDS VERIFICATION | LIKELY FALSE | CONTRADICTED | INSUFFICIENT EVIDENCE",
  "claim": "...",
  "evidenceSummary": "..."
}`;
    } else if (isLinkCheck) {
      systemInstruction = `You are DigitalShield's Web Link & Phishing Safety AI.
You evaluate website URLs and webpage screenshots using actual technical server inspection data.

Submitted URL: ${text || 'None provided in text'}
Image Attached: ${imageBase64 ? 'Yes' : 'No'}

TECHNICAL SERVER-SIDE INSPECTION DATA:
${linkInspection ? JSON.stringify({
  url: linkInspection.url,
  finalUrl: linkInspection.finalUrl,
  domain: linkInspection.domain,
  https: linkInspection.https,
  httpStatus: linkInspection.httpStatus,
  contentType: linkInspection.contentType,
  pageTitle: linkInspection.pageTitle,
  accessible: linkInspection.accessible,
  errorReason: linkInspection.errorReason,
  redirects: linkInspection.redirects,
  detectedFeatures: linkInspection.analysisEvidence,
  pageTextSnippet: linkInspection.htmlSnippet ? linkInspection.htmlSnippet.slice(0, 500) : ''
}, null, 2) : 'No direct URL text submitted; image-based link inspection only.'}

CRITICAL INSTRUCTIONS FOR LINK CHECK:
1. Actually inspect the provided evidence:
   - If an image is attached, describe visible content in "imageDescription".
   - If it is an ordinary photo unrelated to links or websites:
     - detectedContentType must be "Personal photograph".
     - relevanceToChecker must be "Not relevant to Link Check".
     - riskLevel must be "LOW RISK", riskScore must be 0, warningSigns must be [].
   - If a URL was submitted:
     - Base your evaluation on the ACTUAL collected data above.
     - Do NOT invent login forms, OTP requests, or banking fields unless the inspection data confirms them.
     - If the URL could not be accessed (${linkInspection && !linkInspection.accessible ? 'TRUE - URL was inaccessible: ' + linkInspection.errorReason : 'FALSE'}), clearly state that the destination could not be safely reached, and analyze only domain name patterns and URL structure with appropriate uncertainty.

2. EVALUATE REAL WARNING SIGNS:
   - Check domain typo-squatting, misleading subdomains, suspicious TLDs.
   - Check domain/brand mismatch (e.g. "paypal-secure-login.xyz" vs genuine "paypal.com").
   - Check if HTTP is used instead of HTTPS for sensitive operations.
   - Check if page asks for credentials, OTPs, or UPI PINs unexpectedly.
   - Check deceptive redirects.

3. RISK SCORING:
   - Legitimate website with 200 OK and no suspicious flags -> riskLevel: "LOW RISK", riskScore: 5-20.
   - Inaccessible or unknown website with no active scam indicators -> riskLevel: "NEEDS VERIFICATION", riskScore: 35-50.
   - Suspicious domain patterns or deceptive branding -> riskLevel: "SUSPICIOUS", riskScore: 65-80.
   - Direct phishing, credential harvesting, or lottery scam -> riskLevel: "HIGH RISK", riskScore: 85-98.

Return ONLY valid JSON matching this schema:
{
  "imageDescription": "...",
  "detectedContentType": "Web URL | Website screenshot | Personal photograph | Unknown/unclear",
  "relevanceToChecker": "Relevant to Link Check | Not relevant to Link Check",
  "riskLevel": "LOW RISK | NEEDS VERIFICATION | SUSPICIOUS | HIGH RISK",
  "riskScore": 0,
  "warningSigns": [],
  "explanation": "...",
  "recommendedAction": "...",
  "disclaimer": "This educational platform evaluates digital links and phishing indicators. Always verify URLs independently before entering sensitive credentials.",
  "url": "${linkInspection ? linkInspection.url : text}",
  "finalUrl": "${linkInspection ? linkInspection.finalUrl : text}",
  "httpStatus": ${linkInspection && linkInspection.httpStatus ? linkInspection.httpStatus : 'null'},
  "contentType": "${linkInspection ? linkInspection.contentType : 'text/html'}",
  "pageTitle": "${linkInspection ? linkInspection.pageTitle.replace(/"/g, "'") : ''}",
  "domain": "${linkInspection ? linkInspection.domain : ''}",
  "https": ${linkInspection ? linkInspection.https : false},
  "redirects": ${linkInspection ? JSON.stringify(linkInspection.redirects) : '[]'},
  "analysisEvidence": ${linkInspection ? JSON.stringify(linkInspection.analysisEvidence) : '[]'}
}`;
    } else {
      // General / Message / Email Check (Preserve existing multimodal logic)
      systemInstruction = `You are DigitalShield's Community Digital Safety and Misinformation Prevention AI.
You evaluate digital content specifically for fake news, scams, phishing, suspicious messages, and deceptive links.

Selected Checker: ${type} Check
User Text Input: ${text || 'None provided (visual analysis only)'}
Image Attached: ${imageBase64 ? 'Yes' : 'No'}

CRITICAL MULTIMODAL INSTRUCTIONS:
1. Actually inspect and describe what is visible in the image in "imageDescription".
   - If an image is attached, describe the real, factual visual contents (e.g. "An ordinary photograph of a person outdoors", "A WhatsApp chat conversation screenshot showing text bubbles", "An email screenshot showing inbox header and message").
   - If no image is attached, set imageDescription to "Text analysis only; no image provided".

2. Classify "detectedContentType" as exactly one of:
   - "Personal photograph"
   - "News article screenshot"
   - "Social media post"
   - "WhatsApp message"
   - "SMS screenshot"
   - "Email screenshot"
   - "Website screenshot"
   - "Suspicious link"
   - "Advertisement"
   - "Document"
   - "Unknown/unclear"

3. Determine "relevanceToChecker":
   - State whether the content is relevant, e.g.:
     "Relevant to ${type} Check" OR "Not relevant to ${type} Check"

4. UNRELATED IMAGE RULE:
   - If an ordinary personal photograph or unrelated image is uploaded to ${type} Check:
     - imageDescription must describe what is in the photo.
     - detectedContentType must be "Personal photograph".
     - relevanceToChecker must be "Not relevant to ${type} Check".
     - riskLevel must be "LOW RISK".
     - riskScore must be 0.
     - warningSigns must be an empty array [].
     - explanation must clearly state that the uploaded image does not contain ${type.toLowerCase()}-related content.
     - recommendedAction must advise the user to upload an actual ${type.toLowerCase()} screenshot or paste the text.
     - Do NOT invent fake or generic warning signs.

5. CHECKER-SPECIFIC RULES:
   - Email Check: Inspect visible sender headers, subject line, body text, links, urgency, and impersonation indicators.
   - Message Check: Inspect visible SMS/chat text, phone numbers, urgency, payment demands, threats, and OTP requests.

6. RISK ASSESSMENT SCHEMA:
   - Allowed riskLevel values: "LOW RISK", "NEEDS VERIFICATION", "SUSPICIOUS", "HIGH RISK".
   - riskScore: Integer between 0 and 100 based on observed warning signs.
   - warningSigns: Array of strings detailing specific observed triggers (empty [] if safe or unrelated).
   - explanation: Clear, transparent explanation of findings.
   - recommendedAction: Actionable digital safety guidance for ordinary users.
   - disclaimer: "This educational platform evaluates digital communication threats, phishing, and misinformation. A low risk result means no digital safety red flags were detected, not that the content is verified."

Return ONLY valid JSON matching this exact schema:
{
  "imageDescription": "...",
  "detectedContentType": "...",
  "relevanceToChecker": "...",
  "riskLevel": "LOW RISK | NEEDS VERIFICATION | SUSPICIOUS | HIGH RISK",
  "riskScore": 0,
  "warningSigns": [],
  "explanation": "...",
  "recommendedAction": "...",
  "disclaimer": "..."
}`;
    }

    // 5. Dispatch Request to Gemini
    try {
      const parts = [];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType,
            data: imageBase64
          }
        });
      }
      parts.push({ text: systemInstruction });

      const trimmedKey = env.GEMINI_API_KEY.trim();
      const candidateModels = [
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-3.8-flash',
        'gemini-flash-latest'
      ];

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts
          }
        ],
        generationConfig: {
          temperature: 0.1
        }
      };

      requestBody.generationConfig.responseMimeType = 'application/json';

      let response = null;
      let lastErrorText = '';

      for (const model of candidateModels) {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        try {
          response = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': trimmedKey
            },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            break;
          }

          lastErrorText = await response.text();
          console.warn(`Model ${model} returned ${response.status}: ${lastErrorText}`);
        } catch (fetchErr) {
          lastErrorText = fetchErr.message;
          console.warn(`Fetch error for ${model}: ${fetchErr.message}`);
        }
      }

      // CRITICAL RULE — FOR NEWS CHECK: NO STALE KNOWLEDGE FALLBACK!
      // If real-time search grounding fails or is unavailable on all candidate models:
      if (isNewsCheck && (!response || !response.ok)) {
        console.warn('Google Search Grounding unavailable for News Check. Returning strict NEEDS VERIFICATION without stale knowledge fallback.');
        return new Response(
          JSON.stringify({
            imageDescription: imageBase64 ? 'Uploaded screenshot inspected.' : 'Text claim submitted.',
            detectedContentType: imageBase64 ? 'News article screenshot' : 'News claim',
            relevanceToChecker: 'Relevant to News Check',
            riskLevel: 'NEEDS VERIFICATION',
            riskScore: 40,
            warningSigns: [
              'Real-time web search verification could not be completed'
            ],
            explanation: 'Real-time web verification could not be completed, so this claim cannot be reliably verified at this time.',
            recommendedAction: 'Cross-check this claim manually through established news outlets or official announcements.',
            disclaimer: 'This educational platform evaluates digital misinformation. When real-time web verification is unavailable, claims cannot be reliably confirmed.',
            verificationStatus: 'NEEDS VERIFICATION',
            claim: text || 'Submitted news claim',
            evidenceSummary: 'Real-time web verification could not be completed, so this claim cannot be reliably verified at this time.',
            sources: []
          }),
          { status: 200, headers: CORS_HEADERS }
        );
      }

      if (!response || !response.ok) {
        return new Response(
          JSON.stringify({
            error: `All candidate Gemini models failed or reached quota: ${lastErrorText}`
          }),
          { status: 502, headers: CORS_HEADERS }
        );
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return new Response(
          JSON.stringify({ error: 'Gemini did not return an analysis response.' }),
          { status: 502, headers: CORS_HEADERS }
        );
      }

      const parsedResult = extractJsonFromText(rawText);
      if (!parsedResult) {
        console.error('Failed to parse Gemini JSON output:', rawText);
        return new Response(
          JSON.stringify({ error: 'Received malformed output format from Gemini AI.' }),
          { status: 502, headers: CORS_HEADERS }
        );
      }

      // 6. Extract Grounding Sources Strictly from Gemini Grounding Metadata
      const groundingSources = [];
      if (isNewsCheck) {
        const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const seenUrls = new Set();
        for (const chunk of chunks) {
          if (chunk.web?.uri && !seenUrls.has(chunk.web.uri)) {
            seenUrls.add(chunk.web.uri);
            groundingSources.push({
              title: chunk.web.title || chunk.web.uri,
              url: chunk.web.uri
            });
          }
        }
      }

      // 7. Sanitize and Form Final Response
      const finalResult = {
        imageDescription: parsedResult.imageDescription || (imageBase64 ? 'Uploaded image analyzed.' : 'Text input only.'),
        detectedContentType: parsedResult.detectedContentType || (imageBase64 ? 'Unknown/unclear' : 'Text input'),
        relevanceToChecker: parsedResult.relevanceToChecker || `Evaluated for ${type} Check`,
        riskLevel: sanitizeRiskLevel(parsedResult.riskLevel),
        riskScore: typeof parsedResult.riskScore === 'number' ? Math.min(100, Math.max(0, Math.round(parsedResult.riskScore))) : 0,
        warningSigns: Array.isArray(parsedResult.warningSigns) ? parsedResult.warningSigns : [],
        explanation: parsedResult.explanation || 'Analysis completed.',
        recommendedAction: parsedResult.recommendedAction || 'Exercise sensible digital hygiene.',
        disclaimer: parsedResult.disclaimer || 'This educational platform evaluates digital communication threats and phishing.'
      };

      // Add News-specific fields with STRICT NO-STALE RULE
      if (isNewsCheck) {
        const isPersonalPhoto = finalResult.detectedContentType === 'Personal photograph' ||
          (finalResult.relevanceToChecker && finalResult.relevanceToChecker.toLowerCase().includes('not relevant'));

        if (isPersonalPhoto) {
          // Unrelated photo rule
          finalResult.verificationStatus = 'INSUFFICIENT EVIDENCE';
          finalResult.claim = 'N/A - Non-news image';
          finalResult.evidenceSummary = 'The uploaded image is an ordinary photograph and does not contain a news claim or article to verify.';
          finalResult.sources = [];
          finalResult.riskScore = 0;
          finalResult.riskLevel = 'LOW RISK';
          finalResult.warningSigns = [];
        } else if (groundingSources.length === 0) {
          // ZERO GROUNDING CHUNKS: MUST NOT ASSERT FACTUAL TRUTH FROM STALE MEMORY
          finalResult.verificationStatus = 'NEEDS VERIFICATION';
          finalResult.riskLevel = 'NEEDS VERIFICATION';
          finalResult.riskScore = 40;
          finalResult.warningSigns = ['Real-time search verification could not obtain authoritative web sources'];
          finalResult.explanation = 'Real-time web verification could not be completed, so this claim cannot be reliably verified at this time.';
          finalResult.evidenceSummary = 'Real-time web verification could not be completed, so this claim cannot be reliably verified at this time.';
          finalResult.sources = [];
          finalResult.claim = parsedResult.claim || text || 'Submitted news claim';
        } else {
          // Grounding succeeded with real web chunks!
          finalResult.verificationStatus = sanitizeVerificationStatus(parsedResult.verificationStatus);
          finalResult.claim = parsedResult.claim || text || 'General news statement';
          finalResult.evidenceSummary = parsedResult.evidenceSummary || parsedResult.explanation || 'Verification performed using real-time web search sources.';
          finalResult.sources = groundingSources;
        }
      }

      // Add Link-specific fields
      if (isLinkCheck) {
        finalResult.url = linkInspection ? linkInspection.url : (parsedResult.url || text);
        finalResult.finalUrl = linkInspection ? linkInspection.finalUrl : (parsedResult.finalUrl || text);
        finalResult.httpStatus = linkInspection && linkInspection.httpStatus !== undefined ? linkInspection.httpStatus : (parsedResult.httpStatus || null);
        finalResult.contentType = linkInspection ? linkInspection.contentType : (parsedResult.contentType || 'text/html');
        finalResult.pageTitle = linkInspection ? linkInspection.pageTitle : (parsedResult.pageTitle || '');
        finalResult.domain = linkInspection ? linkInspection.domain : (parsedResult.domain || '');
        finalResult.https = linkInspection ? linkInspection.https : Boolean(parsedResult.https);
        finalResult.redirects = linkInspection ? linkInspection.redirects : (Array.isArray(parsedResult.redirects) ? parsedResult.redirects : []);
        finalResult.analysisEvidence = linkInspection ? linkInspection.analysisEvidence : (Array.isArray(parsedResult.analysisEvidence) ? parsedResult.analysisEvidence : []);
      }

      return new Response(JSON.stringify(finalResult), {
        status: 200,
        headers: CORS_HEADERS
      });
    } catch (fetchErr) {
      console.error('Worker request error:', fetchErr);
      return new Response(
        JSON.stringify({
          error: 'Network failure communicating with Gemini API.',
          details: fetchErr.message
        }),
        { status: 503, headers: CORS_HEADERS }
      );
    }
  }
};

// ---------------------------------------------------------------------------
// Helper Sanitizers
// ---------------------------------------------------------------------------

function extractJsonFromText(rawText) {
  if (!rawText) return null;
  let text = rawText.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sub = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sub);
      } catch {
        // Fall through to array extraction
      }
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const sub = text.substring(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(sub);
      } catch {
        return null;
      }
    }
  }
  return null;
}

function sanitizeRiskLevel(level) {
  const upper = (level || '').toUpperCase();
  if (upper.includes('HIGH') || upper.includes('CRITICAL')) return 'HIGH RISK';
  if (upper.includes('SUSPICIOUS')) return 'SUSPICIOUS';
  if (upper.includes('VERIFICATION') || upper.includes('MEDIUM')) return 'NEEDS VERIFICATION';
  return 'LOW RISK';
}

function sanitizeVerificationStatus(status) {
  const upper = (status || '').toUpperCase().trim();
  const valid = [
    'SUPPORTED',
    'LIKELY TRUE',
    'MIXED EVIDENCE',
    'NEEDS VERIFICATION',
    'LIKELY FALSE',
    'CONTRADICTED',
    'INSUFFICIENT EVIDENCE'
  ];
  if (valid.includes(upper)) return upper;
  if (upper.includes('SUPPORT') || upper.includes('TRUE')) return 'LIKELY TRUE';
  if (upper.includes('FALSE') || upper.includes('FAKE')) return 'LIKELY FALSE';
  if (upper.includes('CONTRADICT')) return 'CONTRADICTED';
  if (upper.includes('MIX')) return 'MIXED EVIDENCE';
  if (upper.includes('INSUFFICIENT')) return 'INSUFFICIENT EVIDENCE';
  return 'NEEDS VERIFICATION';
}
