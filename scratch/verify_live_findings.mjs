const urls = [
  'https://digitalshield.pages.dev',
  'https://digitalshield.pages.dev/community-findings',
  'https://digitalshield.pages.dev/community',
  'https://digitalshield.pages.dev/manifest.webmanifest',
  'https://digitalshield.pages.dev/sw.js',
  'https://digitalshield.pages.dev/pwa-192x192.png'
];

async function verify() {
  console.log('=== Verifying Production Deployment ===\n');
  
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`[${res.status}] ${url} (${res.headers.get('content-type')})`);
    } catch (e) {
      console.error(`[FAIL] ${url}: ${e.message}`);
    }
  }

  // Fetch the deployed main page and inspect bundle
  const html = await (await fetch('https://digitalshield.pages.dev/community-findings')).text();
  console.log('\n--- Live HTML Verification ---');
  console.log('HTML returned size:', html.length, 'bytes');
  console.log('Contains root element:', html.includes('id="root"'));
  console.log('Contains manifest link:', html.includes('manifest.webmanifest'));

  const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (jsMatch) {
    const jsUrl = 'https://digitalshield.pages.dev' + jsMatch[1];
    console.log('\n--- Live Bundle Verification ---');
    console.log('Live JS bundle:', jsUrl);
    const jsText = await (await fetch(jsUrl)).text();
    
    // Check for updated survey stats
    console.log('Contains N = 40 / totalRespondents 40:', jsText.includes('totalRespondents:40') || jsText.includes('totalRespondents: 40') || jsText.includes('N = 40'));
    console.log('Contains 80.0% fraud exposure:', jsText.includes('80.0%') || jsText.includes('80%'));
    console.log('Contains 62.5% fake news stat:', jsText.includes('62.5%'));
    console.log('Contains 47.5% banking vulnerability:', jsText.includes('47.5%'));
    console.log('Contains 67.5% awareness support:', jsText.includes('67.5%'));
    console.log('Contains cep.xlsx source reference:', jsText.includes('cep.xlsx'));
    console.log('Contains Community Insights & Recommendations:', jsText.includes('Community Insights') || jsText.includes('communityThemes'));
    console.log('Old dummy respondents (totalRespondents:150):', jsText.includes('totalRespondents:150') || jsText.includes('totalRespondents: 150'));
  }
}

verify();
