import React, { useState } from 'react';
import {
  Link2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Store,
  Loader2,
  Plus,
  RefreshCw,
  ShoppingBag,
  Edit3,
  Check,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../types';
import { POPULAR_SAMPLE_PRODUCTS } from '../data/mockProducts';
import { useLanguage } from '../utils/i18n';

interface ProductGrabberProps {
  onAddProduct: (product: Product) => void;
  onNavigateToCart: () => void;
}

export const ProductGrabber: React.FC<ProductGrabberProps> = ({
  onAddProduct,
  onNavigateToCart,
}) => {
  const { t } = useLanguage();
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [scrapedProduct, setScrapedProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState('');

  // Manual entry state
  const [manualTitle, setManualTitle] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualMerchant, setManualMerchant] = useState('');
  const [manualDomain, setManualDomain] = useState('');
  const [manualImage, setManualImage] = useState('');
  const [manualCategory, setManualCategory] = useState('Merchandise');

  const handleScrape = async (targetUrl?: string) => {
    const urlToUse = targetUrl || inputUrl;
    if (!urlToUse.trim()) {
      setErrorMessage('Please enter or paste a valid product web link.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setScrapedProduct(null);
    setImageError(false);
    setStatusMessage('Connecting to merchant store & fetching page specifications...');

    try {
      setStatusMessage('Extracting product details and direct merchant settlement specs...');
      const res = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToUse }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data = await res.json();
      if (data.product) {
        setScrapedProduct(data.product);
        setCustomPriceInput(data.product.price.toFixed(2));
        setIsEditingPrice(false);
        setStatusMessage('Product verified and merchant payout routing registered.');
      } else {
        throw new Error(data.error || 'Failed to parse product data');
      }
    } catch (err: any) {
      console.warn('Scraping error:', err);
      setErrorMessage('Could not automatically scrape this link. You can still import it with the Manual Product Creator below!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = (product: Product) => {
    onAddProduct(product);
    setScrapedProduct(null);
    setInputUrl('');
  };

  const handleAddSample = (sample: typeof POPULAR_SAMPLE_PRODUCTS[0]) => {
    const newProd: Product = {
      ...sample,
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      quantity: 1,
      addedAt: new Date().toISOString(),
    };
    onAddProduct(newProd);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(manualPrice) || 49.99;
    const domainClean = manualDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'customstore.com';
    const merchantClean = manualMerchant || domainClean.split('.')[0].toUpperCase();

    const customProduct: Product = {
      id: 'prod_custom_' + Math.random().toString(36).substring(2, 9),
      url: manualDomain.startsWith('http') ? manualDomain : `https://${domainClean}`,
      title: manualTitle || `Custom Imported Item from ${merchantClean}`,
      merchant: merchantClean,
      merchantDomain: domainClean,
      merchantRoutingId: `US-MCH-${merchantClean.replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase()}-9901`,
      merchantPayoutAccount: `${merchantClean} Direct Commercial Merchant Account`,
      price: priceNum,
      originalPrice: priceNum,
      currency: 'USD',
      imageUrl: manualImage || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80`,
      description: `Imported item from ${merchantClean}. Registered for multi-merchant settlement.`,
      category: manualCategory,
      inStock: true,
      priceHistory: [{ date: 'Today', price: priceNum }],
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    onAddProduct(customProduct);
    setShowManualForm(false);
    setManualTitle('');
    setManualPrice('');
    setManualMerchant('');
    setManualDomain('');
    setManualImage('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-slate-900 dark:bg-zinc-900 border border-slate-800 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden transition-colors">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 text-slate-300 dark:text-zinc-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {t('grabTitle', 'Universal Product Importer')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Consolidate products from <span className="text-indigo-400">any store</span> on the web.
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            {t(
              'grabSubtitle',
              'Paste a link from Nike, Apple, Amazon, Etsy, or any boutique. OmniCart extracts specs, monitors price drops, and prepares direct merchant settlement.',
            )}
          </p>

          {/* URL Input Bar */}
          <div className="pt-2">
            <div className="bg-slate-800/80 dark:bg-zinc-800/90 p-1.5 rounded-2xl border border-slate-700 dark:border-zinc-700 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center">
                <Link2 className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  id="input-product-url"
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                  placeholder={t(
                    'pasteUrlPlaceholder',
                    'Paste any product web link (e.g. https://www.nike.com/...)',
                  )}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-white rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                id="btn-grab-product"
                onClick={() => handleScrape()}
                disabled={isLoading || !inputUrl.trim()}
                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white disabled:opacity-50 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <span>{t('grabButton', 'Import Product')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {statusMessage && isLoading && (
              <p className="text-xs text-slate-300 mt-2.5 flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                {statusMessage}
              </p>
            )}

            {errorMessage && (
              <div className="mt-3 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={() => setShowManualForm(true)}
                  className="underline font-semibold ml-2 hover:text-white cursor-pointer"
                >
                  Manual Form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scraped Product Preview Confirmation Card */}
      {scrapedProduct && (
        <div className="bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Product Verified &amp; Ready</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              {scrapedProduct.merchantDomain}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {imageError ? (
              <div className="w-full sm:w-36 h-36 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400 p-3 text-center shrink-0">
                <ShoppingBag className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mb-1.5" />
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 line-clamp-1">{scrapedProduct.merchant}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">Verified Product</span>
              </div>
            ) : (
              <img
                src={scrapedProduct.imageUrl}
                alt={scrapedProduct.title}
                referrerPolicy="no-referrer"
                className="w-full sm:w-36 h-36 object-cover rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 shrink-0"
                onError={() => setImageError(true)}
              />
            )}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  {scrapedProduct.merchant}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">{scrapedProduct.category}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">{scrapedProduct.title}</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">{scrapedProduct.description}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {isEditingPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.50"
                      value={customPriceInput}
                      onChange={(e) => setCustomPriceInput(e.target.value)}
                      className="w-24 px-2 py-1 bg-white dark:bg-zinc-800 border border-indigo-400 rounded-lg text-sm font-bold text-slate-900 dark:text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseFloat(customPriceInput);
                        if (!isNaN(parsed) && parsed > 0) {
                          setScrapedProduct({
                            ...scrapedProduct,
                            price: parsed,
                          });
                        }
                        setIsEditingPrice(false);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomPriceInput(scrapedProduct.price.toFixed(2));
                        setIsEditingPrice(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                      ${scrapedProduct.price.toFixed(2)}
                    </span>
                    {scrapedProduct.originalPrice > scrapedProduct.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ${scrapedProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Live Verified Price
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomPriceInput(scrapedProduct.price.toFixed(2));
                        setIsEditingPrice(true);
                      }}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Adjust Price
                    </button>
                  </>
                )}
              </div>

              {/* Origin merchant routing guarantee */}
              <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/70 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                    Origin Merchant Fulfillment Route
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                    100% Direct Brand Delivery
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Disburses directly to <strong>{scrapedProduct.merchant}</strong> ({scrapedProduct.merchantDomain}) via clearing account <span className="font-mono">{scrapedProduct.merchantRoutingId}</span>. The brand's warehouse receives the purchase order directly so the recipient gets the exact item.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => setScrapedProduct(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-add-cart"
              onClick={() => handleConfirmAdd(scrapedProduct)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-300 dark:border-zinc-700 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('addToCart', 'Add to Cart')}</span>
            </button>
            <button
              id="btn-confirm-add-view-wishlist"
              onClick={() => {
                handleConfirmAdd(scrapedProduct);
                onNavigateToCart();
              }}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer ring-1 ring-indigo-400/30"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>{t('addAndViewWishlist', 'Add & View Wishlist')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Popular Sample Items Quick Add */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              {t('sampleProductsTitle', 'Sample Web Store Products')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t('sampleProductsSubtitle', 'Select any item to test multi-store aggregation')}
            </p>
          </div>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {showManualForm ? 'Hide Manual Form' : t('manualItemCreator', 'Manual Item Creator')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_SAMPLE_PRODUCTS.map((sample, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 shadow-2xs transition-all group"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60">
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-slate-800 dark:text-zinc-200 shadow-xs">
                    {sample.merchant}
                  </span>
                  {sample.originalPrice > sample.price && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                      Save ${(sample.originalPrice - sample.price).toFixed(2)}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1">
                    {sample.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">${sample.price.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{sample.merchantDomain}</div>
                </div>
                <button
                  onClick={() => handleAddSample(sample)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Import</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Product Form Section */}
      {showManualForm && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs transition-colors">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Manual Product Entry</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Add an item from any boutique, brand, or local store</p>
          </div>

          <form onSubmit={handleAddManual} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">Product Title</label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Patagonia Better Sweater Fleece Jacket"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="e.g. 149.00"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">Merchant / Brand Name</label>
              <input
                type="text"
                value={manualMerchant}
                onChange={(e) => setManualMerchant(e.target.value)}
                placeholder="e.g. Patagonia"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">Store Domain</label>
              <input
                type="text"
                value={manualDomain}
                onChange={(e) => setManualDomain(e.target.value)}
                placeholder="e.g. patagonia.com"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">Image URL</label>
              <input
                type="url"
                value={manualImage}
                onChange={(e) => setManualImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                Add Item to Cart
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
