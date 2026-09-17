import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  Store,
  TrendingDown,
  Lock,
  Share2,
  PlusCircle,
  Truck,
  Tag,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  LayoutGrid,
  Layers,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { Product, AppliedPromoCode } from '../types';
import { CartItemCard } from './CartItemCard';
import { CartEmptyStateIllustration } from './EmptyStateIllustrations';
import { VerifiedOffersModal } from './VerifiedOffersModal';
import { useLanguage } from '../utils/i18n';

const cartItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.96,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const merchantGroupVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -18,
    scale: 0.98,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

interface CartViewProps {
  items: Product[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateVariant: (id: string, variant: string) => void;
  onOpenPriceAlertModal: (item: Product) => void;
  onProceedToCheckout: () => void;
  onOpenShareModal: () => void;
  onNavigateToGrab: () => void;
  onSimulatePriceDrop: () => void;
  onApplyPromoCode: (code: string, productId?: string) => Promise<any>;
  onRemovePromoCode: (productId: string) => void;
  onOpenAiAssistant?: (prompt?: string, mode?: 'chat' | 'compare' | 'recommend' | 'refund') => void;
  onClearCart?: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateVariant,
  onOpenPriceAlertModal,
  onProceedToCheckout,
  onOpenShareModal,
  onNavigateToGrab,
  onSimulatePriceDrop,
  onApplyPromoCode,
  onRemovePromoCode,
  onOpenAiAssistant,
  onClearCart,
}) => {
  const { t } = useLanguage();
  const [promoInput, setPromoInput] = useState('');
  const [isScanningPromo, setIsScanningPromo] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [promoScanResult, setPromoScanResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
    status?: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'consolidated'>('grouped');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Group items by Originating Merchant
  const groupedByMerchant = useMemo(() => {
    const groups: { [key: string]: { merchant: string; domain: string; routingId: string; payoutAccount: string; items: Product[]; subtotal: number } } = {};
    for (const item of items) {
      const key = item.merchantRoutingId || item.merchantDomain;
      if (!groups[key]) {
        groups[key] = {
          merchant: item.merchant,
          domain: item.merchantDomain,
          routingId: item.merchantRoutingId,
          payoutAccount: item.merchantPayoutAccount,
          items: [],
          subtotal: 0,
        };
      }
      groups[key].items.push(item);
      groups[key].subtotal += item.price * item.quantity;
    }
    return Object.values(groups);
  }, [items]);

  // Subtotal without promo discounts
  const grossSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // Total promo discounts applied across items
  const promoDiscountTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + (item.appliedPromo?.discountAmount || 0);
    }, 0);
  }, [items]);

  // List of all currently applied promo codes
  const activeAppliedPromos = useMemo(() => {
    return items
      .map((i) => i.appliedPromo)
      .filter((p): p is AppliedPromoCode => Boolean(p && p.discountAmount > 0));
  }, [items]);

  const totalSavings = useMemo(() => {
    return items.reduce((sum, item) => {
      const diff = item.originalPrice > item.price ? (item.originalPrice - item.price) * item.quantity : 0;
      return sum + diff;
    }, 0);
  }, [items]);

  const netTaxable = Math.max(0, grossSubtotal - promoDiscountTotal);
  const shipping = items.length === 0 ? 0 : items.length > 2 || netTaxable > 100 ? 0 : 9.99;
  const estimatedTax = Number((netTaxable * 0.0825).toFixed(2));
  const grandTotal = Number((netTaxable + shipping + estimatedTax).toFixed(2));

  const handleGlobalPromoScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsScanningPromo(true);
    setPromoScanResult(null);

    try {
      const res = await onApplyPromoCode(promoInput.trim());
      if (res && res.valid) {
        setPromoScanResult({
          success: true,
          status: 'VERIFIED',
          message: res.message || 'Promo code verified and applied!',
          details: res.appliedPromo,
        });
        setPromoInput('');
      } else {
        setPromoScanResult({
          success: false,
          status: res?.status || 'DENIED',
          message: res?.message || 'Promo code unrecognized. Verification denied.',
        });
      }
    } catch (err: any) {
      setPromoScanResult({
        success: false,
        status: 'DENIED',
        message: err.message || 'Verification rejected by merchant gateway.',
      });
    } finally {
      setIsScanningPromo(false);
    }
  };

  const handleApplyPreset = (code: string) => {
    setPromoInput(code);
    setPromoScanResult(null);
  };

  return (
    <>
      <AnimatePresence mode="wait">
      {items.length === 0 ? (
        <motion.div
          key="empty-cart-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 my-6 shadow-xs transition-colors"
        >
          {/* Professional SVG Empty State Illustration */}
          <CartEmptyStateIllustration className="w-64 h-44 mx-auto" />

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              Your Universal Cart is Empty
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Consolidate items from Nike, Apple, Amazon, or boutique web shops into one checkout.
              Each store ships directly from their verified warehouse.
            </p>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-empty-cart-grab"
              onClick={onNavigateToGrab}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white font-semibold text-xs rounded-xl inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Import Products from Web</span>
            </button>
          </div>

          {/* Multi-Store Trust & Security Footnote */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>PCI Level 1 Tokenized</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-indigo-500" />
              <span>Direct Merchant Payout</span>
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="active-cart-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="space-y-6"
        >
          {/* Top action header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-zinc-800 transition-colors">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
                <span>Universal Cart</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'} • {groupedByMerchant.length} {groupedByMerchant.length === 1 ? 'Store' : 'Stores'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Single payment with direct settlement and shipment from each originating brand.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Switcher */}
              <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setViewMode('grouped')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    viewMode === 'grouped'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                  title="Group items by originating merchant store"
                >
                  <Layers className="w-3 h-3" />
                  <span>By Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('consolidated')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    viewMode === 'consolidated'
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                  title="View all cart items in a single list"
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>All Items</span>
                </button>
              </div>

              {items.length >= 2 && (
                <button
                  onClick={() => onOpenAiAssistant?.('Please compare all items in my cart side-by-side with trade-offs, pricing, and merchant return windows.', 'compare')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-850 transition-colors cursor-pointer"
                  title="Compare all cart items side by side using AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Compare with AI</span>
                </button>
              )}

              <button
                onClick={() => onOpenAiAssistant?.('What accessories or complementary essentials do you recommend pairing with the items in my cart?', 'recommend')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-850 transition-colors cursor-pointer"
                title="Get AI recommended accessories for your cart"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Recommendations</span>
              </button>

              <button
                onClick={onSimulatePriceDrop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
                title="Simulate a price change to test automated drop tracking"
              >
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Simulate Price Drop</span>
              </button>

              <button
                id="btn-cart-share"
                onClick={onOpenShareModal}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-95 group ring-1 ring-indigo-400/40"
                title="Share this wishlist with friends, family, or followers"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.2] text-indigo-100 group-hover:scale-110 transition-transform" />
                <span>Share Wishlist</span>
              </button>

              <button
                id="btn-cart-clear-all"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-rose-900/50 shadow-2xs transition-colors cursor-pointer"
                title="Empty all items from your current cart session"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Left Items Grouped by Merchant, Right Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left column: Merchant Groups or Consolidated List */}
            <div className="lg:col-span-8 space-y-6">
              {viewMode === 'grouped' ? (
                <AnimatePresence mode="popLayout">
                  {groupedByMerchant.map((group) => {
                    const groupKey = group.routingId || group.domain || group.merchant;
                    return (
                      <motion.div
                        key={groupKey}
                        layout
                        variants={merchantGroupVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs transition-colors"
                      >
                        {/* Merchant Origin Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{group.merchant}</span>
                                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">{group.domain}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                <span>Ships directly from {group.merchant} fulfillment</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              Store Subtotal: ${group.subtotal.toFixed(2)}
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Direct Originating Settlement
                            </div>
                          </div>
                        </div>

                        {/* Items in this merchant group with Framer Motion enter and exit */}
                        <div className="space-y-3">
                          <AnimatePresence mode="popLayout">
                            {group.items.map((item) => (
                              <motion.div
                                key={item.id}
                                layout
                                variants={cartItemVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="w-full"
                              >
                                <CartItemCard
                                  item={item}
                                  onUpdateQuantity={onUpdateQuantity}
                                  onRemoveItem={onRemoveItem}
                                  onUpdateVariant={onUpdateVariant}
                                  onOpenPriceAlertModal={onOpenPriceAlertModal}
                                  onApplyPromoCode={(code, pid) => onApplyPromoCode(code, pid)}
                                  onRemovePromoCode={onRemovePromoCode}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              ) : (
                /* Consolidated View of All Cart Items with Framer Motion */
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        variants={cartItemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full"
                      >
                        <CartItemCard
                          item={item}
                          onUpdateQuantity={onUpdateQuantity}
                          onRemoveItem={onRemoveItem}
                          onUpdateVariant={onUpdateVariant}
                          onOpenPriceAlertModal={onOpenPriceAlertModal}
                          onApplyPromoCode={(code, pid) => onApplyPromoCode(code, pid)}
                          onRemovePromoCode={onRemovePromoCode}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

          <div className="flex justify-start pt-1">
            <button
              onClick={onNavigateToGrab}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Import another product from a web store link</span>
            </button>
          </div>
        </div>

        {/* Right column: Sticky Multi-Merchant Order Summary with Originating Promo Code Clearing */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5 transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">{items.length} items</span>
            </h2>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100">${grossSubtotal.toFixed(2)}</span>
              </div>

              {/* Promo Code Discount line item */}
              {promoDiscountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Store Promo Discounts ({activeAppliedPromos.length})</span>
                  </span>
                  <span>-${promoDiscountTotal.toFixed(2)}</span>
                </div>
              )}

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Price Drop Savings</span>
                  <span className="font-semibold">-${totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>Estimated Shipping</span>
                  <Truck className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                </span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase text-[11px]">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8.25%)</span>
                <span className="font-semibold text-slate-900 dark:text-zinc-100">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Total</span>
                <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Originating Store Promo Code Recognition & Validation Engine */}
            <div className="p-4 bg-gradient-to-b from-stone-50 to-stone-100/60 dark:from-zinc-900/90 dark:to-zinc-900/40 rounded-2xl border border-stone-200/90 dark:border-zinc-800 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-zinc-100">
                  <div className="w-5 h-5 rounded-md bg-stone-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
                    <Tag className="w-3 h-3 stroke-[2.2]" />
                  </div>
                  <span className="tracking-tight">{t('cart.promoCode')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOffersModalOpen(true)}
                  className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 transition-all cursor-pointer hover:shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{t('cart.browseVerifiedOffers')}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-snug">
                Enter an authorized coupon code. OmniCart verifies codes directly through our merchant clearing house; unrecognized codes are strictly denied.
              </p>

              <form onSubmit={handleGlobalPromoScan} className="space-y-2">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      if (promoScanResult) setPromoScanResult(null);
                    }}
                    placeholder={t('cart.promoPlaceholder')}
                    className="flex-1 px-3 py-2.5 text-xs bg-white dark:bg-zinc-950 border border-stone-300 dark:border-zinc-700 rounded-xl text-stone-900 dark:text-zinc-100 placeholder-stone-400 uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white shadow-2xs transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isScanningPromo || !promoInput.trim()}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-2xs"
                  >
                    {isScanningPromo ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>{t('cart.applyPromo')}</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Scan Feedback Banner: Verified vs Denied */}
              {promoScanResult && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                    promoScanResult.success
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800/80 shadow-2xs'
                      : 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200/90 dark:border-rose-800/80 shadow-2xs'
                  }`}
                >
                  {promoScanResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-[11px] uppercase tracking-wider">
                        {promoScanResult.success ? 'Verification Confirmed' : 'Voucher Denied'}
                      </span>
                      <span className="text-[10px] font-mono opacity-70">
                        {promoScanResult.status || (promoScanResult.success ? 'VERIFIED' : 'DENIED')}
                      </span>
                    </div>
                    <div className="text-[11px] leading-snug">
                      {promoScanResult.message}
                    </div>
                    {promoScanResult.details && (
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono pt-0.5">
                        Handshake: {promoScanResult.details.verificationRef} ({promoScanResult.details.merchant})
                      </div>
                    )}
                    {!promoScanResult.success && (
                      <div className="text-[10px] text-rose-700/90 dark:text-rose-400/90 pt-0.5 font-medium">
                        Only verified store campaigns in our clearing registry can be redeemed.
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromoScanResult(null)}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {/* Active applied promo codes chips */}
              {activeAppliedPromos.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-stone-200/80 dark:border-zinc-800">
                  <div className="text-[10px] font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t('cart.activePromos')}
                  </div>
                  <div className="space-y-1">
                    {activeAppliedPromos.map((promo, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center justify-between text-[11px] bg-white dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 truncate mr-2">
                          <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-bold text-stone-900 dark:text-zinc-100">{promo.code}</span>
                          <span className="text-stone-500 dark:text-zinc-400 text-[10px] truncate">
                            ({promo.merchant} - {promo.productTitle})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            -${promo.discountAmount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemovePromoCode(promo.productId)}
                            className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                            title="Remove promo code"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick sample codes for testing verified registry */}
              <div className="pt-1 text-[11px] text-stone-500 dark:text-zinc-400">
                <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-zinc-400 mb-1.5">
                  <span>Quick-test authorized registry:</span>
                  <span className="text-[9px] text-stone-400 dark:text-zinc-500 font-mono">100% Verified</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['OMNIWELCOME', 'LUXURY10', 'NIKE20', 'SONY50', 'APPLEEDU', 'EARTH15'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2 py-0.5 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-md text-[10px] font-mono text-stone-700 dark:text-zinc-300 hover:border-stone-900 hover:text-stone-900 dark:hover:border-white dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Merchant Settlement summary */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 text-xs space-y-2">
              <div className="font-medium text-slate-900 dark:text-zinc-200 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Direct Brand Payouts</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">Automated Clearing</span>
              </div>
              <div className="space-y-1 pt-0.5">
                {groupedByMerchant.map((group, idx) => {
                  const storeDiscount = group.items.reduce((s, i) => s + (i.appliedPromo?.discountAmount || 0), 0);
                  const netStorePayout = Math.max(0, group.subtotal - storeDiscount);
                  return (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-zinc-400 truncate max-w-[170px]">
                        {group.merchant}
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-slate-900 dark:text-zinc-200">
                          ${netStorePayout.toFixed(2)}
                        </span>
                        {storeDiscount > 0 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1">
                            (-${storeDiscount.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtle Security Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/50 text-[11px] text-slate-600 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>PCI-DSS Level 1 Vault:</strong> Card data is tokenized end-to-end.
              </span>
            </div>

            {/* Prominent Share Wishlist Card - Main App Feature */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-slate-50 dark:from-indigo-950/50 dark:via-violet-950/30 dark:to-zinc-900 border border-indigo-200 dark:border-indigo-800/70 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Share2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>Share Universal Wishlist</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded-md">
                      Main Feature
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Send to friends, family, or gift-givers
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-snug">
                Anyone with your private link can view this registry or buy items directly. Billing receipts are sent to the gift-buyer.
              </p>
              <button
                id="btn-sidebar-share-wishlist"
                type="button"
                onClick={onOpenShareModal}
                className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-indigo-50/50 dark:hover:bg-zinc-700/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-300/80 dark:border-indigo-700 shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Get Shareable Wishlist Link</span>
              </button>
            </div>

            {/* Checkout CTA */}
            <button
              id="btn-proceed-checkout"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              <span>Checkout All Stores (${grandTotal.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500">
              Gift-safe: Enter your email at checkout to isolate receipts from the cart creator.
            </p>

            {/* AI Assistant Quick Assistance Card */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    Shopping Concierge
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5 leading-snug">
                    Compare items, find accessories, or ask about merchant return policies before checkout.
                  </p>
                  <button
                    onClick={() => onOpenAiAssistant?.('Can you review the items in my cart and highlight return windows, warranty terms, and direct fulfillment details?', 'chat')}
                    className="mt-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ask AI Concierge</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    )}
  </AnimatePresence>

  {/* Confirmation Dialog for Clear All */}
  <AnimatePresence>
    {showClearConfirm && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-cart-dialog-title"
      >
        {/* Backdrop click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowClearConfirm(false)}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-zinc-100 z-10"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 id="clear-cart-dialog-title" className="text-base font-bold text-slate-950 dark:text-white">
                Empty Universal Cart?
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Are you sure you want to remove all {items.length} {items.length === 1 ? 'item' : 'items'} across{' '}
                {groupedByMerchant.length} {groupedByMerchant.length === 1 ? 'store' : 'stores'} from your current session? This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              id="btn-cancel-clear-cart"
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-confirm-clear-cart"
              onClick={() => {
                setShowClearConfirm(false);
                onClearCart?.();
              }}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Yes, Clear All</span>
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>

  {/* Verified Offers & Voucher Campaign Clearing Modal */}
  <VerifiedOffersModal
    isOpen={isOffersModalOpen}
    onClose={() => setIsOffersModalOpen(false)}
    cartItems={items}
    onSelectCode={(code) => {
      handleApplyPreset(code);
      onApplyPromoCode(code);
    }}
  />
  </>
  );
};
