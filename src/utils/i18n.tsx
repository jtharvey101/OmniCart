import React, { createContext, useContext, ReactNode } from 'react';

export const TRANSLATIONS: Record<string, string> = {
  brandSubtitle: 'Universal Cart & Direct Settlement',
  universal: 'universal',
  cartTab: 'Universal Cart',
  importTab: 'Import URL',
  alertsTab: 'Price Alerts',
  ordersTab: 'Orders & Tracking',
  aiConcierge: 'AI Concierge',
  shareWishlist: 'Share Wishlist',
  signIn: 'Sign In',
  signOut: 'Sign Out',
  guestMode: 'Guest Mode',
  switchAccount: 'Switch or Link Account',
  securityRouting: 'Security & Routing',

  // Cart View
  cartHeaderTitle: 'Universal Cart',
  cartHeaderDesc: 'Multi-store items aggregated into a single encrypted settlement pipeline',
  viewGrouped: 'By Merchant',
  viewConsolidated: 'Consolidated',
  emptyCartTitle: 'Your Universal Cart is Empty',
  emptyCartDesc: 'Import products from any boutique, brand, or store on the web, or explore our curated sample catalog below.',
  exploreCatalog: 'Explore Sample Catalog',
  orderSummary: 'Order Summary',
  subtotal: 'Gross Subtotal',
  promoSavings: 'Verified Store Vouchers',
  shipping: 'Estimated Shipping',
  estimatedTax: 'Estimated Sales Tax',
  total: 'Total Due',
  promoCodeHeader: 'Originating Store Promo Code',
  promoCodeSubtext: 'Enter official voucher codes from originating stores. Unrecognized or invalid codes are strictly rejected.',
  promoInputPlaceholder: 'e.g. SONY50, NIKE20, OMNIWELCOME',
  applyPromo: 'Apply',
  validatingPromo: 'Validating with merchant...',
  promoDeniedTitle: 'Voucher Denied',
  promoVerifiedTitle: 'Voucher Verified',
  activeStoreVouchers: 'Active Store Vouchers',
  viewVerifiedOffers: 'View Verified Store Offers',
  guaranteedCheckout: 'Proceed to Multi-Store Checkout',
  pciGuaranteedNotice: 'Direct-to-merchant settlement via PCI Level 1 tokenized rails',
  clearCart: 'Clear Cart',
  simulatePriceDrop: 'Simulate Price Drop',
  merchantDirectDisbursement: 'Direct Merchant Disbursement',
  inStock: 'In Stock',
  removeFromCart: 'Remove',
  quantity: 'Qty',

  // Product Grabber
  grabTitle: 'Universal Product Importer',
  grabSubtitle: 'Paste any web product URL to fetch authentic specifications, merchant routing, and live pricing',
  pasteUrlPlaceholder: 'Paste link from Nike, Sony, Apple, Etsy, Amazon, Patagonia...',
  grabButton: 'Import Product',
  analyzingUrl: 'Connecting to origin retailer...',
  sampleProductsTitle: 'Sample Merchant Showcase',
  sampleProductsSubtitle: 'Instant pre-verified items to test cross-retailer checkout and promo clearing',
  manualItemCreator: 'Manual Item Creator',
  addToCart: 'Add to Cart',
  addAndViewWishlist: 'Add & View Cart',

  // Price Alerts
  priceAlertsTitle: 'Price Drop Sentinel',
  priceAlertsSubtitle: 'Real-time telemetry and target-price thresholds across all saved merchandise',

  // Orders & Tracking
  orderHistoryTitle: 'Orders & Origin Shipments',
  orderHistorySubtitle: 'Direct merchant fulfillment tracking, receipts, and automated return processing',

  // Verified Offers Modal
  offersTitle: 'Verified Active Merchant Offers',
  offersSubtitle: 'Official promotional codes authorized on the OmniCart clearing network',
  copyCode: 'Copy Code',
  codeCopied: 'Copied!',
  minSpendLabel: 'Min. spend:',
  retailerLabel: 'Retailer:',
  universalOffer: 'Universal',

  // Welcome / Auth Screen
  welcomeTitle: 'Welcome',
  welcomeBackTitle: 'Welcome Back',
  welcomeSubtitle: 'Import products from any website into a single universal cart with direct checkout.',
  welcomeBackSubtitle: 'Pick up right where you left off with your saved carts, wishlist items, and orders.',
  universalConcierge: 'Universal Shopping Concierge',
  recognizedMemberSession: 'Recognized Member Session',
  tabSignIn: 'Sign In',
  tabCreateAccount: 'Create Account',
  continueWithGoogle: 'Continue with Google',
  continueWithApple: 'Continue with Apple',
  orContinueWith: 'or continue with',
  methodEmail: 'Email',
  methodPhone: 'Phone SMS',
  fullName: 'Full Name',
  fullNamePlaceholder: 'Alex Rivera',
  emailAddress: 'Email Address',
  password: 'Password',
  rememberMe: 'Remember me on this browser',
  forgotPassword: 'Forgot password?',
  signInButton: 'Sign In to OmniCart',
  createAccountButton: 'Create Free OmniCart Account',
  continueAsGuest: 'Continue as Guest',
  pciCertifiedNotice: 'PCI DSS Level 1 Certified • End-to-End Encryption',
};

export interface LanguageContextType {
  language: string;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: (key: string, defaultText?: string) => TRANSLATIONS[key] || defaultText || key,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const t = (key: string, defaultText?: string): string => {
    return TRANSLATIONS[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'en', t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
};
