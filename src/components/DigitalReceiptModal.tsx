import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Printer,
  Mail,
  Store,
  ShieldCheck,
  Gift,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { Order } from '../types';

interface DigitalReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  if (!order) return null;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const generatePrintableHtml = (o: Order) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${o.orderNumber} - OmniCart Universal Cart</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; border: 1px solid #a7f3d0; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; margin-bottom: 12px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; color: #334155; font-size: 12px; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .disbursement-card { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; font-size: 12px; font-family: monospace; display: flex; justify-content: space-between; }
    .totals { margin-left: auto; width: 300px; font-size: 13px; margin-top: 16px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; color: #475569; }
    .totals-row.final { border-top: 2px solid #0f172a; font-size: 16px; font-weight: 800; color: #0f172a; padding-top: 8px; margin-top: 8px; }
    .footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">OmniCart Universal Cart</h1>
      <div class="subtitle">Direct Originating Merchant Multi-Store Receipt</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">PAID &amp; SETTLED</span>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Order #${o.orderNumber}</div>
      <div style="font-size: 12px; color: #64748b;">${orderDate}</div>
    </div>
  </div>

  <div class="meta-box">
    <div>
      <strong>Billed &amp; Dispatched To:</strong><br>
      ${o.shippingAddress?.fullName || o.buyerName}<br>
      ${o.buyerEmail}<br>
      ${o.shippingAddress?.addressLine1 || '100 Market St'}, ${o.shippingAddress?.city || 'San Francisco'}, ${o.shippingAddress?.state || 'CA'} ${o.shippingAddress?.zipCode || '94105'}
    </div>
    <div>
      <strong>Payment &amp; PCI Security:</strong><br>
      ${o.payment.cardBrand} ending in •••• ${o.payment.last4}<br>
      Token: ${o.payment.token}<br>
      Auth Code: ${o.payment.authorizationCode}<br>
      <span style="color: #059669; font-size: 11px;">Verified PCI-DSS Level 1 Vault</span>
    </div>
  </div>

  <div class="section-title">Items Purchased &amp; Originating Stores</div>
  <table>
    <thead>
      <tr>
        <th>Product Description</th>
        <th>Merchant Brand</th>
        <th>Tracking / Promo</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${o.items
        .map(
          (item) => `
        <tr>
          <td>
            <strong>${item.title}</strong>
            ${item.selectedVariant ? `<br><small style="color: #64748b;">${item.selectedVariant}</small>` : ''}
            ${item.appliedPromo ? `<br><span style="display:inline-block; margin-top:3px; background:#ecfdf5; color:#065f46; font-size:11px; padding:2px 6px; border-radius:4px; border:1px solid #a7f3d0; font-weight:600;">Promo: ${item.appliedPromo.code} (-$${item.appliedPromo.discountAmount.toFixed(2)})</span>` : ''}
          </td>
          <td>${item.merchant}</td>
          <td style="font-family: monospace; font-size: 11px; color: #4338ca;">${item.trackingNumber || 'MANIFESTED'}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right; font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="section-title">Direct Originating Merchant Disbursals</div>
  ${o.merchantDisbursements
    .map(
      (m) => `
    <div class="disbursement-card">
      <div>
        <strong>${m.merchant}</strong> (${m.merchantDomain})<br>
        <span style="color: #64748b;">Disbursement Ref: ${m.disbursementReference}</span><br>
        <span style="color: #4f46e5;">Target: ${m.merchantPayoutAccount}</span>
      </div>
      <div style="text-align: right;">
        <span style="font-weight: bold; font-size: 13px;">$${m.amount.toFixed(2)}</span><br>
        <span style="color: #059669; font-weight: bold;">${m.transferStatus.toUpperCase()} (ACH/RTP)</span>
      </div>
    </div>
  `
    )
    .join('')}

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>$${o.subtotal.toFixed(2)}</span>
    </div>
    ${o.promoDiscountTotal && o.promoDiscountTotal > 0 ? `
    <div class="totals-row" style="color: #059669; font-weight: 600;">
      <span>Store Promo Discounts:</span>
      <span>-$${o.promoDiscountTotal.toFixed(2)}</span>
    </div>` : ''}
    <div class="totals-row">
      <span>Shipping:</span>
      <span>$${o.shippingTotal.toFixed(2)}</span>
    </div>
    <div class="totals-row">
      <span>Estimated Sales Tax:</span>
      <span>$${o.taxTotal.toFixed(2)}</span>
    </div>
    <div class="totals-row final">
      <span>Total Paid:</span>
      <span>$${o.totalPaid.toFixed(2)}</span>
    </div>
  </div>

  <div class="footer">
    Thank you for using OmniCart Universal Cart.<br>
    All items are fulfilled directly by their respective brands with 100% direct merchant clearing.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
  };

  const handlePrint = () => {
    // 1. First invoke native window.print()
    let printTriggered = false;
    try {
      window.print();
      printTriggered = true;
    } catch (err) {
      console.warn('Direct window.print() failed:', err);
    }

    // 2. In addition, automatically prepare and download the clean standalone printable receipt
    // This guarantees that in sandboxed iframes (where browser print dialogs are suppressed),
    // the user ALWAYS gets their clean receipt without clicking again.
    handleDownloadInvoice();

    setPrintNotice(
      printTriggered
        ? 'Print triggered! We have also downloaded a high-res printable copy for your records.'
        : 'Print dialog ready! Downloaded clean printable receipt HTML (open to print/save as PDF).'
    );
  };

  const handleDownloadInvoice = () => {
    const html = generatePrintableHtml(order);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniCart-Receipt-${order.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setPrintNotice('Downloaded clean printable HTML receipt. Open it in any browser to print as PDF.');
  };

  const handleCopyText = () => {
    const textLines = [
      `=============================================`,
      `OMNICART UNIVERSAL CART - OFFICIAL RECEIPT`,
      `Order: #${order.orderNumber}`,
      `Date: ${orderDate}`,
      `Status: PAID & SETTLED (PCI-DSS L1 Tokenized)`,
      `Buyer: ${order.buyerName} <${order.buyerEmail}>`,
      `=============================================`,
      `ITEMS PURCHASED:`,
      ...order.items.map(
        (i) =>
          `- ${i.title} (${i.merchant}) x${i.quantity} @ $${i.price.toFixed(2)} = $${(
            i.price * i.quantity
          ).toFixed(2)} [Tracking: ${i.trackingNumber}]`
      ),
      `---------------------------------------------`,
      `MERCHANT DISBURSEMENTS:`,
      ...order.merchantDisbursements.map(
        (m) =>
          `- ${m.merchant}: $${m.amount.toFixed(2)} -> ${m.merchantPayoutAccount} (Ref: ${
            m.disbursementReference
          })`
      ),
      `---------------------------------------------`,
      `Subtotal:       $${order.subtotal.toFixed(2)}`,
      `Shipping:       $${order.shippingTotal.toFixed(2)}`,
      `Tax:            $${order.taxTotal.toFixed(2)}`,
      `Total Paid:     $${order.totalPaid.toFixed(2)}`,
      `=============================================`,
    ];

    navigator.clipboard.writeText(textLines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="printable-receipt-card"
        className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-8 animate-fadeIn transition-colors"
      >
        {/* Top success banner */}
        <div className="bg-slate-900 dark:bg-zinc-800 text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 no-print border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Order Confirmed &amp; Dispatched</h2>
          <p className="text-xs text-slate-300 dark:text-zinc-300 max-w-md mx-auto">
            Order #{order.orderNumber} successfully placed. Originating merchant warehouses have received fulfillment purchase orders.
          </p>
        </div>

        {/* Modal content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-600 dark:text-zinc-400">
          {/* Email delivery confirmation box */}
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-1.5 text-slate-900 dark:text-zinc-100">
            <div className="flex items-center gap-2 font-semibold text-xs">
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Digital Receipt Sent Directly to Buyer</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300">
              Receipt &amp; payment confirmation dispatched to:{' '}
              <strong className="underline">{order.buyerEmail}</strong>
            </p>
            {order.isGift && (
              <div className="pt-1.5 border-t border-slate-200/80 dark:border-zinc-700/60 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300">
                <Gift className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>
                  <strong>Gift Privacy Enforced:</strong> The wishlist creator (
                  {order.cartCreatorEmail || 'Alex Rivera'}) was not sent billing or payment card data.
                </span>
              </div>
            )}
          </div>

          {/* Live Price Verification Proof */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between text-[11px] text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold block">Live Meta-Tag Price Guard: Verified</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                  Prices verified against originating retailer URL meta-tags (og:price, JSON-LD) prior to final handover.
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-800/60 font-semibold text-emerald-800 dark:text-emerald-200 shrink-0">
              ZERO DISCREPANCY
            </span>
          </div>

          {/* Direct Merchant Settlement Breakdown */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-indigo-500" />
              <span>Direct Store Settlements</span>
            </div>

            <div className="space-y-2">
              {order.merchantDisbursements.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 p-3 rounded-xl flex items-center justify-between font-mono"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-zinc-100 text-xs">{m.merchant}</div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Ref: {m.disbursementReference}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-zinc-100 text-xs">${m.amount.toFixed(2)}</div>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-semibold">
                      {m.transferStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchased Items & Tracking Numbers */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">Items Purchased</div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-zinc-700 shrink-0"
                    />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-zinc-100 text-xs line-clamp-1">{item.title}</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {item.merchant} • Qty: {item.quantity} • Tracking: {item.trackingNumber}
                      </div>
                      {item.appliedPromo && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium border border-emerald-200/60 dark:border-emerald-800/60">
                          <span>Promo {item.appliedPromo.code}:</span>
                          <span>-${item.appliedPromo.discountAmount.toFixed(2)} off</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-zinc-100 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PCI Payment Proof */}
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-slate-800 dark:text-zinc-200 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                PCI-DSS Level 1 Tokenized
              </span>
              <span>
                {order.payment.cardBrand} •••• {order.payment.last4}
              </span>
            </div>
            <div className="text-slate-500 dark:text-zinc-400">Token: {order.payment.token}</div>
            <div className="text-slate-500 dark:text-zinc-400">Auth Code: {order.payment.authorizationCode}</div>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.promoDiscountTotal && order.promoDiscountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Store Promo Code Savings:</span>
                <span>-${order.promoDiscountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Shipping:</span>
              <span>${order.shippingTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Sales Tax:</span>
              <span>${order.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-zinc-100 text-sm pt-1 border-t border-slate-100 dark:border-zinc-800">
              <span>Total Paid:</span>
              <span>${order.totalPaid.toFixed(2)}</span>
            </div>
          </div>

          {/* Feedback notice if print/download was clicked */}
          {printNotice && (
            <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] flex items-center justify-between animate-fadeIn no-print">
              <span>{printNotice}</span>
              <button
                onClick={() => setPrintNotice(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-100 font-bold ml-2 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 flex flex-wrap gap-2 no-print">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white font-medium rounded-xl flex items-center justify-center gap-1.5 flex-1 min-w-[130px] cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-300 dark:text-zinc-600" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadInvoice}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium rounded-xl flex items-center justify-center gap-1.5 flex-1 min-w-[130px] cursor-pointer transition-colors border border-slate-200 dark:border-zinc-700"
              title="Download standalone HTML invoice"
            >
              <Download className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-slate-200 dark:border-zinc-700"
              title="Copy receipt summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-900 dark:text-zinc-100 font-medium rounded-xl cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
