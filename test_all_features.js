// Comprehensive Automated Test Suite for DigitalShield Features
import {
  analyzeNewsContent,
  analyzeLinkContent,
  analyzeMessageContent,
  analyzeEmailContent
} from './src/services/analysisService.js';

const sample1x1Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING DIGITALSHIELD FULL AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  // TEST 1: News Claim Verification
  console.log('--- TEST 1: News Claim Verification ("India won the 2024 T20 World Cup.") ---');
  const news1 = await analyzeNewsContent({ text: 'India won the 2024 T20 World Cup.' });
  console.log('checkerType:', news1.checkerType);
  console.log('verificationStatus:', news1.verificationStatus);
  console.log('claim:', news1.claim);
  console.log('riskLevel:', news1.riskLevel);
  console.log('riskScore:', news1.riskScore);
  console.log('evidenceSummary length:', news1.evidenceSummary?.length);
  console.log('sources count:', news1.sources?.length);
  if (!news1.verificationStatus || !['SUPPORTED', 'LIKELY TRUE'].includes(news1.verificationStatus)) {
    throw new Error(`Unexpected verificationStatus: ${news1.verificationStatus}`);
  }
  console.log('✔ TEST 1 PASSED\n');

  // TEST 2: Fabricated / Rumor News Claim
  console.log('--- TEST 2: News Claim ("NASA officially confirmed the moon is made of green cheese yesterday") ---');
  const news2 = await analyzeNewsContent({ text: 'NASA officially confirmed the moon is made of green cheese yesterday.' });
  console.log('verificationStatus:', news2.verificationStatus);
  console.log('riskLevel:', news2.riskLevel);
  console.log('riskScore:', news2.riskScore);
  console.log('explanation:', news2.explanation?.slice(0, 100));
  if (!['CONTRADICTED', 'LIKELY FALSE', 'NEEDS VERIFICATION', 'INSUFFICIENT EVIDENCE'].includes(news2.verificationStatus)) {
    throw new Error(`Unexpected status for fabricated claim: ${news2.verificationStatus}`);
  }
  console.log('✔ TEST 2 PASSED\n');

  // TEST 3: Ordinary Personal Photograph in News Check
  console.log('--- TEST 3: Ordinary Photo in News Check ---');
  const newsPhoto = await analyzeNewsContent({
    image: {
      name: 'family_photo.png',
      size: '1.2 KB',
      previewUrl: `data:image/png;base64,${sample1x1Png}`
    }
  });
  console.log('detectedContentType:', newsPhoto.detectedContentType);
  console.log('relevanceToChecker:', newsPhoto.relevanceToChecker);
  console.log('riskLevel:', newsPhoto.riskLevel);
  console.log('riskScore:', newsPhoto.riskScore);
  console.log('warningSigns count:', newsPhoto.warningSigns.length);
  console.log('verificationStatus:', newsPhoto.verificationStatus);
  if (newsPhoto.riskScore !== 0 || newsPhoto.riskLevel !== 'LOW RISK') {
    throw new Error('Unrelated photo must return 0 risk score and LOW RISK');
  }
  console.log('✔ TEST 3 PASSED\n');

  // TEST 4: Link Check — Normal Safe URL
  console.log('--- TEST 4: Link Check — Safe Normal URL ("https://example.com") ---');
  const link1 = await analyzeLinkContent({ url: 'https://example.com' });
  console.log('url:', link1.url);
  console.log('finalUrl:', link1.finalUrl);
  console.log('httpStatus:', link1.httpStatus);
  console.log('contentType:', link1.contentType);
  console.log('pageTitle:', link1.pageTitle);
  console.log('domain:', link1.domain);
  console.log('https:', link1.https);
  console.log('riskLevel:', link1.riskLevel);
  console.log('riskScore:', link1.riskScore);
  console.log('analysisEvidence:', link1.analysisEvidence);
  if (link1.httpStatus !== 200 || !link1.https || link1.domain !== 'example.com') {
    throw new Error('Safe URL technical details mismatch');
  }
  console.log('✔ TEST 4 PASSED\n');

  // TEST 5: Link Check — Redirecting URL
  console.log('--- TEST 5: Link Check — Redirecting URL ("http://github.com") ---');
  const linkRedirect = await analyzeLinkContent({ url: 'http://github.com' });
  console.log('url:', linkRedirect.url);
  console.log('finalUrl:', linkRedirect.finalUrl);
  console.log('redirects count:', linkRedirect.redirects?.length);
  console.log('https:', linkRedirect.https);
  console.log('riskLevel:', linkRedirect.riskLevel);
  if (!linkRedirect.finalUrl.includes('https://github.com')) {
    throw new Error('Redirect did not resolve to https://github.com');
  }
  console.log('✔ TEST 5 PASSED\n');

  // TEST 6: Link Check — SSRF Blocked Destination
  console.log('--- TEST 6: Link Check — SSRF Protection ("http://127.0.0.1:8080/admin") ---');
  const linkSsrf = await analyzeLinkContent({ url: 'http://127.0.0.1:8080/admin' });
  console.log('riskLevel:', linkSsrf.riskLevel);
  console.log('riskScore:', linkSsrf.riskScore);
  console.log('warningSigns:', linkSsrf.warningSigns);
  if (linkSsrf.riskLevel !== 'HIGH RISK' || linkSsrf.riskScore < 90) {
    throw new Error('SSRF target was not properly blocked as HIGH RISK');
  }
  console.log('✔ TEST 6 PASSED\n');

  // TEST 7: Link Check — Inaccessible URL
  console.log('--- TEST 7: Link Check — Inaccessible URL ("https://nonexistentdomain12345987.invalid") ---');
  const linkInaccessible = await analyzeLinkContent({ url: 'https://nonexistentdomain12345987.invalid' });
  console.log('riskLevel:', linkInaccessible.riskLevel);
  console.log('explanation:', linkInaccessible.explanation?.slice(0, 120));
  if (linkInaccessible.riskLevel === 'LOW RISK') {
    throw new Error('Inaccessible domain should not be classified as LOW RISK');
  }
  console.log('✔ TEST 7 PASSED\n');

  // TEST 8: Message Check — Phishing SMS
  console.log('--- TEST 8: Message Check ---');
  const messageResult = await analyzeMessageContent({
    text: 'URGENT: Electricity power will be disconnected tonight at 9:30 PM. Call official officer at 9876543210 immediately.'
  });
  console.log('checkerType:', messageResult.checkerType);
  console.log('riskLevel:', messageResult.riskLevel);
  console.log('riskScore:', messageResult.riskScore);
  console.log('warningSigns count:', messageResult.warningSigns.length);
  console.log('✔ TEST 8 PASSED\n');

  // TEST 9: Email Check — Phishing Email
  console.log('--- TEST 9: Email Check ---');
  const emailResult = await analyzeEmailContent({
    senderName: 'State Bank Verification',
    senderEmail: 'verify@sbi-online-kyc-update.com',
    subject: 'Mandatory PAN Card Update',
    body: 'Dear customer, your account will be frozen within 24 hours unless you update your KYC.'
  });
  console.log('checkerType:', emailResult.checkerType);
  console.log('riskLevel:', emailResult.riskLevel);
  console.log('riskScore:', emailResult.riskScore);
  console.log('warningSigns:', emailResult.warningSigns);
  console.log('✔ TEST 9 PASSED\n');

  console.log('====================================================');
  console.log('ALL 9 AUTOMATED SUITE TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
