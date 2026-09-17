import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import {
  ShoppingBag,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Sparkles,
  X,
  Smartphone,
  Check,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthUser } from '../types';
import { useLanguage } from '../utils/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (user: AuthUser) => void;
  initialMode?: 'signin' | 'signup';
  isFirstVisit?: boolean;
  lastKnownName?: string;
  lastKnownEmail?: string;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US / CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  initialMode = 'signin',
  isFirstVisit = true,
  lastKnownName,
  lastKnownEmail,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Email form state
  const [name, setName] = useState(lastKnownName || '');
  const [email, setEmail] = useState(lastKnownEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Phone form state
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'verify_otp'>('enter_phone');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('742918');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Update initial mode when prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trigger celebratory burst
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // Confetti fallback
    }
  };

  // Google Sign In
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      triggerConfetti();
      const googleUser: AuthUser = {
        id: 'usr_google_' + Math.random().toString(36).substring(2, 9),
        name: lastKnownName || 'Alex Rivera',
        email: lastKnownEmail || 'alex.rivera@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      onAuthenticate(googleUser);
    }, 600);
  };

  // Apple Sign In
  const handleAppleSignIn = () => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      triggerConfetti();
      const appleUser: AuthUser = {
        id: 'usr_apple_' + Math.random().toString(36).substring(2, 9),
        name: lastKnownName || 'Alex (Apple ID)',
        email: lastKnownEmail || 'alex.privaterelay@appleid.com',
        provider: 'apple',
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      onAuthenticate(appleUser);
    }, 600);
  };

  // Email / Password submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (mode === 'signup' && !agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to create an account.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      triggerConfetti();
      const user: AuthUser = {
        id: 'usr_email_' + Math.random().toString(36).substring(2, 9),
        name: mode === 'signup' ? name : (name || email.split('@')[0].replace('.', ' ')),
        email: email,
        provider: 'email',
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      onAuthenticate(user);
    }, 650);
  };

  // Phone send code
  const handleSendPhoneCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 7) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockCode);
      setOtpCode(mockCode); // Pre-fill for demonstration ease
      setPhoneStep('verify_otp');
      setSuccessNotice(`Verification code sent to ${countryCode} ${phoneNumber}! (Demo code: ${mockCode})`);
    }, 700);
  };

  // Verify Phone OTP
  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.length < 4) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerConfetti();
      const phoneUser: AuthUser = {
        id: 'usr_phone_' + Math.random().toString(36).substring(2, 9),
        name: name.trim() || `Shopper ${countryCode}${phoneNumber.slice(-4)}`,
        phone: `${countryCode} ${phoneNumber}`,
        provider: 'phone',
        isGuest: false,
        createdAt: new Date().toISOString(),
      };
      onAuthenticate(phoneUser);
    }, 600);
  };

  // Continue as Guest
  const handleContinueAsGuest = () => {
    const guestUser: AuthUser = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: 'Guest Shopper',
      provider: 'guest',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    onAuthenticate(guestUser);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-zinc-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { score: 2, label: 'Good', color: 'bg-indigo-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Stagger animation container variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  if (!isOpen) return null;

  // Header Title based on First Visit vs Returning User
  const getDisplayHeading = () => {
    if (mode === 'signup') {
      return t('tabCreateAccount', 'Create Account');
    }
    // Mode is 'signin'
    if (isFirstVisit) {
      return t('welcomeTitle', 'Welcome');
    }
    return lastKnownName
      ? `${t('welcomeBackTitle', 'Welcome Back')}, ${lastKnownName.split(' ')[0]}`
      : t('welcomeBackTitle', 'Welcome Back');
  };

  const getDisplaySubtitle = () => {
    if (mode === 'signup') {
      return t(
        'welcomeSubtitle',
        'Import products from any website into a unified cart with real-time price alerts.',
      );
    }
    if (isFirstVisit) {
      return t(
        'welcomeSubtitle',
        'Import products from any website into a single universal cart with direct checkout.',
      );
    }
    return t(
      'welcomeBackSubtitle',
      'Pick up right where you left off with your saved carts, wishlist items, and orders.',
    );
  };

  return (
    <AnimatePresence>
      <div
        id="auth-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/75 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Ambient Luxury Atmospheric Glow Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              x: [0, 20, 0],
              y: [0, -25, 0],
              opacity: [0.3, 0.45, 0.3],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              x: [0, -25, 0],
              y: [0, 20, 0],
              opacity: [0.25, 0.4, 0.25],
            }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-tl from-emerald-500/20 via-teal-500/15 to-transparent rounded-full blur-3xl"
          />
        </div>

        {/* Animated Modal Card with High-End Finish */}
        <motion.div
          id="auth-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.9 }}
          className="relative w-full max-w-md my-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.1)] border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden text-slate-900 dark:text-zinc-100"
        >
          {/* Top Metallic Light Beam */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 opacity-90" />

          {/* Sweeping Lustrous Light Reflection */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '250%', opacity: [0, 0.45, 0] }}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 6 }}
            className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/15 dark:via-white/5 to-transparent skew-x-12 pointer-events-none"
          />

          {/* Close button */}
          <button
            id="btn-auth-close"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer z-10"
            aria-label="Close sign in dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 sm:p-8"
          >
            {/* Top Luxury Pill & Brand Insignia */}
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-5">
              {/* Refined Category Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 shadow-2xs">
                <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                <span>{isFirstVisit ? 'Universal Shopping Concierge' : 'Recognized Member Session'}</span>
              </div>

              {/* Floating Luxury Insignia */}
              <motion.div
                initial={{ scale: 0.8, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 dark:from-zinc-100 dark:to-zinc-200 flex items-center justify-center text-white dark:text-zinc-950 shadow-xl mb-3.5 border border-slate-700/50 dark:border-white ring-4 ring-indigo-500/10 dark:ring-white/10"
              >
                <ShoppingBag className="w-7 h-7 stroke-[2.2] text-white dark:text-zinc-950" />
                {/* Active indicator bead */}
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                </span>
              </motion.div>

              {/* Dynamic Heading: "Welcome" on first visit vs "Welcome back" if returning */}
              <h2
                id="auth-modal-title"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white"
              >
                {getDisplayHeading()}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 max-w-xs leading-relaxed">
                {getDisplaySubtitle()}
              </p>
            </motion.div>

            {/* Mode Switcher Tabs: Sign In / Create Account */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-zinc-800/90 rounded-xl mb-5 text-xs font-semibold border border-slate-200/50 dark:border-zinc-700/50"
            >
              <button
                id="tab-auth-signin"
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-zinc-900 text-slate-950 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span>{t('tabSignIn', 'Sign In')}</span>
              </button>
              <button
                id="tab-auth-signup"
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-zinc-900 text-slate-950 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span>{t('tabCreateAccount', 'Create Account')}</span>
              </button>
            </motion.div>

            {/* Error or Success notification */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 shadow-2xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successNotice && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{successNotice}</span>
              </motion.div>
            )}

            {/* Fast Social & Identity Providers */}
            <motion.div variants={itemVariants} className="space-y-2.5 mb-5">
              {/* Google Sign In with official color badge */}
              <button
                id="btn-signin-google"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm hover:border-indigo-200 dark:hover:border-zinc-600 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t('continueWithGoogle', 'Continue with Google')}</span>
              </button>

              {/* Apple Sign In */}
              <button
                id="btn-signin-apple"
                type="button"
                onClick={handleAppleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-zinc-600 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.62-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.65 1.35-.57.65-1.07 1.72-.94 2.76 1.01.08 2.05-.49 2.67-1.24z" />
                </svg>
                <span>{t('continueWithApple', 'Continue with Apple')}</span>
              </button>
            </motion.div>

            {/* Divider with subtle diamond marker */}
            <motion.div variants={itemVariants} className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
              </div>
              <div className="relative px-3 bg-white dark:bg-zinc-900 text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">
                {t('orContinueWith', 'or continue with')}
              </div>
            </motion.div>

            {/* Method Toggle: Email vs Phone */}
            <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMessage(null);
                }}
                className={`pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  authMethod === 'email'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setErrorMessage(null);
                }}
                className={`pb-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  authMethod === 'phone'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Number</span>
              </button>
            </motion.div>

            {/* EMAIL / PASSWORD FORM */}
            {authMethod === 'email' && (
              <motion.form variants={itemVariants} onSubmit={handleEmailSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="auth-fullname-input"
                      className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-fullname-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        required={mode === 'signup'}
                        className="w-full pl-9.5 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email-input"
                    className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.rivera@example.com"
                      required
                      className="w-full pl-9.5 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="auth-password-input"
                      className="block text-xs font-medium text-slate-700 dark:text-zinc-300"
                    >
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSuccessNotice('A demo password reset link has been dispatched to your email.');
                        }}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9.5 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength indicator for signup */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                          } w-1/3 rounded-full`}
                        />
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'
                          } w-1/3 rounded-full`}
                        />
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'
                          } w-1/3 rounded-full`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Remember me or terms */}
                {mode === 'signin' ? (
                  <div className="flex items-center">
                    <input
                      id="auth-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
                    />
                    <label
                      htmlFor="auth-remember-me"
                      className="ml-2 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer select-none"
                    >
                      Remember me on this device
                    </label>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <input
                      id="auth-agree-terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
                    />
                    <label
                      htmlFor="auth-agree-terms"
                      className="ml-2 text-[11px] leading-tight text-slate-600 dark:text-zinc-400 cursor-pointer select-none"
                    >
                      I agree to the OmniCart{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium underline">
                        Terms of Service
                      </span>{' '}
                      and{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium underline">
                        Privacy Policy
                      </span>
                      .
                    </label>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  id="btn-auth-submit-email"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'signin'
                          ? isFirstVisit
                            ? 'Sign In to OmniCart'
                            : 'Continue to Cart'
                          : 'Create My Account'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* PHONE NUMBER AUTH FORM */}
            {authMethod === 'phone' && (
              <motion.div variants={itemVariants} className="space-y-3.5">
                {phoneStep === 'enter_phone' ? (
                  <form onSubmit={handleSendPhoneCode} className="space-y-3.5">
                    {mode === 'signup' && (
                      <div>
                        <label
                          htmlFor="phone-fullname-input"
                          className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            id="phone-fullname-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Alex Rivera"
                            className="w-full pl-9.5 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="phone-number-input"
                        className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                      >
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        {/* Country code selector */}
                        <select
                          id="select-country-code"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-24 px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                        >
                          {COUNTRY_CODES.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.flag} {item.code}
                            </option>
                          ))}
                        </select>

                        {/* Phone number input */}
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            id="phone-number-input"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="(555) 349-2810"
                            required
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5">
                        We'll send a 6-digit one-time passcode via SMS to verify.
                      </p>
                    </div>

                    <button
                      id="btn-send-sms-code"
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-sm hover:shadow transition-all duration-150 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* OTP Verification Step */
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                    <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs">
                      <div className="flex items-center justify-between text-indigo-950 dark:text-indigo-200 font-medium">
                        <span>Code sent to {countryCode} {phoneNumber}</span>
                        <button
                          type="button"
                          onClick={() => setPhoneStep('enter_phone')}
                          className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-80"
                        >
                          Change
                        </button>
                      </div>
                      <div className="mt-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                        Demo passcode: <strong className="font-mono">{generatedOtp}</strong>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="otp-code-input"
                        className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1"
                      >
                        Enter 6-Digit SMS Code
                      </label>
                      <input
                        id="otp-code-input"
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        autoFocus
                        required
                        className="w-full tracking-widest text-center text-lg font-mono font-bold py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Didn't receive code?</span>
                      <button
                        type="button"
                        onClick={() => {
                          const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
                          setGeneratedOtp(mockCode);
                          setOtpCode(mockCode);
                          setSuccessNotice(`New code sent! (${mockCode})`);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      >
                        Resend Code
                      </button>
                    </div>

                    <button
                      id="btn-verify-otp"
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-sm hover:shadow transition-all duration-150 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Verify &amp; Continue</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* CONTINUE AS GUEST & FOOTER ACTIONS */}
            <motion.div variants={itemVariants} className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
              {/* Prominent Continue As Guest button */}
              <button
                id="btn-auth-continue-guest"
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200/90 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 bg-slate-50/90 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold transition-all active:scale-[0.99] cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <span>{t('continueAsGuest', 'Continue as Guest')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500 text-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('pciCertifiedNotice', 'PCI DSS Level 1 Certified • End-to-End Encryption')}</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
