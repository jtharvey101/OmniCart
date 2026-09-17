import React from 'react';

/**
 * Professional Empty State Illustration for the Universal Cart Tab.
 * Features an ambient geometric grid pattern, a central unified commerce basket,
 * and incoming multi-store product tags converging along dashed trajectory paths.
 */
export const CartEmptyStateIllustration: React.FC<{ className?: string }> = ({
  className = 'w-64 h-48 mx-auto',
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          {/* Subtle Grid Dot Pattern */}
          <pattern
            id="cart-empty-dots"
            x="0"
            y="0"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="1"
              className="fill-slate-300/60 dark:fill-zinc-700/60"
            />
          </pattern>

          {/* Radial Ambient Glow */}
          <radialGradient id="cart-ambient-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>

          {/* Pedestal Gradient */}
          <linearGradient id="pedestal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="text-slate-200/90 dark:text-zinc-700/80" stopColor="currentColor" />
            <stop offset="100%" className="text-slate-100/30 dark:text-zinc-800/20" stopColor="currentColor" />
          </linearGradient>

          {/* Tote Body Gradient (Light Mode) */}
          <linearGradient id="cart-body-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Tote Body Gradient (Dark Mode) */}
          <linearGradient id="cart-body-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>
        </defs>

        {/* Ambient Grid Backdrop */}
        <rect
          x="10"
          y="10"
          width="260"
          height="180"
          rx="24"
          fill="url(#cart-empty-dots)"
          className="opacity-75"
        />

        {/* Soft Radial Ambient Aura */}
        <ellipse
          cx="140"
          cy="120"
          rx="90"
          ry="60"
          fill="url(#cart-ambient-glow)"
        />

        {/* Platform Pedestal Shadow */}
        <ellipse
          cx="140"
          cy="162"
          rx="68"
          ry="12"
          className="fill-slate-900/6 dark:fill-black/30"
        />

        {/* Platform Pedestal Ring */}
        <ellipse
          cx="140"
          cy="160"
          rx="64"
          ry="10"
          fill="url(#pedestal-grad)"
          className="stroke-slate-300/70 dark:stroke-zinc-700/70"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Multi-Store Converging Dashed Lines */}
        {/* Left curve from Nike/Store A */}
        <path
          d="M 52 64 C 70 88, 100 102, 122 118"
          fill="none"
          className="stroke-indigo-400/70 dark:stroke-indigo-400/50"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        {/* Right curve from Apple/Store B */}
        <path
          d="M 228 68 C 210 92, 180 106, 158 118"
          fill="none"
          className="stroke-emerald-400/70 dark:stroke-emerald-400/50"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Floating Merchant Tag 1 (Left - Nike Style) */}
        <g transform="translate(32, 42)">
          <rect
            width="56"
            height="26"
            rx="7"
            className="fill-white dark:fill-zinc-800 stroke-slate-200 dark:stroke-zinc-700 shadow-sm"
            strokeWidth="1"
          />
          <circle cx="10" cy="13" r="3.5" className="fill-indigo-500" />
          <rect x="18" y="9" width="26" height="3" rx="1.5" className="fill-slate-700 dark:fill-zinc-200" />
          <rect x="18" y="14" width="16" height="2.5" rx="1" className="fill-slate-400 dark:fill-zinc-500" />
        </g>

        {/* Floating Merchant Tag 2 (Right - Boutique Style) */}
        <g transform="translate(196, 48)">
          <rect
            width="54"
            height="26"
            rx="7"
            className="fill-white dark:fill-zinc-800 stroke-slate-200 dark:stroke-zinc-700 shadow-sm"
            strokeWidth="1"
          />
          <circle cx="10" cy="13" r="3.5" className="fill-emerald-500" />
          <rect x="18" y="9" width="24" height="3" rx="1.5" className="fill-slate-700 dark:fill-zinc-200" />
          <rect x="18" y="14" width="14" height="2.5" rx="1" className="fill-slate-400 dark:fill-zinc-500" />
        </g>

        {/* Central Universal Basket / Tote */}
        <g transform="translate(100, 80)">
          {/* Tote Handles */}
          <path
            d="M 24 24 C 24 8, 56 8, 56 24"
            fill="none"
            className="stroke-slate-700 dark:stroke-zinc-400"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Main Bag Body - Subtle Isometric Trap/Tote */}
          <path
            d="M 12 24 L 68 24 L 62 76 C 61 80, 58 83, 54 83 L 26 83 C 22 83, 19 80, 18 76 Z"
            className="fill-slate-900 dark:fill-zinc-800 stroke-slate-800 dark:stroke-zinc-700"
            strokeWidth="1.5"
          />

          {/* Front Fold / Pocket Feature */}
          <path
            d="M 16 38 L 64 38 L 59 72 C 58 75, 56 77, 52 77 L 28 77 C 24 77, 22 75, 21 72 Z"
            className="fill-slate-800 dark:fill-zinc-900/90 stroke-slate-700/80 dark:stroke-zinc-800"
            strokeWidth="1"
          />

          {/* Universal Symbol on Bag Front: Interlocking Rings */}
          <circle
            cx="36"
            cy="56"
            r="6"
            fill="none"
            className="stroke-indigo-400"
            strokeWidth="1.8"
          />
          <circle
            cx="44"
            cy="56"
            r="6"
            fill="none"
            className="stroke-emerald-400"
            strokeWidth="1.8"
          />

          {/* Specular Highlight Rim on Bag Top */}
          <line
            x1="13"
            y1="25"
            x2="67"
            y2="25"
            className="stroke-white/30 dark:stroke-white/20"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>

        {/* Geometric Accents: Micro Plus / Sparks */}
        <g className="text-slate-400 dark:text-zinc-600">
          {/* Spark 1 */}
          <path d="M 88 48 L 88 56 M 84 52 L 92 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          {/* Spark 2 */}
          <path d="M 190 120 L 190 126 M 187 123 L 193 123" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          {/* Mini Diamond */}
          <polygon points="98,138 101,142 98,146 95,142" className="fill-indigo-400/60" />
          <polygon points="182,78 185,82 182,86 179,82" className="fill-emerald-400/60" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Professional Empty State Illustration for the Order History & Tracking Tab.
 * Features an ambient radar wave pattern, a dispatched parcel with transit tape,
 * and an verified digital manifest ledger floating on a multi-store platform.
 */
export const OrdersEmptyStateIllustration: React.FC<{ className?: string }> = ({
  className = 'w-64 h-48 mx-auto',
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          {/* Subtle Coordinate Grid Pattern */}
          <pattern
            id="orders-empty-grid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              className="stroke-slate-200/50 dark:stroke-zinc-800/70"
              strokeWidth="0.8"
            />
          </pattern>

          {/* Ambient Glow */}
          <radialGradient id="orders-ambient-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Grid Container */}
        <rect
          x="10"
          y="10"
          width="260"
          height="180"
          rx="24"
          fill="url(#orders-empty-grid)"
        />

        {/* Ambient Radial Glow */}
        <ellipse
          cx="140"
          cy="115"
          rx="95"
          ry="65"
          fill="url(#orders-ambient-glow)"
        />

        {/* Radar Concentric Rings */}
        <ellipse
          cx="140"
          cy="150"
          rx="72"
          ry="15"
          fill="none"
          className="stroke-slate-300/60 dark:stroke-zinc-700/60"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <ellipse
          cx="140"
          cy="150"
          rx="96"
          ry="20"
          fill="none"
          className="stroke-slate-200/60 dark:stroke-zinc-800/80"
          strokeWidth="1"
          strokeDasharray="6 6"
        />

        {/* Pedestal Cast Shadow */}
        <ellipse
          cx="140"
          cy="152"
          rx="58"
          ry="10"
          className="fill-slate-900/8 dark:fill-black/35"
        />

        {/* Floating Shipment Package (Left / Center) */}
        <g transform="translate(85, 78)">
          {/* Isometric Box Base */}
          <path
            d="M 38 6 L 72 22 L 72 64 L 38 78 L 4 64 L 4 22 Z"
            className="fill-slate-800 dark:fill-zinc-800 stroke-slate-700 dark:stroke-zinc-700"
            strokeWidth="1.5"
          />

          {/* Box Top Facet */}
          <path
            d="M 38 6 L 72 22 L 38 36 L 4 22 Z"
            className="fill-slate-700 dark:fill-zinc-800 stroke-slate-600 dark:stroke-zinc-700"
            strokeWidth="1.2"
          />

          {/* Box Left Facet */}
          <path
            d="M 4 22 L 38 36 L 38 78 L 4 64 Z"
            className="fill-slate-900 dark:fill-zinc-900 stroke-slate-700/60 dark:stroke-zinc-800"
            strokeWidth="1"
          />

          {/* Box Right Facet */}
          <path
            d="M 38 36 L 72 22 L 72 64 L 38 78 Z"
            className="fill-slate-800 dark:fill-zinc-800 stroke-slate-700/60 dark:stroke-zinc-800"
            strokeWidth="1"
          />

          {/* Packing Tape across Top & Front */}
          <path
            d="M 32 9 L 44 15 L 44 75 L 32 70 Z"
            className="fill-amber-500/80 dark:fill-amber-400/70"
            opacity="0.85"
          />

          {/* Shipping Barcode Label */}
          <rect
            x="44"
            y="38"
            width="22"
            height="15"
            rx="2"
            className="fill-white dark:fill-zinc-200"
          />
          {/* Barcode Lines */}
          <line x1="47" y1="42" x2="47" y2="49" stroke="#0f172a" strokeWidth="1" />
          <line x1="50" y1="42" x2="50" y2="49" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="53" y1="42" x2="53" y2="49" stroke="#0f172a" strokeWidth="0.8" />
          <line x1="56" y1="42" x2="56" y2="49" stroke="#0f172a" strokeWidth="1.2" />
          <line x1="60" y1="42" x2="60" y2="49" stroke="#0f172a" strokeWidth="1.8" />
          <line x1="63" y1="42" x2="63" y2="49" stroke="#0f172a" strokeWidth="0.8" />
        </g>

        {/* Floating Digital Manifest / Receipt Card (Right / Upper) */}
        <g transform="translate(150, 48)">
          {/* Card Body */}
          <rect
            width="58"
            height="74"
            rx="8"
            className="fill-white dark:fill-zinc-800 stroke-slate-200 dark:stroke-zinc-700 shadow-md"
            strokeWidth="1.2"
          />

          {/* Card Header Notch / Line */}
          <line x1="12" y1="12" x2="36" y2="12" className="stroke-slate-800 dark:stroke-zinc-200" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="48" cy="12" r="3" className="fill-emerald-500" />

          {/* Manifest Rows */}
          <line x1="10" y1="22" x2="48" y2="22" className="stroke-slate-200 dark:stroke-zinc-700" strokeWidth="1" />
          <line x1="10" y1="30" x2="38" y2="30" className="stroke-slate-300 dark:stroke-zinc-600" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="38" x2="30" y2="38" className="stroke-slate-200 dark:stroke-zinc-700" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="46" x2="42" y2="46" className="stroke-slate-300 dark:stroke-zinc-600" strokeWidth="2" strokeLinecap="round" />

          {/* Total Row */}
          <line x1="10" y1="56" x2="48" y2="56" className="stroke-slate-200 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="10" y="62" width="22" height="3" rx="1.5" className="fill-indigo-500" />
          <rect x="36" y="62" width="12" height="3" rx="1.5" className="fill-emerald-500" />
        </g>

        {/* Verified Badge / Seal Node */}
        <g transform="translate(192, 106)">
          <circle cx="10" cy="10" r="11" className="fill-emerald-500 stroke-white dark:stroke-zinc-900 shadow-sm" strokeWidth="2" />
          <path d="M 6.5 10 L 9 12.5 L 14 7.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Dashed Transit Flight Path */}
        <path
          d="M 64 125 C 72 100, 100 85, 115 82"
          fill="none"
          className="stroke-emerald-400/80 dark:stroke-emerald-400/60"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx="62" cy="126" r="3" className="fill-emerald-500" />

        {/* Atmospheric Floating Crosses */}
        <g className="text-slate-400 dark:text-zinc-600">
          <path d="M 64 56 L 64 62 M 61 59 L 67 59" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 226 44 L 226 50 M 223 47 L 229 47" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="48" cy="88" r="1.5" className="fill-slate-400/60 dark:fill-zinc-600/60" />
          <circle cx="236" cy="132" r="1.5" className="fill-emerald-500/60" />
        </g>
      </svg>
    </div>
  );
};
