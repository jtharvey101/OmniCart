import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  PlusCircle,
  TrendingDown,
  Clock,
  ShieldCheck,
  Share2,
  Sun,
  Moon,
  Sparkles,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import { AuthUser } from '../types';
import { useLanguage } from '../utils/i18n';

interface NavbarProps {
  activeTab: 'cart' | 'grab' | 'alerts' | 'orders';
  setActiveTab: (tab: 'cart' | 'grab' | 'alerts' | 'orders') => void;
  cartItemCount: number;
  cartTotal: number;
  orderCount: number;
  alertCount: number;
  onOpenShare: () => void;
  onOpenSecurity: () => void;
  onOpenAiAssistant: () => void;
  isSharedCartView?: boolean;
  sharedCartOwner?: string;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartItemCount,
  cartTotal,
  orderCount,
  alertCount,
  onOpenShare,
  onOpenSecurity,
  onOpenAiAssistant,
  isSharedCartView,
  sharedCartOwner,
  darkMode = false,
  onToggleDarkMode,
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const { t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/95 dark:bg-[#0C0E14]/95 backdrop-blur-xl border-b border-stone-200/80 dark:border-white/[0.08] transition-colors duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {/* Subtle Shared Cart Context Banner if applicable */}
      {isSharedCartView && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Share2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Shared Wishlist Cart:</strong> You are viewing items added by{' '}
              <strong>{sharedCartOwner || 'Alex Rivera'}</strong>. You can add more items, buy as a gift, or share.
            </span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              id="brand-logo-button"
              onClick={() => setActiveTab('cart')}
              className="flex items-center gap-3 cursor-pointer group select-none py-1"
              title="OmniCart Universal Checkout"
            >
              {/* Sculpted Tactile App Mark */}
              <div className="relative w-9 h-9 rounded-xl bg-stone-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.4)] border border-stone-800 dark:border-zinc-300 transition-all duration-200 group-hover:scale-[1.04]">
                <ShoppingBag className="w-4.5 h-4.5 stroke-[2.2] text-white dark:text-zinc-950" />
                {/* Active Protocol Live Status Node */}
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-white dark:ring-zinc-900"></span>
                </span>
              </div>

              {/* Wordmark with Custom Typographic Weight Pairing */}
              <div className="flex items-center gap-2">
                <div className="flex items-baseline tracking-[-0.035em]">
                  <span className="font-extrabold text-[19px] text-stone-950 dark:text-white leading-none">
                    omni
                  </span>
                  <span className="font-medium text-[19px] text-stone-500 dark:text-zinc-400 leading-none ml-[0.5px]">
                    cart
                  </span>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-tight bg-stone-100/90 dark:bg-zinc-800/90 text-stone-600 dark:text-zinc-300 border border-stone-200/80 dark:border-white/[0.08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{t('universal', 'universal')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-200/60 dark:bg-zinc-800/60 p-1 rounded-2xl border border-stone-200/90 dark:border-white/[0.08]">
            <button
              id="nav-cart-tab"
              onClick={() => setActiveTab('cart')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'cart'
                  ? 'bg-white dark:bg-zinc-900 text-stone-950 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-semibold border border-stone-200/50 dark:border-white/[0.08]'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t('cartTab', 'Universal Cart')}</span>
              {cartItemCount > 0 && (
                <span className="bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center font-mono">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              id="nav-grab-tab"
              onClick={() => setActiveTab('grab')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'grab'
                  ? 'bg-white dark:bg-zinc-900 text-stone-950 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-semibold border border-stone-200/50 dark:border-white/[0.08]'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-stone-500 dark:text-zinc-400" />
              <span>{t('importTab', 'Import URL')}</span>
            </button>

            <button
              id="nav-alerts-tab"
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-white dark:bg-zinc-900 text-stone-950 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-semibold border border-stone-200/50 dark:border-white/[0.08]'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('alertsTab', 'Price Alerts')}</span>
              {alertCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {alertCount}
                </span>
              )}
            </button>

            <button
              id="nav-orders-tab"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-zinc-900 text-stone-950 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-semibold border border-stone-200/50 dark:border-white/[0.08]'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-stone-500 dark:text-zinc-400" />
              <span>{t('ordersTab', 'Orders & Tracking')}</span>
              {orderCount > 0 && (
                <span className="bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-zinc-200 text-[10px] font-semibold px-1.5 rounded-full font-mono">
                  {orderCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* AI Shopping Concierge Trigger */}
            <button
              id="btn-nav-ai-assistant"
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100/90 text-indigo-900 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 dark:text-indigo-200 border border-indigo-200/70 dark:border-indigo-800/70 shadow-2xs transition-all cursor-pointer"
              title="Ask AI Assistant about products, comparisons, recommendations, or refunds"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">{t('aiConcierge', 'AI Concierge')}</span>
            </button>

            {/* Dark/Light Mode Switcher */}
            <button
              id="btn-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-zinc-700 cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle light or dark theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            <button
              id="btn-open-security"
              onClick={onOpenSecurity}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-zinc-700 cursor-pointer"
              title="View Security Standards & Settlement Architecture"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('securityRouting', 'Security & Routing')}</span>
            </button>

            {/* Share Wishlist CTA - Luxury Accent Action */}
            <button
              id="btn-share-cart"
              onClick={onOpenShare}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-stone-950 hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer active:scale-95 group border border-stone-800 dark:border-zinc-200"
              title="Share your universal wishlist with friends and family"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[2.2] group-hover:scale-110 transition-transform" />
              <span className="font-semibold tracking-tight">{t('shareWishlist', 'Share Wishlist')}</span>
            </button>

            {/* User Account / Sign In Control */}
            {currentUser && !currentUser.isGuest ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 hover:bg-stone-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-xs text-stone-800 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-lg object-cover ring-1 ring-stone-300 dark:ring-zinc-600"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold flex items-center justify-center text-[10px]">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline font-semibold max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {/* Profile Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-stone-200 dark:border-zinc-800 p-2 z-50 text-stone-900 dark:text-zinc-100 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-stone-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        {currentUser.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold flex items-center justify-center text-xs">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                            {currentUser.email || currentUser.phone || 'Universal Member'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md w-fit">
                        <CheckCircle className="w-3 h-3" />
                        <span>
                          {currentUser.provider === 'google'
                            ? 'Google Account Connected'
                            : currentUser.provider === 'phone'
                            ? 'Phone Verified'
                            : currentUser.provider === 'apple'
                            ? 'Apple ID Connected'
                            : 'OmniCart Member'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        id="btn-profile-switch-account"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAuth('signin');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>{t('switchAccount', 'Switch or Link Account')}</span>
                      </button>
                      <button
                        id="btn-profile-sign-out"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('signOut', 'Sign Out')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {currentUser?.isGuest && (
                  <span className="hidden xl:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-stone-500 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700/60">
                    <User className="w-3 h-3" />
                    <span>{t('guestMode', 'Guest Mode')}</span>
                  </span>
                )}
                <button
                  id="btn-nav-signin"
                  onClick={() => onOpenAuth('signin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-800 dark:text-zinc-200 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors border border-stone-200 dark:border-zinc-700 cursor-pointer shadow-2xs"
                  title="Sign in with Google, Phone, or Email"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-600 dark:text-zinc-300" />
                  <span>{t('signIn', 'Sign In')}</span>
                </button>
              </div>
            )}

            {/* Cart summary quick pill */}
            <button
              id="btn-quick-cart"
              onClick={() => setActiveTab('cart')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-95 border border-stone-800 dark:border-zinc-200"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-stone-300 dark:text-zinc-600" />
              <span className="hidden sm:inline font-mono">${cartTotal.toFixed(2)}</span>
              <span className="sm:hidden font-mono">{cartItemCount}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-100 dark:border-zinc-800 gap-1 overflow-x-auto text-[11px]">
          <button
            id="btn-mobile-auth"
            onClick={() => onOpenAuth('signin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold shadow-xs ${
              currentUser && !currentUser.isGuest
                ? 'bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white'
                : 'bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200'
            }`}
          >
            {currentUser && !currentUser.isGuest ? (
              <>
                <User className="w-3 h-3 text-stone-700 dark:text-zinc-300" />
                <span>{currentUser.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3 h-3 text-stone-700 dark:text-zinc-300" />
                <span>{t('signIn', 'Sign In')}</span>
              </>
            )}
          </button>
          <button
            id="btn-mobile-share-wishlist"
            onClick={onOpenShare}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white bg-stone-900 dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs"
          >
            <Share2 className="w-3 h-3 stroke-[2.2]" />
            {t('shareWishlist', 'Share')}
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-medium"
          >
            <Sparkles className="w-3 h-3" />
            AI
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'cart'
                ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium'
                : 'text-stone-600 dark:text-zinc-400'
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            ({cartItemCount})
          </button>
          <button
            onClick={() => setActiveTab('grab')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'grab'
                ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium'
                : 'text-stone-600 dark:text-zinc-400'
            }`}
          >
            <PlusCircle className="w-3 h-3" />
            {t('importTab', 'Import')}
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'alerts'
                ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium'
                : 'text-stone-600 dark:text-zinc-400'
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            {t('alertsTab', 'Alerts')}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium'
                : 'text-stone-600 dark:text-zinc-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            {t('ordersTab', 'Orders')}
          </button>
        </div>
      </div>
    </header>
  );
};
