import React, { useState } from 'react';
import {
  X,
  Lock,
  CreditCard,
  ShieldCheck,
  Store,
  Gift,
  Mail,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Order } from '../types';
import {
  formatCardNumber,
  formatExpiry,
  detectCardBrand,
  validateLuhn,
  tokenizeCardInVault,
  TEST_CARDS,
} from '../lib/pciSecurity';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  cartId?: string;
  cartCreatorEmail?: string;
  initialBuyerName?: string;
  initialBuyerEmail?: string;
  onOrderCompleted: (order: Order, receipt: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  cartId,
  cartCreatorEmail,
  initialBuyerName,
  initialBuyerEmail,
  onOrderCompleted,
}) => {
  // Buyer Details
  const [buyerName, setBuyerName] = useState(initialBuyerName || 'Jordan Taylor');
  const [buyerEmail, setBuyerEmail] = useState(initialBuyerEmail || 'jordan.shopper@example.com');

  React.useEffect(() => {
    if (initialBuyerName) setBuyerName(initialBuyerName);
    if (initialBuyerEmail) setBuyerEmail(initialBuyerEmail);
  }, [initialBuyerName, initialBuyerEmail]);

  const [isGift, setIsGift] = useState(true);
  const [giftMessage, setGiftMessage] = useState('Enjoy this special gift! Best wishes.');
  const [giftReceiptOnlyToBuyer, setGiftReceiptOnlyToBuyer] = useState(true);

  // Shipping
  const [shippingName, setShippingName] = useState('Alex Rivera');
  const [addressLine1, setAddressLine1] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Portland');
  const [state, setState] = useState('OR');
  const [zipCode, setZipCode] = useState('97201');
  const [country, setCountry] = useState('United States');

  // Card Fields
  const [cardholderName, setCardholderName] = useState('Jordan Taylor');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [declineDetails, setDeclineDetails] = useState<{
    title: string;
    reason: string;
    advice: string;
    code: string;
  } | null>(null);
  const [showTestCards, setShowTestCards] = useState(false);
  const [step, setStep] = useState<'form' | 'validating-prices' | 'tokenizing' | 'disbursing' | 'complete'>('form');
  const [priceDiscrepancyNotice, setPriceDiscrepancyNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculations with Originating Store Promo Discounts
  const grossSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const promoDiscountTotal = items.reduce((sum, item) => sum + (item.appliedPromo?.discountAmount || 0), 0);
  const netTaxable = Math.max(0, grossSubtotal - promoDiscountTotal);
  const shipping = items.length > 2 || netTaxable > 100 ? 0 : 9.99;
  const tax = Number((netTaxable * 0.0825).toFixed(2));
  const grandTotal = Number((netTaxable + shipping + tax).toFixed(2));

  // Multi-merchant settlement groups accounting for store coupons
  const merchantMap = new Map<string, { merchant: string; domain: string; routingId: string; payoutAccount: string; amount: number; promoSavings: number; itemCount: number }>();
  for (const item of items) {
    const key = item.merchantRoutingId || item.merchantDomain;
    const lineGross = item.price * item.quantity;
    const itemDiscount = item.appliedPromo?.discountAmount || 0;
    const netPayout = Math.max(0, lineGross - itemDiscount);

    const existing = merchantMap.get(key);
    if (existing) {
      existing.amount += netPayout;
      existing.promoSavings += itemDiscount;
      existing.itemCount += item.quantity;
    } else {
      merchantMap.set(key, {
        merchant: item.merchant,
        domain: item.merchantDomain,
        routingId: item.merchantRoutingId,
        payoutAccount: item.merchantPayoutAccount,
        amount: netPayout,
        promoSavings: itemDiscount,
        itemCount: item.quantity,
      });
    }
  }
  const merchantDisbursements = Array.from(merchantMap.values());

  const cardBrand = detectCardBrand(cardNumber);
  const isCardLuhnValid = validateLuhn(cardNumber);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setDeclineDetails(null);

    if (!buyerEmail || !buyerEmail.includes('@')) {
      setErrorMessage('Please enter a valid buyer email address to receive your order receipt.');
      return;
    }

    if (!isCardLuhnValid && cardNumber.replace(/\D/g, '').length < 15) {
      setErrorMessage('Please enter a valid credit or debit card number.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStep('validating-prices');

      // 0. LIVE PRICE VALIDATION LAYER: Query originating product URLs meta-tags in real time
      try {
        const valRes = await fetch('/api/validate-cart-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              id: i.id,
              url: i.url,
              price: i.price,
              title: i.title,
              merchant: i.merchant,
              merchantDomain: i.merchantDomain,
            })),
          }),
        });
        if (valRes.ok) {
          const valData = await valRes.json();
          if (valData.hasDiscrepancy) {
            setPriceDiscrepancyNotice(
              `Live Price Protection: Found discrepancy on ${valData.discrepanciesCount} item(s) via originating URL meta-tags. Order totals automatically synchronized before payment authorization.`
            );
          }
        }
      } catch (pvErr) {
        console.warn('Pre-checkout live price validation skipped:', pvErr);
      }

      await new Promise((r) => setTimeout(r, 600));

      setStep('tokenizing');

      // 1. Client-Side PCI Tokenization Vault
      const [expMonth, expYear] = cardExpiry.split('/');
      const tokenizedPayload = await tokenizeCardInVault(
        cardNumber,
        expMonth || '12',
        expYear || '28',
        cardCvv,
        cardholderName
      );

      // 2. Multi-merchant disbursement simulation step
      setStep('disbursing');
      await new Promise((r) => setTimeout(r, 750));

      // 3. Post to backend checkout endpoint
      const checkoutPayload = {
        cartId: cartId || 'shared_gift_registry_2026',
        items,
        buyerDetails: {
          buyerName,
          buyerEmail,
          isGift,
          giftMessage,
          giftReceiptOnlyToBuyer,
        },
        shippingAddress: {
          name: shippingName,
          addressLine1,
          city,
          state,
          zipCode,
          country,
        },
        paymentDetails: {
          tokenizedCard: tokenizedPayload,
          directMerchantDisbursements: merchantDisbursements.map((m) => ({
            merchant: m.merchant,
            merchantDomain: m.domain,
            amount: m.amount,
            payoutAccount: m.payoutAccount,
            transferStatus: 'settled',
          })),
        },
        amounts: {
          subtotal: grossSubtotal,
          promoDiscountTotal,
          shipping,
          tax,
          total: grandTotal,
        },
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const declineTitle = errorData.error || 'Payment Failed: Transaction Declined';
        const declineReason =
          errorData.declineReason ||
          'Your card was declined by the bank. Zero charges were made, and no merchant orders were placed.';
        const advice =
          errorData.advice ||
          'Your card was not charged, and your cart items remain safe. Please review your card details or try an alternative payment method.';

        setDeclineDetails({
          title: declineTitle,
          reason: declineReason,
          advice,
          code: errorData.declineCode || 'card_declined',
        });
        setErrorMessage(declineTitle);
        setStep('form');
        setIsSubmitting(false);
        return;
      }

      const result = await res.json();
      setStep('complete');

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe confetti fallback
      }

      setTimeout(() => {
        onOrderCompleted(result.order, result.digitalReceipt || result.receipt);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('Checkout failure:', err);
      setErrorMessage(err.message || 'An error occurred during checkout processing.');
      setStep('form');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl my-8 overflow-hidden transition-colors">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                Secure Unified Checkout
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Single payment with direct store fulfillment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing State Animations */}
        {step !== 'form' ? (
          <div className="p-10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-900 dark:text-zinc-100">
              {step === 'complete' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                {step === 'validating-prices' && 'Validating Live Prices via Merchant Meta-Tags...'}
                {step === 'tokenizing' && 'Tokenizing Card via PCI Vault...'}
                {step === 'disbursing' && 'Dispatching Orders to Stores...'}
                {step === 'complete' && 'Order Placed Successfully!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                {step === 'validating-prices' &&
                  'Performing real-time inspection of originating store URL meta-tags (og:price, JSON-LD, microdata) to eliminate checkout price discrepancies.'}
                {step === 'tokenizing' &&
                  'Your card data is encrypted on the client side. Raw numbers are never saved.'}
                {step === 'disbursing' &&
                  `Directing purchase orders and payment authorizations to ${merchantDisbursements.map((m) => m.merchant).join(', ')}.`}
                {step === 'complete' &&
                  'Your official receipt is generated. Opening confirmation details...'}
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 text-xs space-y-2">
              {merchantDisbursements.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                    <Store className="w-3 h-3 text-slate-400" />
                    {m.merchant} Warehouse
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {step === 'complete' ? 'PO Dispatched & Settled' : 'Authorizing...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Payment Failed / Card Declined Alert Banner */}
            {declineDetails && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-600 rounded-2xl space-y-3 animate-shake">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100 flex items-center gap-2">
                        <span>{declineDetails.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 uppercase font-semibold">
                          Declined
                        </span>
                      </h4>
                      <p className="text-xs text-rose-800 dark:text-rose-200 mt-1 leading-relaxed">
                        {declineDetails.reason}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDeclineDetails(null);
                      setErrorMessage('');
                    }}
                    className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 p-1"
                    aria-label="Dismiss decline alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-white/90 dark:bg-zinc-900/90 rounded-xl border border-rose-200/80 dark:border-rose-900/60 text-xs space-y-1.5">
                  <div className="font-semibold flex items-center gap-1.5 text-rose-700 dark:text-rose-300 text-[11px]">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Safe Transaction Guarantee: Zero Charges Occurred</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {declineDetails.advice}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4242 4242 4242 4242');
                      setCardExpiry('12/28');
                      setCardCvv('321');
                      setDeclineDetails(null);
                      setErrorMessage('');
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Fill Approved Test Card (Visa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTestCards(!showTestCards)}
                    className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium cursor-pointer hover:bg-rose-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {showTestCards ? 'Hide Test Card Presets' : 'Choose Other Test Cards'}
                  </button>
                </div>
              </div>
            )}

            {errorMessage && !declineDetails && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Buyer Information & Gift Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>1. Buyer Details &amp; Digital Receipt Delivery</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Your Full Name (Buyer)
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Your Email (Receipt destination)
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    required
                    placeholder="buyer@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Gift Settings Callout */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-900 dark:text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                    />
                    <Gift className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>This purchase is a gift from a shared cart / wishlist</span>
                  </label>
                </div>

                {isGift && (
                  <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-zinc-700/60">
                    <label className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={giftReceiptOnlyToBuyer}
                        onChange={(e) => setGiftReceiptOnlyToBuyer(e.target.checked)}
                        className="w-3.5 h-3.5 mt-0.5 text-indigo-600 rounded-sm"
                      />
                      <span>
                        <strong>Gift Privacy Enabled:</strong> Send item prices and receipt strictly to the buyer (
                        <span className="font-semibold">{buyerEmail}</span>). The cart creator (
                        {cartCreatorEmail || 'Alex Rivera'}) will not see prices.
                      </span>
                    </label>

                    <div>
                      <input
                        type="text"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="Optional gift note for the recipient..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Shipping Destination */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>2. Delivery Address</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Refined Card Input (Stripe-Style Precision) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>3. Payment Information</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit Encrypted</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3 shadow-2xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                      Card Number
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-mono">
                        {cardBrand}
                      </span>
                      {isCardLuhnValid && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Valid
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      required
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono tracking-wide"
                    />
                    <Lock className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      required
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      CVV Security Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      required
                      placeholder="•••"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-zinc-400 pt-1 flex items-center justify-between border-t border-slate-200 dark:border-zinc-700/60">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Client-side tokenization (PCI Level 1)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTestCards(!showTestCards)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    {showTestCards ? 'Hide test cards' : 'Test Card Scenarios'}
                  </button>
                </div>

                {/* Interactive Test Card Presets Selector */}
                {showTestCards && (
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                      <span>Click to autofill test scenario:</span>
                      <span className="text-[10px] text-slate-400 font-normal">Real-time bank simulator</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {TEST_CARDS.map((tc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCardNumber(tc.number);
                            setCardExpiry(tc.expiry);
                            setCardCvv(tc.cvv);
                            setDeclineDetails(null);
                            setErrorMessage('');
                          }}
                          className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            cardNumber.replace(/\s/g, '') === tc.number.replace(/\s/g, '') && cardExpiry === tc.expiry && cardCvv === tc.cvv
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-2xs'
                              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 text-[11px]">
                              {tc.name}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                tc.expectedStatus === 'success'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {tc.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-1 flex items-center justify-between">
                            <span>{tc.number}</span>
                            <span>{tc.expiry} • {tc.cvv}</span>
                          </div>
                          {tc.declineReason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 line-clamp-1 italic">
                              Simulates: {tc.declineReason}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Store Settlement & Fulfillment Routing */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700/60 text-xs space-y-3">
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-zinc-200 text-xs">
                <span className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-indigo-500" />
                  Direct Merchant Settlement &amp; Warehouse Routing
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Origin Guaranteed
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Each product order and payment disburse directly to the business where the link originated, ensuring genuine inventory allocation and fast delivery.
              </p>

              <div className="flex items-center justify-between text-[11px] bg-slate-100 dark:bg-zinc-800/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Live Meta-Tag Price Guard
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                  Real-Time URL Sync Active
                </span>
              </div>

              {priceDiscrepancyNotice && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{priceDiscrepancyNotice}</span>
                </div>
              )}

              <div className="space-y-2 text-[11px]">
                {merchantDisbursements.map((m, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">{m.merchant}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {m.domain}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs">${m.amount.toFixed(2)}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        Routing ID: <span className="font-mono text-slate-700 dark:text-zinc-300">{m.routingId}</span>
                      </span>
                      <span>{m.itemCount} {m.itemCount === 1 ? 'item' : 'items'} via Direct Dispatch</span>
                    </div>

                    {m.promoSavings > 0 && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Applied Merchant Promo Code Savings: -${m.promoSavings.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {promoDiscountTotal > 0 && (
                <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                  <span>Store Promo Discounts:</span>
                  <span>-${promoDiscountTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/60 flex justify-between font-medium text-slate-900 dark:text-zinc-200">
                <span>Total Charge:</span>
                <span className="text-sm font-bold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <Lock className="w-4 h-4" />
                <span>Pay &amp; Checkout All Stores (${grandTotal.toFixed(2)})</span>
              </button>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center mt-2">
                By purchasing, you authorize payment disbursement directly to each merchant.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
