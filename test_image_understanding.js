import {
  analyzeEmailContent,
  analyzeMessageContent
} from './src/services/analysisService.js';

// Base64 of a sample 1x1 pixel image
const sampleImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function runRealBackendTests() {
  console.log('=== REAL GEMINI API TEST 1: Image Uploaded to Email Check ===');
  const imageResult = await analyzeEmailContent({
    image: {
      name: 'personal_photo.png',
      size: '1.2 KB',
      previewUrl: `data:image/png;base64,${sampleImageBase64}`
    }
  });

  console.log('imageDescription:', imageResult.imageDescription);
  console.log('detectedContentType:', imageResult.detectedContentType);
  console.log('relevanceToChecker:', imageResult.relevanceToChecker);
  console.log('riskLevel:', imageResult.riskLevel);
  console.log('riskScore:', imageResult.riskScore);
  console.log('warningSigns count:', imageResult.warningSigns.length);
  console.log('explanation:', imageResult.explanation);
  console.log('recommendedAction:', imageResult.recommendedAction);

  console.log('\n=== REAL GEMINI API TEST 2: Text-Only Phishing Detection in Email Check ===');
  const textResult = await analyzeEmailContent({
    senderName: 'Account Security Service',
    senderEmail: 'security-alert@suspicious-bank-login.xyz',
    subject: 'URGENT: Your account has been suspended',
    body: 'Your bank account has been blocked due to suspicious activity. Click http://verify-credentials.xyz within 2 hours or your funds will be permanently frozen.'
  });

  console.log('imageDescription:', textResult.imageDescription);
  console.log('detectedContentType:', textResult.detectedContentType);
  console.log('relevanceToChecker:', textResult.relevanceToChecker);
  console.log('riskLevel:', textResult.riskLevel);
  console.log('riskScore:', textResult.riskScore);
  console.log('warningSigns:', textResult.warningSigns);

  console.log('\n=== REAL GEMINI API TEST 3: Text + Image Multimodal in Message Check ===');
  const multimodalResult = await analyzeMessageContent({
    text: 'Claim your lottery prize of 10 Lakhs immediately by sending your UPI PIN to this number!',
    image: {
      name: 'lottery_proof.png',
      size: '1.2 KB',
      previewUrl: `data:image/png;base64,${sampleImageBase64}`
    }
  });

  console.log('imageDescription:', multimodalResult.imageDescription);
  console.log('detectedContentType:', multimodalResult.detectedContentType);
  console.log('relevanceToChecker:', multimodalResult.relevanceToChecker);
  console.log('riskLevel:', multimodalResult.riskLevel);
  console.log('riskScore:', multimodalResult.riskScore);
  console.log('warningSigns:', multimodalResult.warningSigns);

  console.log('\n=== ALL REAL GEMINI BACKEND TESTS COMPLETED SUCCESSFULLY ===');
}

runRealBackendTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
