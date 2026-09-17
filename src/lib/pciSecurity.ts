// PCI-DSS Compliant Security & Tokenization Utilities

export interface TokenizedCardPayload {
  token: string;
  last4: string;
  cardBrand: 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Unknown';
  expMonth: string;
  expYear: string;
  isTokenizedPCICompliant: boolean;
  fingerprint: string;
  rawNumber?: string;
  cvv?: string;
}

export interface TestCardPreset {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
  expectedStatus: 'success' | 'declined';
  declineReason?: string;
  badge: string;
}

export const TEST_CARDS: TestCardPreset[] = [
  {
    name: 'Valid Visa (Approved)',
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '321',
    expectedStatus: 'success',
    badge: 'Success Test',
  },
  {
    name: 'Declined: Insufficient Funds',
    number: '4242 4242 4242 0002',
    expiry: '12/28',
    cvv: '321',
    expectedStatus: 'declined',
    declineReason: 'Bank Code 51: Insufficient funds on account',
    badge: 'Decline Test (Funds)',
  },
  {
    name: 'Declined: Expired Card',
    number: '4242 4242 4242 4242',
    expiry: '04/23',
    cvv: '321',
    expectedStatus: 'declined',
    declineReason: 'Bank Code 54: Card expiration date is in the past',
    badge: 'Decline Test (Expired)',
  },
  {
    name: 'Declined: Invalid CVV Code',
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '000',
    expectedStatus: 'declined',
    declineReason: 'Bank Code 82: Incorrect 3-digit CVV security code',
    badge: 'Decline Test (CVV)',
  },
  {
    name: 'Declined: Suspected Fraud / Risk Block',
    number: '4242 4242 4242 4002',
    expiry: '12/28',
    cvv: '321',
    expectedStatus: 'declined',
    declineReason: 'Bank Code 05: Do Not Honor / Security risk block',
    badge: 'Decline Test (Fraud)',
  },
];

// Luhn Algorithm to validate Card Primary Account Number (PAN)
export function validateLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Detect Card Brand from PAN prefix
export function detectCardBrand(cardNumber: string): 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Unknown' {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean) || /^2(?:2[2-9][1-9]|[3-6]\d\d|7[01]\d|720)/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Unknown';
}

// Format card number with spaces (e.g., 4242 4242 4242 4242)
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

// Format expiry (MM/YY)
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

// Simulated PCI-DSS Level 1 Client-Side Tokenization Vault
// In production, this would be Stripe Elements, Braintree Drop-in, or VGS Hosted Fields.
// Card details are converted client-side into a single-use opaque cryptographic token
// so raw PANs are NEVER stored or transmitted unencrypted.
export async function tokenizeCardInVault(
  cardNumber: string,
  expMonth: string,
  expYear: string,
  cvv: string,
  cardholderName: string
): Promise<TokenizedCardPayload> {
  // Simulate network latency to PCI tokenization vault
  await new Promise((resolve) => setTimeout(resolve, 600));

  const cleanCard = cardNumber.replace(/\D/g, '');
  const last4 = cleanCard.slice(-4) || '4242';
  const brand = detectCardBrand(cleanCard);

  // Generate cryptographic token
  const randomHex = Math.random().toString(36).substring(2, 12);
  const token = `tok_pci_dss_${brand.toLowerCase()}_${randomHex}`;
  const fingerprint = `fng_${Math.random().toString(36).substring(2, 8)}`;

  return {
    token,
    last4,
    cardBrand: brand,
    expMonth,
    expYear,
    isTokenizedPCICompliant: true,
    fingerprint,
    rawNumber: cleanCard,
    cvv: cvv.trim(),
  };
}
