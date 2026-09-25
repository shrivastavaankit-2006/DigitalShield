const urls = [
  'https://digitalshield.pages.dev',
  'https://digitalshield.pages.dev/manifest.webmanifest',
  'https://digitalshield.pages.dev/manifest.json',
  'https://digitalshield.pages.dev/sw.js',
  'https://digitalshield.pages.dev/pwa-192x192.png',
  'https://digitalshield.pages.dev/pwa-512x512.png',
  'https://digitalshield.pages.dev/pwa-maskable-192x192.png',
  'https://digitalshield.pages.dev/pwa-maskable-512x512.png',
  'https://digitalshield.pages.dev/apple-touch-icon.png',
  'https://digitalshield.pages.dev/news',
  'https://digitalshield.pages.dev/message',
  'https://digitalshield.pages.dev/email',
  'https://digitalshield.pages.dev/link',
  'https://digitalshield.pages.dev/training',
  'https://digitalshield.pages.dev/quiz',
  'https://digitalshield.pages.dev/challenge',
  'https://digitalshield.pages.dev/dashboard'
];

async function check() {
  console.log('Testing live deployment endpoints on https://digitalshield.pages.dev...\n');
  let allPass = true;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || 'unknown';
      const buf = await res.arrayBuffer();
      const status = res.status;
      const ok = status >= 200 && status < 300;
      if (!ok) allPass = false;
      console.log(`${ok ? '✓ PASS' : '✗ FAIL'} [${status}] ${url}`);
      console.log(`       Type: ${contentType} | Size: ${buf.byteLength} bytes`);
    } catch (e) {
      allPass = false;
      console.error(`✗ FAIL [ERROR] ${url}: ${e.message}`);
    }
  }
  console.log(`\nOverall verification: ${allPass ? 'ALL PASSED' : 'SOME FAILED'}`);

  // Check live HTML and bundle for SW registration and manifest
  const indexHtml = await (await fetch('https://digitalshield.pages.dev')).text();
  console.log('\n--- Live HTML & Service Worker Check ---');
  console.log('index.html contains manifest link:', indexHtml.includes('/manifest.webmanifest'));
  console.log('index.html contains apple-touch-icon:', indexHtml.includes('/apple-touch-icon.png'));
  
  const jsMatch = indexHtml.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (jsMatch) {
    const liveJs = await (await fetch('https://digitalshield.pages.dev' + jsMatch[1])).text();
    console.log('Live bundle found:', jsMatch[1]);
    console.log('Live bundle registers /sw.js:', liveJs.includes('/sw.js'));
  }
}

check();
