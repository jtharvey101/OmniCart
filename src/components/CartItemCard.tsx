import React, { useState } from 'react';
import {
  Trash2,
  TrendingDown,
  Bell,
  ExternalLink,
  Plus,
  Minus,
  Store,
  Tag,
  X,
  CheckCircle2,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '../types';

interface CartItemCardProps {
  item: Product;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateVariant: (id: string, variant: string) => void;
  onOpenPriceAlertModal: (item: Product) => void;
  onApplyPromoCode?: (code: string, productId: string) => Promise<any>;
  onRemovePromoCode?: (productId: string) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateVariant,
  onOpenPriceAlertModal,
  onApplyPromoCode,
  onRemovePromoCode,
}) => {
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showInlinePromoInput, setShowInlinePromoInput] = useState(false);
  const [inlinePromoCode, setInlinePromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [inlinePromoError, setInlinePromoError] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

  const isDiscounted = item.originalPrice > item.price;
  const savings = item.originalPrice - item.price;

  const hasAppliedPromo = Boolean(item.appliedPromo && item.appliedPromo.discountAmount > 0);
  const promoSavings = hasAppliedPromo ? item.appliedPromo!.discountAmount : 0;
  const lineSubtotal = item.price * item.quantity;
  const effectiveLineTotal = Math.max(0, lineSubtotal - promoSavings);

  const handleInlinePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlinePromoCode.trim() || !onApplyPromoCode) return;
    setIsApplyingPromo(true);
    setInlinePromoError('');
    try {
      const res = await onApplyPromoCode(inlinePromoCode, item.id);
      if (res && res.valid) {
        setShowInlinePromoInput(false);
        setInlinePromoCode('');
      } else if (res && res.message) {
        setInlinePromoError(res.message);
      }
    } catch (err: any) {
      setInlinePromoError(err.message || 'Validation failed');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="relative w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-center">
          {imgFailed ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 p-2 text-center">
              <ShoppingBag className="w-6 h-6 text-indigo-500 mb-1" />
              <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-300 truncate max-w-full">{item.merchant}</span>
            </div>
          ) : (
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          )}
          {hasAppliedPromo ? (
            <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" />
              -${promoSavings.toFixed(2)} Off
            </span>
          ) : isDiscounted ? (
            <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              -${savings.toFixed(2)}
            </span>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-medium text-slate-900 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
                  {item.merchant}
                </span>
                <span>•</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-zinc-200 inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400"
                >
                  <span>{item.merchantDomain}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-1 line-clamp-1">
                {item.title}
              </h3>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              <div className="text-base font-bold text-slate-900 dark:text-zinc-100">
                ${effectiveLineTotal.toFixed(2)}
              </div>
              {hasAppliedPromo && (
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 line-through">
                  ${lineSubtotal.toFixed(2)}
                </div>
              )}
              {item.quantity > 1 && (
                <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                  ${item.price.toFixed(2)} each
                </div>
              )}
              {!hasAppliedPromo && isDiscounted && (
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 line-through">
                  ${(item.originalPrice * item.quantity).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Variants selector if available */}
          {item.availableVariants && item.availableVariants.length > 1 && (
            <div className="flex items-center gap-2 text-xs pt-0.5">
              <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Variant:</span>
              <select
                value={item.selectedVariant || item.availableVariants[0]}
                onChange={(e) => onUpdateVariant(item.id, e.target.value)}
                className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {item.availableVariants.map((variant, vIdx) => (
                  <option key={vIdx} value={variant}>
                    {variant}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Applied Store Promo Code Badge */}
          {item.appliedPromo && (
            <div className="flex items-center gap-2 pt-0.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-medium shadow-2xs">
                <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>{item.appliedPromo.code}:</strong> -${item.appliedPromo.discountAmount.toFixed(2)} ({item.appliedPromo.merchant})
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono hidden sm:inline">
                  [{item.appliedPromo.verificationRef}]
                </span>
                {onRemovePromoCode && (
                  <button
                    type="button"
                    onClick={() => onRemovePromoCode(item.id)}
                    className="ml-1 p-0.5 text-emerald-600 hover:text-rose-600 dark:text-emerald-400 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title="Remove this promo code"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Merchant fulfillment, Promo trigger, & Alert controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60">
              <Store className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
              Direct from {item.merchant}
            </span>

            {/* Inline Add Promo Code Button */}
            {!item.appliedPromo && (
              <button
                type="button"
                onClick={() => setShowInlinePromoInput(!showInlinePromoInput)}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>Add {item.merchant} Promo</span>
              </button>
            )}

            {/* Price Alert Indicator */}
            {item.alertEnabled ? (
              <button
                onClick={() => onOpenPriceAlertModal(item)}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
              >
                <Bell className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400" />
                Alert on (&lt;${item.targetAlertPrice?.toFixed(2)})
              </button>
            ) : (
              <button
                onClick={() => onOpenPriceAlertModal(item)}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors border border-slate-200 dark:border-zinc-700 cursor-pointer"
              >
                <TrendingDown className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                Track Price Drop
              </button>
            )}

            <button
              onClick={() => setShowPriceHistory(!showPriceHistory)}
              className="text-[11px] text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 underline ml-auto cursor-pointer"
            >
              {showPriceHistory ? 'Hide history' : 'Price history'}
            </button>
          </div>

          {/* Inline Promo Code Input Popover/Drawer */}
          {showInlinePromoInput && !item.appliedPromo && (
            <form onSubmit={handleInlinePromoSubmit} className="pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    Enter coupon code from {item.merchantDomain}:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInlinePromoInput(false);
                      setInlinePromoError('');
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inlinePromoCode}
                    onChange={(e) => {
                      setInlinePromoCode(e.target.value.toUpperCase());
                      setInlinePromoError('');
                    }}
                    placeholder={`e.g. ${item.merchant.replace(/[^A-Z]/gi, '').slice(0, 4).toUpperCase()}15 or SAVE15`}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 placeholder-slate-400 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingPromo || !inlinePromoCode.trim()}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isApplyingPromo ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>
                </div>
                {inlinePromoError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 leading-tight">
                    {inlinePromoError}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Expanded Price History Sparkline / Table */}
      {showPriceHistory && item.priceHistory && item.priceHistory.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs bg-slate-50/70 dark:bg-zinc-800/40 p-3 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between font-medium text-slate-700 dark:text-zinc-300 text-[11px]">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-indigo-500" />
              Verified Price History
            </span>
            <span className="text-slate-900 dark:text-zinc-100 font-bold">
              Current: ${item.price.toFixed(2)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {item.priceHistory.map((point, pIdx) => (
              <div key={pIdx} className="bg-white dark:bg-zinc-800/80 p-2 rounded-lg border border-slate-200/80 dark:border-zinc-700/60 text-center">
                <div className="text-[10px] text-slate-400 dark:text-zinc-500">{point.date}</div>
                <div className="font-bold text-slate-900 dark:text-zinc-100 text-xs">${point.price.toFixed(2)}</div>
                {point.note && (
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">{point.note}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls: Quantity stepper & Remove */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Quantity:</span>
          <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-l-lg text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-3 font-semibold text-slate-800 dark:text-zinc-200 text-xs">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-r-lg text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <button
          onClick={() => onRemoveItem(item.id)}
          className="text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">Remove</span>
        </button>
      </div>
    </div>
  );
};
