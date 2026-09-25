// Utility to ensure Indian currency format is consistently used in training & quiz questions
export function formatIndianCurrency(text) {
  if (!text || typeof text !== 'string') return text;
  // Replace dollar signs ($500 -> ₹500, $10 -> ₹10, $50,000 -> ₹50,000)
  return text
    .replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)/g, '₹$1')
    .replace(/\$/g, '₹');
}
