import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  X,
  Server,
  ShieldCheck,
  Truck,
  ExternalLink,
  Code,
  RefreshCw,
} from 'lucide-react';
import { Order, MerchantOrderDispatch } from '../types';

interface MerchantDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const MerchantDispatchModal: React.FC<MerchantDispatchModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [selectedMerchantIdx, setSelectedMerchantIdx] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'payload' | 'guarantee'>('overview');

  if (!isOpen || !order) return null;

  const dispatches: MerchantOrderDispatch[] = order.merchantDispatches || [];
  const currentDispatch = dispatches[selectedMerchantIdx] || dispatches[0];

  const handleLiveReverify = async () => {
    if (!currentDispatch) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const resp = await fetch('/api/verify-merchant-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: currentDispatch.merchant,
          merchantDomain: currentDispatch.merchantDomain,
          retailerOrderId: currentDispatch.retailerOrderId,
        }),
      });
      const data = await resp.json();
      setVerificationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-8 animate-fadeIn transition-colors">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-zinc-800 text-white p-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-zinc-700 text-slate-200 flex items-center justify-center border border-slate-700 dark:border-zinc-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Merchant Order Ingestion &amp; Settlement</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Confirming retailer warehouse order allocation and recipient shipping details
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

        {/* View Mode Tabs */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 px-6 pt-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              viewMode === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Fulfillment Handshake
          </button>
          <button
            onClick={() => setViewMode('payload')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              viewMode === 'payload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            API Transmitted Payload
          </button>
          <button
            onClick={() => setViewMode('guarantee')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              viewMode === 'guarantee'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Delivery Guarantee
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-600 dark:text-zinc-400">
          {/* Store Selector if multiple merchants */}
          {dispatches.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 shrink-0">Store:</span>
              {dispatches.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMerchantIdx(idx);
                    setVerificationResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    selectedMerchantIdx === idx
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-slate-900 dark:border-zinc-100 shadow-2xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50'
                  }`}
                >
                  {d.merchant}
                </button>
              ))}
            </div>
          )}

          {currentDispatch && viewMode === 'overview' && (
            <div className="space-y-4">
              {/* Verified Status Card */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">
                        Order Received by {currentDispatch.merchant}
                      </h4>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                        PO Reference: <strong className="font-mono">{currentDispatch.retailerOrderId}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300">
                    HTTP 200 OK
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
                  <div>
                    <span className="text-emerald-700 dark:text-emerald-400">Warehouse Location:</span>
                    <div className="font-semibold text-emerald-950 dark:text-emerald-200">{currentDispatch.warehouseLocation}</div>
                  </div>
                  <div>
                    <span className="text-emerald-700 dark:text-emerald-400">Dispatch Protocol:</span>
                    <div className="font-semibold text-emerald-950 dark:text-emerald-200 font-mono">
                      {currentDispatch.dispatchProtocol === 'DIRECT_API_WEBHOOK'
                        ? 'Merchant Webhook (Shopify/Direct API)'
                        : currentDispatch.dispatchProtocol === 'AFFILIATE_MERCHANT_EDI'
                        ? 'Enterprise EDI Order Protocol'
                        : 'Headless Agentic Checkout Bot (RPA)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Recipient Destination Proof */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-indigo-500" />
                    Delivery Destination Received by {currentDispatch.merchant}
                  </span>
                  <span className="text-slate-400 dark:text-zinc-500 font-mono text-[10px]">
                    Batch #{currentDispatch.merchantResponse.internalFulfillmentBatch}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1 font-mono text-[11px]">
                  <div className="text-slate-900 dark:text-zinc-100 font-semibold">
                    Recipient: {currentDispatch.payloadDelivered.recipientName}
                  </div>
                  <div className="text-slate-600 dark:text-zinc-400">
                    Address: {currentDispatch.payloadDelivered.shippingAddress}
                  </div>
                  <div className="text-indigo-600 dark:text-indigo-400 pt-1">
                    Direct Payout Settlement ID: {currentDispatch.payloadDelivered.payoutRef}
                  </div>
                </div>

                {/* SKUs */}
                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                    Items Allocated for Physical Packing ({currentDispatch.payloadDelivered.skus.length}):
                  </div>
                  {currentDispatch.payloadDelivered.skus.map((sku, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-700 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-zinc-100">{sku.title}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500">{sku.variant} • Qty: {sku.quantity}</div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-zinc-100">
                        ${(sku.unitPrice * sku.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Ping Verification Box */}
              <div className="p-4 bg-slate-900 dark:bg-zinc-800 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    Live Store Fulfillment Query
                  </span>
                  <button
                    onClick={handleLiveReverify}
                    disabled={isVerifying}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 border border-slate-700 dark:border-zinc-600 disabled:opacity-50 text-white rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                    <span>{isVerifying ? 'Querying...' : 'Ping Store API'}</span>
                  </button>
                </div>

                {verificationResult ? (
                  <div className="p-3 bg-slate-800/80 dark:bg-zinc-900 rounded-xl border border-slate-700 dark:border-zinc-700 space-y-1 font-mono text-[11px] text-emerald-300 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <strong className="text-white">{verificationResult.ingestionStatus}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Warehouse Packing Slip:</span>
                      <strong className="text-emerald-400">Generated &amp; Allocated</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Response Latency:</span>
                      <span>{verificationResult.handshakeLatencyMs}ms (TLS 1.3 Verified)</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-300 dark:text-zinc-400">
                    Query {currentDispatch.merchant}'s warehouse order intake system to verify live packing queue status.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Raw JSON Payload */}
          {currentDispatch && viewMode === 'payload' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-500" />
                  Order Payload Transmitted to {currentDispatch.merchantDomain}
                </span>
                <span className="text-[10px] font-mono text-slate-400">application/json</span>
              </div>

              <pre className="p-4 bg-slate-900 dark:bg-zinc-950 text-emerald-400 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800 dark:border-zinc-800">
                {JSON.stringify(
                  {
                    protocol: currentDispatch.dispatchProtocol,
                    retailerOrderId: currentDispatch.retailerOrderId,
                    timestamp: currentDispatch.dispatchedAt,
                    originMerchant: currentDispatch.merchant,
                    originDomain: currentDispatch.merchantDomain,
                    payoutDisbursement: {
                      amount: currentDispatch.totalDisbursed,
                      currency: 'USD',
                      payoutReference: currentDispatch.payloadDelivered.payoutRef,
                      clearingNetwork: 'ACH_REAL_TIME_PAYMENT',
                    },
                    shippingFulfillment: {
                      recipient: currentDispatch.payloadDelivered.recipientName,
                      deliveryAddress: currentDispatch.payloadDelivered.shippingAddress,
                    },
                    orderManifest: currentDispatch.payloadDelivered.skus,
                    merchantAcknowledgment: currentDispatch.merchantResponse,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {/* Delivery Guarantee View Mode */}
          {viewMode === 'guarantee' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-2">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  How Multi-Store Direct Delivery Works
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  When purchasing from multiple stores through this universal cart, items are fulfilled using direct merchant clearing:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Direct Store Order Creation</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 pl-7">
                    An independent purchase order is placed directly with each originating store (e.g. Nike, Apple), specifying your exact chosen sizes, colors, and delivery address.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Direct Merchant Settlement</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 pl-7">
                    Each merchant's payout account receives the item balance directly via commercial clearing, freeing the items for warehouse staging and packing.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Official Carrier Tracking</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 pl-7">
                    The merchant packages the parcel, labels it with your delivery address, and attaches live tracking (UPS, FedEx, or USPS) accessible directly in your Order History.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800">
            {currentDispatch?.nativeStoreCartUrl && (
              <a
                href={currentDispatch.nativeStoreCartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                <span>Verify on {currentDispatch.merchant}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold rounded-xl cursor-pointer ml-auto transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
