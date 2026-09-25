const urls = [
  'https://digitalshield.pages.dev',
  'https://digitalshield.pages.dev/community-findings',
  'https://digitalshield.pages.dev/manifest.webmanifest',
  'https://digitalshield.pages.dev/sw.js'
];

async function verify() {
  console.log('=== Checking Live Production URLs ===\n');
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`[${res.status}] ${url}`);
    } catch (e) {
      console.error(`[FAIL] ${url}: ${e.message}`);
    }
  }

  // Check live HTML and active JS/CSS bundles
  const html = await (await fetch('https://digitalshield.pages.dev')).text();
  console.log('\n--- Live HTML & Asset Verification ---');
  
  const cssMatch = html.match(/href="(\/assets\/index-[^"]+\.css)"/);
  const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  
  if (cssMatch) {
    const cssUrl = 'https://digitalshield.pages.dev' + cssMatch[1];
    const css = await (await fetch(cssUrl)).text();
    console.log('Active CSS Bundle:', cssMatch[1]);
    console.log('Contains navbar__links--center:', css.includes('navbar__links--center'));
    console.log('Contains navbar__actions:', css.includes('navbar__actions'));
    console.log('Contains hero__ctas button hover isolation:', css.includes('hero__ctas:hover .btn:not(:hover)'));
  }

  if (jsMatch) {
    const jsUrl = 'https://digitalshield.pages.dev' + jsMatch[1];
    const js = await (await fetch(jsUrl)).text();
    console.log('Active JS Bundle:', jsMatch[1]);
    console.log('Contains centered nav link structure:', js.includes('navbar__links navbar__links--center'));
    console.log('Contains navbar__actions container:', js.includes('navbar__actions'));
    console.log('Contains survey N = 40 data:', js.includes('totalRespondents:40') || js.includes('totalRespondents: 40') || js.includes('N = 40'));
  }
}

verify();
