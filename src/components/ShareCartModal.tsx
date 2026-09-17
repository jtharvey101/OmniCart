import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  X,
  Gift,
  Download,
  Smartphone,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Cart } from '../types';

interface ShareCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateCartMeta: (title: string, ownerName: string, ownerEmail: string) => void;
}

export const ShareCartModal: React.FC<ShareCartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateCartMeta,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const [title, setTitle] = useState(cart.title || "Alex's Universal Wishlist Cart");
  const [ownerName, setOwnerName] = useState(cart.ownerName || 'Alex Rivera');
  const [ownerEmail, setOwnerEmail] = useState(cart.ownerEmail || 'alex.rivera.wishlist@example.com');

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?cart=${cart.id || 'shared_gift_registry_2026'}`;
  const totalItems = cart.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalPrice = cart.items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  // Generate real, high-resolution QR code whenever shareUrl or modal visibility changes
  useEffect(() => {
    let isMounted = true;
    setQrGenerating(true);
    setQrError(null);

    QRCode.toDataURL(shareUrl, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setQrGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        if (isMounted) {
          setQrError('Failed to generate QR code. Please copy link instead.');
          setQrGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [shareUrl, isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = qrDataUrl;
    downloadLink.download = `omnicart-wishlist-${cart.id || 'shared'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCartMeta(title, ownerName, ownerEmail);
    handleCopy();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-6 animate-fadeIn transition-colors">
        {/* Header */}
        <div className="p-5 pb-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center shadow-2xs shrink-0">
              <Share2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Share Universal Wishlist</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {totalItems} item{totalItems !== 1 ? 's' : ''} • ${totalPrice.toFixed(2)} total
              </p>
            </div>
          </div>
          <button
            id="btn-close-share-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 flex gap-2">
          <button
            id="tab-qr-code"
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'qr'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Mobile QR Code</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
              Scan
            </span>
          </button>
          <button
            id="tab-share-link"
            type="button"
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === 'link'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Link &amp; Settings</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* TAB 1: QR CODE TAB */}
          {activeTab === 'qr' && (
            <div className="space-y-4 animate-fadeIn">
              {/* QR Code Presentation Canvas */}
              <div className="p-5 bg-gradient-to-b from-slate-50 to-indigo-50/30 dark:from-zinc-800/40 dark:to-indigo-950/20 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 flex flex-col items-center justify-center text-center space-y-3.5">
                {/* QR Code Frame with corner scan indicators */}
                <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200/90 dark:border-zinc-200">
                  {/* Scanner aesthetic corner markers */}
                  <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-indigo-600 rounded-tl-sm pointer-events-none" />
                  <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-indigo-600 rounded-tr-sm pointer-events-none" />
                  <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-indigo-600 rounded-bl-sm pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-indigo-600 rounded-br-sm pointer-events-none" />

                  {qrGenerating ? (
                    <div className="w-48 h-48 sm:w-52 sm:h-52 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                      <span className="text-xs">Generating QR...</span>
                    </div>
                  ) : qrError ? (
                    <div className="w-48 h-48 sm:w-52 sm:h-52 flex flex-col items-center justify-center gap-2 text-rose-500 p-3 text-center">
                      <p className="text-xs">{qrError}</p>
                    </div>
                  ) : (
                    <img
                      src={qrDataUrl}
                      alt="Scannable Wishlist QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg select-none"
                    />
                  )}
                </div>

                <div className="space-y-1 max-w-sm">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Scan with iPhone Camera or Android Lens</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 pt-1">
                    Opens this wishlist immediately on mobile without installing an app. Recipients can view items, claim individual gifts, or checkout.
                  </p>
                </div>

                {/* Direct Action Buttons for QR */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
                  <button
                    id="btn-download-qr-code"
                    type="button"
                    onClick={handleDownloadQr}
                    disabled={!qrDataUrl || qrGenerating}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/80 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-slate-300 dark:border-zinc-700 shadow-2xs hover:shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    id="btn-copy-qr-link"
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Share Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Open link in new browser tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Link</span>
                  </a>
                </div>
              </div>

              {/* Gift Privacy Callout */}
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 rounded-xl flex items-start gap-2.5 text-xs">
                <Gift className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                  <strong>Gift Privacy Protected:</strong> Mobile purchasers input their own payment method and recipient email so prices and receipts stay confidential from the registry owner.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: LINK & SETTINGS TAB */}
          {activeTab === 'link' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Share URL copy bar */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                  Shareable Wishlist URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-zinc-300 truncate select-all">
                    {shareUrl}
                  </div>
                  <button
                    id="btn-copy-share-url"
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick switch to QR button */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                  <QrCode className="w-4 h-4 text-indigo-500" />
                  <span>Prefer scanning with your phone?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  View QR Code &rarr;
                </button>
              </div>

              {/* Cart Owner & Title Configuration */}
              <form onSubmit={handleSaveMeta} className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Wishlist / Cart Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Birthday Wishlist 2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Creator Name
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      Owner Notification Email
                    </label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold rounded-xl cursor-pointer shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save &amp; Copy Link</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

