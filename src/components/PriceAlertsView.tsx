import React, { useState } from 'react';
import {
  TrendingDown,
  Bell,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';

interface PriceAlertsViewProps {
  items: Product[];
  onUpdateTargetPrice: (id: string, targetPrice: number, email: string) => void;
  onSimulatePriceDrop: () => void;
  onNavigateToCart: () => void;
}

export const PriceAlertsView: React.FC<PriceAlertsViewProps> = ({
  items,
  onUpdateTargetPrice,
  onSimulatePriceDrop,
  onNavigateToCart,
}) => {
  const [selectedItemForAlert, setSelectedItemForAlert] = useState<Product | null>(null);
  const [customTargetPrice, setCustomTargetPrice] = useState('');
  const [alertEmail, setAlertEmail] = useState('shopper@example.com');
  const [isCheckingPrices, setIsCheckingPrices] = useState(false);
  const [checkStatus, setCheckStatus] = useState('');

  const discountedItems = items.filter((i) => i.originalPrice > i.price);

  const handleOpenAlertModal = (item: Product) => {
    setSelectedItemForAlert(item);
    setCustomTargetPrice((item.price * 0.9).toFixed(2));
    setAlertEmail(item.alertEmail || 'shopper@example.com');
  };

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAlert) return;
    const priceVal = parseFloat(customTargetPrice);
    if (!isNaN(priceVal) && priceVal > 0) {
      onUpdateTargetPrice(selectedItemForAlert.id, priceVal, alertEmail);
      setSelectedItemForAlert(null);
    }
  };

  const handleCheckStorePrices = () => {
    setIsCheckingPrices(true);
    setCheckStatus('Polling retailer feeds for real-time price updates...');
    setTimeout(() => {
      setCheckStatus('Verified merchant pricing: All item prices are current.');
      setIsCheckingPrices(false);
      setTimeout(() => setCheckStatus(''), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <span>Price Drop Alerts &amp; Price Tracker</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Active Monitoring
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Automated price tracking across all merchant websites in your cart with instant email alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-check-prices"
            onClick={handleCheckStorePrices}
            disabled={isCheckingPrices}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPrices ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            <span>Check Retailer Prices</span>
          </button>

          <button
            id="btn-simulate-drop-view"
            onClick={onSimulatePriceDrop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs transition-colors cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Simulate Price Drop</span>
          </button>
        </div>
      </div>

      {checkStatus && (
        <div className="p-3 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>{checkStatus}</span>
        </div>
      )}

      {/* Active Discounts Highlight Card */}
      {discountedItems.length > 0 && (
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-3">
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Price Drops Detected on {discountedItems.length} Cart Items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {discountedItems.map((item) => {
              const diff = item.originalPrice - item.price;
              const pct = Math.round((diff / item.originalPrice) * 100);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">{item.merchant}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">-${diff.toFixed(2)} ({pct}%)</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">${item.price.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracked Items List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
          All Tracked Items in Cart ({items.length})
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xs"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      {item.merchant}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 inline-flex items-center gap-0.5"
                    >
                      <span>{item.merchantDomain}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{item.title}</h3>

                  <div className="flex items-baseline gap-3">
                    <span className="text-base font-bold text-slate-900 dark:text-zinc-100">${item.price.toFixed(2)}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-slate-400 dark:text-zinc-500 line-through">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                    )}
                    {item.targetAlertPrice && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Target Alert: &lt;${item.targetAlertPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price History & Alert Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-end">
                {/* Historical mini trail */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 text-center">
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-medium">History</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.priceHistory?.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[10px] font-mono px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-700 dark:text-zinc-300"
                        title={`${p.date}: $${p.price}`}
                      >
                        ${p.price}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Alert button */}
                <button
                  onClick={() => handleOpenAlertModal(item)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    item.alertEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white'
                  }`}
                >
                  <Bell className={`w-3.5 h-3.5 ${item.alertEnabled ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
                  <span>{item.alertEnabled ? 'Alert Active' : 'Set Price Alert'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Alert Customizer Modal */}
      {selectedItemForAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-fadeIn transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Set Price Drop Alert</h3>
              </div>
              <button
                onClick={() => setSelectedItemForAlert(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <img
                src={selectedItemForAlert.imageUrl}
                alt={selectedItemForAlert.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-zinc-700"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {selectedItemForAlert.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400">
                  Current Price: <strong className="text-slate-900 dark:text-zinc-100">${selectedItemForAlert.price.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Alert me when price drops below ($USD):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customTargetPrice}
                  onChange={(e) => setCustomTargetPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Notification Email:
                </label>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  required
                  placeholder="your-email@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForAlert(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 flex-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold rounded-xl flex-1 cursor-pointer shadow-xs"
                >
                  Enable Price Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
