async function verifyProduction() {
  const pagesUrl = 'https://digitalshield.pages.dev';
  const workerUrl = 'https://digitalshield-api.digitalshield-api.workers.dev';
  
  console.log('=== 1. VERIFYING PRODUCTION PWA & ASSETS ===');
  const assets = [
    '/',
    '/manifest.webmanifest',
    '/sw.js',
    '/favicon.svg',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
    '/apple-touch-icon.png'
  ];
  for (const a of assets) {
    const res = await fetch(pagesUrl + a);
    console.log(a, ':', res.status, res.headers.get('content-type'));
  }

  console.log('\n=== 2. VERIFYING PRODUCTION SPA ROUTES ===');
  const routes = [
    '/check',
    '/check/news',
    '/check/message',
    '/check/email',
    '/check/link',
    '/learn',
    '/learn/fake-news',
    '/training',
    '/practice',
    '/practice/fake-news',
    '/quiz',
    '/safety-tips',
    '/community-findings',
    '/community',
    '/login',
    '/signup',
    '/dashboard'
  ];
  for (const r of routes) {
    const res = await fetch(pagesUrl + r);
    const html = await res.text();
    const hasRoot = html.includes('id="root"');
    console.log(r, ':', res.status, hasRoot ? 'OK (SPA rewrite works)' : 'FAIL');
  }

  console.log('\n=== 3. VERIFYING PRODUCTION WORKER & APIS ===');
  const hRes = await fetch(workerUrl + '/health');
  console.log('Health:', await hRes.json());

  const genRes = await fetch(workerUrl + '/api/training/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'fake-news', count: 5 })
  });
  const genData = await genRes.json();
  console.log('Training Gen (Count 5):', genRes.status, 'Questions count:', genData.questions?.length);
  if (genData.questions?.[0]) {
    console.log('Sample scenario:', genData.questions[0].scenario.slice(0, 80));
    console.log('Sample options:', genData.questions[0].options);
  }

  const newsRes = await fetch(workerUrl + '/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'News', text: 'India won the 2024 ICC Men T20 World Cup' })
  });
  const newsData = await newsRes.json();
  console.log('News Analysis status:', newsRes.status, 'Verification Status:', newsData.verificationStatus, 'Sources:', newsData.sources?.length);

  const linkRes = await fetch(workerUrl + '/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'Link', text: 'https://example.com' })
  });
  const linkData = await linkRes.json();
  console.log('Link Analysis status:', linkRes.status, 'Risk Level:', linkData.riskLevel, 'HTTP Status:', linkData.httpStatus);
}

verifyProduction().catch(console.error);
