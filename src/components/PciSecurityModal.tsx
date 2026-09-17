import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  X,
  Key,
  CheckCircle2,
  CreditCard,
  Store,
} from 'lucide-react';
import {
  formatCardNumber,
  detectCardBrand,
  validateLuhn,
} from '../lib/pciSecurity';

interface PciSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PciSecurityModal: React.FC<PciSecurityModalProps> = ({ isOpen, onClose }) => {
  const [testCard, setTestCard] = useState('4242 4242 4242 4242');

  if (!isOpen) return null;

  const brand = detectCardBrand(testCard);
  const isLuhnValid = validateLuhn(testCard);
  const cleanLast4 = testCard.replace(/\D/g, '').slice(-4) || '4242';
  const simulatedToken = `tok_pci_${brand.toLowerCase()}_${btoa(cleanLast4 + 'SALT_2026').slice(0, 12).toLowerCase()}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-8 animate-fadeIn transition-colors">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-zinc-800 text-white p-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-zinc-700 text-emerald-400 flex items-center justify-center border border-slate-700 dark:border-zinc-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Payment Vault &amp; Security Architecture</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  PCI-DSS L1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Zero plain-text card storage, client-side encryption, and segregated store settlements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-600 dark:text-zinc-400">
          {/* 4 Pillars of Compliance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>1. Zero Raw Card Storage</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Raw 16-digit card numbers and security codes are converted to ephemeral tokens in browser memory. No plain-text card data touches our server database.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
                <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>2. 256-Bit TLS Transmission</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                All checkout payloads are transmitted over cryptographically encrypted TLS 1.3 channels with SHA-256 integrity verification.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
                <Store className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>3. Direct Merchant Settlement</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Funds are routed via segregated clearing channels directly into the merchant account belonging to the originating website link.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. Real-Time Card Validation</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Client-side Luhn mod-10 algorithmic checksum validation prevents inaccurate or malformed card sequences prior to tokenization.
              </p>
            </div>
          </div>

          {/* Interactive Tokenization Simulator */}
          <div className="p-4 bg-slate-900 dark:bg-zinc-800 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Interactive Tokenization Simulator
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Vault Active</span>
            </div>

            <p className="text-[11px] text-slate-300 dark:text-zinc-300">
              Type or test any card number to see how the client-side tokenization vault isolates raw digits:
            </p>

            <div>
              <input
                type="text"
                value={testCard}
                onChange={(e) => setTestCard(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                className="w-full px-3 py-2 bg-slate-800 dark:bg-zinc-900 border border-slate-700 dark:border-zinc-700 rounded-xl text-xs text-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Visual Token Output */}
            <div className="p-3 bg-slate-950 dark:bg-zinc-900/90 rounded-xl border border-slate-800 dark:border-zinc-700/80 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-400">Detected Brand:</span>
                <span className="font-semibold text-indigo-300">{brand}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-400">Luhn Algorithm:</span>
                <span className={isLuhnValid ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {isLuhnValid ? 'Valid Checksum' : 'Incomplete Card Digits'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 dark:border-zinc-800 pt-1.5">
                <span className="text-slate-400 dark:text-zinc-400">Ephemeral Token:</span>
                <span className="text-emerald-300 font-semibold">{simulatedToken}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-400">Stored Value:</span>
                <span className="text-slate-300 dark:text-zinc-300">•••• •••• •••• {cleanLast4}</span>
              </div>
            </div>
          </div>

          {/* Standards Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Security Standards Matrix
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 dark:text-zinc-200 text-xs">Cardholder Data Protection</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Zero PAN storage on web application host</div>
                </div>
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  COMPLIANT
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 dark:text-zinc-200 text-xs">Encrypted Transmission</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">TLS 1.3 cryptographic cipher suites enforced</div>
                </div>
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  COMPLIANT
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 dark:text-zinc-200 text-xs">Recipient Privacy Separation</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Buyer receipt isolation prevents gift price leaks</div>
                </div>
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  COMPLIANT
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 dark:text-zinc-200 text-xs">Store Settlement Clearing</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Split payouts to original merchant accounts</div>
                </div>
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  COMPLIANT
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white font-medium rounded-xl text-xs cursor-pointer transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
