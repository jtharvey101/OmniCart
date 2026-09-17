import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Tag,
  Copy,
  Check,
  X,
  Sparkles,
  Store,
} from 'lucide-react';
import { VerifiedPromoOffer, Product } from '../types';
import { useLanguage } from '../utils/i18n';

interface VerifiedOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  onSelectCode: (code: string) => void;
}

export const VerifiedOffersModal: React.FC<VerifiedOffersModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onSelectCode,
}) => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<VerifiedPromoOffer[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'cart_matches'>('cart_matches');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/verified-promo-offers')
        .then((r) => r.json())
        .then((data) => {
          if (data.offers) setOffers(data.offers);
        })
        .catch((e) => console.warn('Could not fetch verified promo offers:', e))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cartMerchants = new Set(cartItems.map((i) => i.merchant.toLowerCase()));
  const cartDomains = new Set(cartItems.map((i) => (i.merchantDomain || '').toLowerCase()));

  const filteredOffers = offers.filter((o) => {
    if (filter === 'all') return true;
    if (o.applicableScope === 'UNIVERSAL') return true;
    return (
      cartMerchants.has(o.merchant.toLowerCase()) ||
      cartDomains.has(o.merchantDomain.toLowerCase())
    );
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Metallic Amber/Emerald Header Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-zinc-800/90 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
                  {t('offersTitle', 'Verified Store Promo Registry')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  Strict Clearing
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                {t(
                  'offersSubtitle',
                  'Cryptographically registered merchant vouchers. Unrecognized codes are rejected by policy.'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Policy Strip */}
        <div className="bg-stone-50 dark:bg-zinc-950/60 px-5 sm:px-6 py-2.5 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-600 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium">
              Zero-Tolerance Unverified Coupon Policy active
            </span>
          </div>

          <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-zinc-800 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter('cart_matches')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                filter === 'cart_matches'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              My Stores ({cartMerchants.size})
            </button>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              All Retailers ({offers.length})
            </button>
          </div>
        </div>

        {/* List of Offers */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Querying merchant clearing house...
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Tag className="w-8 h-8 text-stone-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                No specific vouchers found for current cart retailers
              </p>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400 max-w-sm mx-auto">
                Universal codes like <code className="font-mono font-bold">OMNIWELCOME</code> and <code className="font-mono font-bold">LUXURY10</code> remain applicable to all carts.
              </p>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                View all partner vouchers ({offers.length})
              </button>
            </div>
          ) : (
            filteredOffers.map((offer) => {
              const isCartEligible =
                offer.applicableScope === 'UNIVERSAL' ||
                cartMerchants.has(offer.merchant.toLowerCase()) ||
                cartDomains.has(offer.merchantDomain.toLowerCase());

              return (
                <div
                  key={offer.code}
                  className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCartEligible
                      ? 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-2xs'
                      : 'bg-stone-50/70 dark:bg-zinc-900/40 border-stone-200/50 dark:border-zinc-800/50 opacity-75'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold tracking-wider px-2.5 py-1 rounded-xl bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                        {offer.code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                        {offer.badge}
                      </span>
                      {isCartEligible && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                          Eligible for your cart
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 dark:text-zinc-200 leading-snug">
                      {offer.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-400 dark:text-zinc-500 font-mono">
                      <span>Store: {offer.merchant}</span>
                      <span>•</span>
                      <span>Min spend: ${offer.minCartSpend.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(offer.code)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy promo code"
                    >
                      {copiedCode === offer.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectCode(offer.code);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Use Code</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-stone-50 dark:bg-zinc-950/80 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Codes are verified with originating merchants in real time</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200/80 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 hover:bg-stone-300 dark:hover:bg-zinc-700 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
