/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { CartView } from './components/CartView';
import { ProductGrabber } from './components/ProductGrabber';
import { PriceAlertsView } from './components/PriceAlertsView';
import { OrderHistoryView } from './components/OrderHistoryView';
import { CheckoutModal } from './components/CheckoutModal';
import { ShareCartModal } from './components/ShareCartModal';
import { PciSecurityModal } from './components/PciSecurityModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { MerchantDispatchModal } from './components/MerchantDispatchModal';
import { AiShoppingAssistantDrawer } from './components/AiShoppingAssistantDrawer';
import { AuthModal } from './components/AuthModal';
import { Cart, Product, Order, AppliedPromoCode, AuthUser } from './types';
import { CheckCircle2, TrendingDown, X, Sparkles, ShieldAlert } from 'lucide-react';

const INITIAL_CART_ID = 'shared_gift_registry_2026';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cart' | 'grab' | 'alerts' | 'orders'>('cart');
  const [cart, setCart] = useState<Cart>({
    id: INITIAL_CART_ID,
    title: "Alex's Tech & Artisan Wishlist Cart",
    ownerName: 'Alex Rivera',
    ownerEmail: 'alex.rivera.wishlist@example.com',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shareCode: 'alex-wishlist',
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('omnicart-auth-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Track if this is user's first time visiting or if they've used the app before
  const [hasVisitedBefore, setHasVisitedBefore] = useState<boolean>(() => {
    return !!localStorage.getItem('omnicart-has-visited');
  });

  // Remember last logged-in or identified user for personalized "Welcome back"
  const [lastKnownUser, setLastKnownUser] = useState<{ name?: string; email?: string } | null>(() => {
    const saved = localStorage.getItem('omnicart-last-known-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Open animated sign-in screen on app open if not authenticated
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('omnicart-auth-user');
    return !saved;
  });
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const handleAuthenticate = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('omnicart-auth-user', JSON.stringify(user));
    localStorage.setItem('omnicart-has-visited', 'true');
    setHasVisitedBefore(true);

    if (!user.isGuest) {
      const known = { name: user.name, email: user.email };
      localStorage.setItem('omnicart-last-known-user', JSON.stringify(known));
      setLastKnownUser(known);
    }

    setIsAuthOpen(false);

    if (user.isGuest) {
      showToast('Continuing as Guest Shopper. You can sign in anytime.', 'info');
    } else {
      setCart((prev) => ({
        ...prev,
        ownerName: user.name,
        ownerEmail: user.email || prev.ownerEmail,
      }));
      const greeting = hasVisitedBefore ? `Welcome back, ${user.name}!` : `Welcome to OmniCart, ${user.name}!`;
      showToast(greeting, 'success');
    }
  };

  const handleCloseAuth = () => {
    // When dismissing, remember they have visited
    localStorage.setItem('omnicart-has-visited', 'true');
    setHasVisitedBefore(true);
    setIsAuthOpen(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('omnicart-auth-user');
    showToast('Signed out of OmniCart.', 'info');
    setAuthModalMode('signin');
    setIsAuthOpen(true);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthOpen(true);
  };

  const [orders, setOrders] = useState<Order[]>([]);

  const [isSharedCartView, setIsSharedCartView] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);
  const [inspectingDispatchOrder, setInspectingDispatchOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'drop' | 'info' | 'error';
  } | null>(null);

  // AI Shopping Concierge State
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string | undefined>(undefined);
  const [aiAssistantMode, setAiAssistantMode] = useState<'chat' | 'compare' | 'recommend' | 'refund'>('chat');
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null);

  const openAiAssistant = (
    prompt?: string,
    mode: 'chat' | 'compare' | 'recommend' | 'refund' = 'chat',
    order?: Order | null
  ) => {
    setAiAssistantPrompt(prompt);
    setAiAssistantMode(mode);
    setSelectedOrderForRefund(order || null);
    setIsAiAssistantOpen(true);
  };

  // Theme state with localStorage persistence & system preference fallback
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('omnicart-theme');
    if (saved) return saved === 'dark';
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('omnicart-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('omnicart-theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const showToast = (text: string, type: 'success' | 'drop' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load initial cart and orders from server
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cartParam = urlParams.get('cart') || INITIAL_CART_ID;
    if (urlParams.has('cart')) {
      setIsSharedCartView(true);
    }

    // Fetch cart
    fetch(`/api/cart/${cartParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) {
          setCart(data.cart);
        }
      })
      .catch((err) => console.log('Cart fetch notice:', err));

    // Fetch initial order history
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.log('Orders fetch notice:', err));
  }, []);

  // Save cart changes to server
  const persistCart = (updatedCart: Cart) => {
    setCart(updatedCart);
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: updatedCart }),
    }).catch((e) => console.error('Error saving cart:', e));
  };

  const handleAddProduct = (product: Product) => {
    const existingIdx = cart.items.findIndex(
      (item) => item.id === product.id || (item.url === product.url && item.selectedVariant === product.selectedVariant)
    );

    let updatedItems: Product[];
    if (existingIdx > -1) {
      updatedItems = [...cart.items];
      updatedItems[existingIdx].quantity += product.quantity || 1;
    } else {
      updatedItems = [product, ...cart.items];
    }

    const updatedCart = {
      ...cart,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };

    persistCart(updatedCart);
    showToast(`Added "${product.title}" to your Giant Cart!`, 'success');
    setActiveTab('cart');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updatedItems = cart.items
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as Product[];

    persistCart({
      ...cart,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveItem = (id: string) => {
    const itemToRemove = cart.items.find((i) => i.id === id);
    const updatedItems = cart.items.filter((item) => item.id !== id);
    persistCart({
      ...cart,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.title}" from cart.`, 'info');
    }
  };

  const handleClearCart = () => {
    persistCart({
      ...cart,
      items: [],
      updatedAt: new Date().toISOString(),
    });
    showToast('Cart cleared. All items removed from the current session.', 'info');
  };

  const handleUpdateVariant = (id: string, variant: string) => {
    const updatedItems = cart.items.map((item) => {
      if (item.id === id) {
        return { ...item, selectedVariant: variant };
      }
      return item;
    });
    persistCart({
      ...cart,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateTargetPrice = (id: string, targetPrice: number, email: string) => {
    const updatedItems = cart.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          targetAlertPrice: targetPrice,
          alertEmail: email,
          alertEnabled: true,
        };
      }
      return item;
    });
    persistCart({
      ...cart,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
    showToast(`Price watch enabled! We will email you when price drops below $${targetPrice.toFixed(2)}.`, 'success');
  };

  // Simulate a live price drop event across one or more items
  const handleSimulatePriceDrop = () => {
    if (cart.items.length === 0) {
      showToast('Add products to your cart first to test price drop alerts!', 'info');
      return;
    }

    // Pick an item to discount (e.g. first item or random item)
    const targetItem = cart.items[0];
    const discountAmount = Math.round(targetItem.price * 0.18 * 100) / 100;
    const newPrice = Math.max(10, Math.round((targetItem.price - discountAmount) * 100) / 100);

    const updatedItems = cart.items.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          price: newPrice,
          priceHistory: [
            ...(item.priceHistory || []),
            {
              date: 'Just Now',
              price: newPrice,
              note: `Price Drop -$${discountAmount.toFixed(2)}`,
            },
          ],
        };
      }
      return item;
    });

    persistCart({
      ...cart,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });

    showToast(
      `🔥 Price Drop Alert: "${targetItem.title}" dropped by -$${discountAmount.toFixed(2)} (Now $${newPrice.toFixed(2)})!`,
      'drop'
    );
  };

  // Promo Code Validation & Clearing via Originating Store Handshake
  const handleApplyPromoCode = async (
    code: string,
    targetProductId?: string
  ): Promise<{ valid: boolean; status?: string; message?: string; appliedPromo?: AppliedPromoCode }> => {
    try {
      const response = await fetch('/api/validate-promo-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          items: cart.items,
          targetProductId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        const errorMsg = data.message || 'Promo code unrecognized. Verification denied by store registry.';
        showToast(`⛔ ${errorMsg}`, 'error');
        return { valid: false, status: data.status || 'DENIED', message: errorMsg };
      }

      const applied = data.appliedPromo as AppliedPromoCode;
      const livePriceVal = data.livePriceValidation;

      // Update the specific item that matches applied.productId, incorporating live price validation from URL meta-tags
      const updatedItems = cart.items.map((item) => {
        if (item.id === applied.productId) {
          const verifiedPrice =
            livePriceVal?.livePrice && livePriceVal.livePrice > 0
              ? livePriceVal.livePrice
              : item.price;

          return {
            ...item,
            price: verifiedPrice,
            appliedPromo: applied,
          };
        }
        return item;
      });

      const activePromos = updatedItems
        .map((i) => i.appliedPromo)
        .filter(Boolean) as AppliedPromoCode[];

      const updatedCart: Cart = {
        ...cart,
        items: updatedItems,
        appliedPromoCodes: activePromos,
        updatedAt: new Date().toISOString(),
      };

      persistCart(updatedCart);

      if (livePriceVal?.discrepancyDetected) {
        showToast(
          `⚡ Live Price Synchronized: Originating URL meta-tags updated "${applied.productTitle}" from $${Number(livePriceVal.originalCartPrice).toFixed(2)} to $${Number(livePriceVal.livePrice).toFixed(2)}. Applied ${applied.merchant} voucher ${applied.code} (-$${applied.discountAmount.toFixed(2)})!`,
          'success'
        );
      } else {
        showToast(
          data.message || `Applied ${applied.merchant} promo code ${applied.code} (-$${applied.discountAmount.toFixed(2)})!`,
          'success'
        );
      }
      return { valid: true, message: data.message, appliedPromo: applied };
    } catch (err: any) {
      const msg = err.message || 'Network error scanning promo code';
      showToast(msg, 'info');
      return { valid: false, message: msg };
    }
  };

  const handleRemovePromoCode = (productId: string) => {
    const updatedItems = cart.items.map((item) => {
      if (item.id === productId) {
        const { appliedPromo, ...rest } = item;
        return { ...rest };
      }
      return item;
    });

    const activePromos = updatedItems
      .map((i) => i.appliedPromo)
      .filter(Boolean) as AppliedPromoCode[];

    const updatedCart: Cart = {
      ...cart,
      items: updatedItems,
      appliedPromoCodes: activePromos,
      updatedAt: new Date().toISOString(),
    };

    persistCart(updatedCart);
    showToast('Originating store promo code removed.', 'info');
  };

  const handleOrderCompleted = (order: Order, receipt: any) => {
    setOrders([order, ...orders]);
    setViewingReceiptOrder(order);
    setIsCheckoutOpen(false);

    // Keep items or clear purchased items
    // In universal wishlist carts, we can keep the cart or clear it:
    persistCart({
      ...cart,
      items: [],
      updatedAt: new Date().toISOString(),
    });

    showToast(
      `Order ${order.orderNumber} confirmed! Receipt dispatched strictly to ${order.buyerEmail}.`,
      'success'
    );
  };

  const handleUpdateCartMeta = (title: string, ownerName: string, ownerEmail: string) => {
    const updated = {
      ...cart,
      title,
      ownerName,
      ownerEmail,
      updatedAt: new Date().toISOString(),
    };
    persistCart(updated);
    showToast('Cart registry details updated & share link refreshed!', 'success');
  };

  const cartTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const alertCount = cart.items.filter((i) => i.alertEnabled || i.originalPrice > i.price).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 max-w-md shadow-2xl"
          >
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 shadow-xl backdrop-blur-md ${
                toastMessage.type === 'error'
                  ? 'bg-rose-950/95 text-rose-100 border-rose-800 shadow-rose-950/40'
                  : toastMessage.type === 'drop'
                  ? 'bg-emerald-950/95 text-emerald-100 border-emerald-800'
                  : toastMessage.type === 'info'
                  ? 'bg-stone-900/95 dark:bg-zinc-800/95 text-white border-stone-700 dark:border-zinc-700'
                  : 'bg-stone-950/95 text-white border-stone-800'
              }`}
            >
              {toastMessage.type === 'error' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : toastMessage.type === 'drop' ? (
                <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div className="text-xs font-medium leading-relaxed flex-1">
                {toastMessage.text}
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItemCount={cart.items.reduce((sum, item) => sum + item.quantity, 0)}
        cartTotal={cartTotal}
        orderCount={orders.length}
        alertCount={alertCount}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onOpenAiAssistant={() => openAiAssistant()}
        isSharedCartView={isSharedCartView}
        sharedCartOwner={cart.ownerName}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
      />

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'cart' && (
              <CartView
                items={cart.items}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateVariant={handleUpdateVariant}
                onOpenPriceAlertModal={(item) => {
                  setActiveTab('alerts');
                }}
                onProceedToCheckout={() => setIsCheckoutOpen(true)}
                onOpenShareModal={() => setIsShareOpen(true)}
                onNavigateToGrab={() => setActiveTab('grab')}
                onSimulatePriceDrop={handleSimulatePriceDrop}
                onApplyPromoCode={handleApplyPromoCode}
                onRemovePromoCode={handleRemovePromoCode}
                onOpenAiAssistant={(prompt, mode) => openAiAssistant(prompt, mode || 'chat')}
                onClearCart={handleClearCart}
              />
            )}

            {activeTab === 'grab' && (
              <ProductGrabber
                onAddProduct={handleAddProduct}
                onNavigateToCart={() => setActiveTab('cart')}
              />
            )}

            {activeTab === 'alerts' && (
              <PriceAlertsView
                items={cart.items}
                onUpdateTargetPrice={handleUpdateTargetPrice}
                onSimulatePriceDrop={handleSimulatePriceDrop}
                onNavigateToCart={() => setActiveTab('cart')}
              />
            )}

            {activeTab === 'orders' && (
              <OrderHistoryView
                orders={orders}
                onViewReceipt={(order) => setViewingReceiptOrder(order)}
                onInspectMerchantDispatch={(order) => setInspectingDispatchOrder(order)}
                onNavigateToCart={() => setActiveTab('cart')}
                onOpenRefundAssistant={(order, itemTitle) => {
                  const prompt = itemTitle
                    ? `I would like assistance returning or requesting a refund for "${itemTitle}" from Order #${order.orderNumber}.`
                    : `I would like assistance with a return or refund on Order #${order.orderNumber}.`;
                  openAiAssistant(prompt, 'refund', order);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 py-8 text-slate-500 dark:text-zinc-400 text-xs mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-zinc-200">OmniCart Universal Cart</span>
            <span>•</span>
            <span>Unified Multi-Store Checkout with Direct Merchant Settlement</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={() => {
                if (orders.length > 0) {
                  setInspectingDispatchOrder(orders[0]);
                } else {
                  showToast('Add items and place an order to inspect real-time merchant warehouse handshakes!', 'info');
                }
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Merchant Warehouse Dispatch
            </button>
            <button
              onClick={() => setIsSecurityOpen(true)}
              className="hover:text-slate-900 dark:hover:text-zinc-200 underline cursor-pointer"
            >
              Security Architecture
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="hover:text-slate-900 dark:hover:text-zinc-200 underline cursor-pointer"
            >
              Share Wishlist
            </button>
            <span className="text-slate-400 dark:text-zinc-500">Gift-Protected Billing Isolation</span>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart.items}
        cartId={cart.id}
        cartCreatorEmail={currentUser?.email || cart.ownerEmail}
        initialBuyerName={currentUser?.name}
        initialBuyerEmail={currentUser?.email}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Animated Sign In / Sign Up & Guest Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        onAuthenticate={handleAuthenticate}
        initialMode={authModalMode}
        isFirstVisit={!hasVisitedBefore}
        lastKnownName={lastKnownUser?.name}
        lastKnownEmail={lastKnownUser?.email}
      />

      {/* Share Cart Modal */}
      <ShareCartModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        cart={cart}
        onUpdateCartMeta={handleUpdateCartMeta}
      />

      {/* PCI Security Modal */}
      <PciSecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal
        order={viewingReceiptOrder}
        onClose={() => setViewingReceiptOrder(null)}
      />

      {/* Merchant Order Injection & Fulfillment Audit Modal */}
      <MerchantDispatchModal
        isOpen={Boolean(inspectingDispatchOrder)}
        onClose={() => setInspectingDispatchOrder(null)}
        order={inspectingDispatchOrder}
      />

      {/* Floating AI Shopping Concierge Trigger Button */}
      <button
        id="btn-floating-ai-concierge"
        onClick={() => openAiAssistant()}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border border-indigo-400/30 group"
        title="Open OmniCart AI Shopping Concierge"
      >
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
        <span>AI Concierge</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      </button>

      {/* AI Shopping Assistant Drawer */}
      <AiShoppingAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        cartItems={cart.items}
        orders={orders}
        onAddToCart={(partialProduct) => {
          const newPrice = partialProduct.price || 19.99;
          const newProduct: Product = {
            id: 'prod_' + Math.random().toString(36).substring(2, 9),
            title: partialProduct.title || 'Curated Product',
            merchant: partialProduct.merchant || 'OmniCart Merchant',
            merchantDomain: partialProduct.merchantDomain || 'retailer.com',
            merchantRoutingId: partialProduct.merchantRoutingId || 'MERCH_DIRECT_ROUTE',
            merchantPayoutAccount: partialProduct.merchantPayoutAccount || 'Merchant Settlement Vault',
            price: newPrice,
            originalPrice: partialProduct.originalPrice || newPrice,
            currency: 'USD',
            imageUrl: partialProduct.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
            description: partialProduct.description || '',
            category: partialProduct.category || 'Accessories',
            inStock: true,
            url: partialProduct.url || 'https://omnicart.local/item',
            quantity: 1,
            addedAt: new Date().toISOString(),
            priceHistory: [
              { date: 'Initial', price: partialProduct.originalPrice || newPrice },
              { date: 'Now', price: newPrice },
            ],
          };
          handleAddProduct(newProduct);
        }}
        onOrderUpdated={(updatedOrder) => {
          setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
          showToast(`Return authorized for Order #${updatedOrder.orderNumber}! Prepaid label generated.`, 'success');
        }}
        initialPrompt={aiAssistantPrompt}
        initialContextMode={aiAssistantMode}
        selectedOrderForRefund={selectedOrderForRefund}
      />
    </div>
  );
}
