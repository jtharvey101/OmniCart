import React, { useState } from 'react';
import {
  Clock,
  Package,
  Truck,
  Store,
  Receipt,
  Gift,
  Mail,
  Search,
  ArrowRight,
  ShieldCheck,
  X,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Order } from '../types';
import { OrdersEmptyStateIllustration } from './EmptyStateIllustrations';

interface OrderHistoryViewProps {
  orders: Order[];
  onViewReceipt: (order: Order) => void;
  onInspectMerchantDispatch?: (order: Order) => void;
  onNavigateToCart: () => void;
  onOpenRefundAssistant?: (order: Order, itemTitle?: string) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onViewReceipt,
  onInspectMerchantDispatch,
  onNavigateToCart,
  onOpenRefundAssistant,
}) => {
  const [filterText, setFilterText] = useState('');

  const filteredOrders = orders.filter((order) => {
    const q = filterText.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.buyerEmail.toLowerCase().includes(q) ||
      order.items.some(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.merchant.toLowerCase().includes(q) ||
          i.trackingNumber.toLowerCase().includes(q)
      )
    );
  });

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 my-6 shadow-xs transition-colors">
        {/* Professional SVG Empty State Illustration */}
        <OrdersEmptyStateIllustration className="w-64 h-44 mx-auto" />

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            No Orders Placed Yet
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Once you check out from your multi-store cart, individual retailer shipments, live carrier tracking numbers, and digital receipts will appear here.
          </p>
        </div>

        <div className="pt-1 flex items-center justify-center">
          <button
            id="btn-empty-orders-cart"
            onClick={onNavigateToCart}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-all inline-flex items-center gap-2"
          >
            <span>Go to Universal Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Brand Dispatch Footnote */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-indigo-500" />
            <span>Direct Brand Warehouses</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-emerald-500" />
            <span>Automated Merchant Manifests</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <span>Order History &amp; Tracking</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Individual shipment progress per store and direct brand fulfillment records.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search by order, item, or store..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Originating Store Delivery Assurance Banner */}
      <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-900 dark:text-zinc-100 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-800 dark:text-zinc-200 shrink-0 shadow-2xs">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Direct Store Settlement &amp; Warehouse Dispatch</span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Each retailer receives an independent fulfillment order with recipient delivery address, dispatched straight from brand warehouses.
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-3">
            <Search className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">No matching orders found</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              No orders match &ldquo;{filterText}&rdquo;. Try searching for another item title, store name, or tracking number.
            </p>
            <button
              onClick={() => setFilterText('')}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-4 p-5 sm:p-6"
            >
              {/* Order Header Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{order.orderNumber}</span>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">{orderDate}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      Paid &amp; Settled
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-500" />
                      Receipt Sent: <strong className="text-slate-800 dark:text-zinc-200">{order.buyerEmail}</strong>
                    </span>
                    {order.isGift && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                        <Gift className="w-3 h-3 text-indigo-500" />
                        Gift Privacy Protected
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">${order.totalPaid.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {order.payment.cardBrand} •••• {order.payment.last4}
                    </div>
                  </div>

                  {onInspectMerchantDispatch && (
                    <button
                      onClick={() => onInspectMerchantDispatch(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700 shadow-2xs"
                      title="Inspect retailer order ingestion handshake"
                    >
                      <Store className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                      <span className="hidden sm:inline">Store Dispatch</span>
                      <span className="sm:hidden">Store</span>
                    </button>
                  )}

                  {onOpenRefundAssistant && (
                    <button
                      onClick={() => onOpenRefundAssistant(order)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs"
                      title="Request return, replacement, or refund via AI concierge"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="hidden sm:inline">Return / Refund</span>
                      <span className="sm:hidden">Refund</span>
                    </button>
                  )}

                  <button
                    onClick={() => onViewReceipt(order)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>

              {/* Authorized Returns & Refunds if any exist on this order */}
              {order.returnRecords && order.returnRecords.length > 0 && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                        {order.returnRecords.length} Return Authorized &amp; Refund Initiated
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      Disbursement: Card Refund Active
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {order.returnRecords.map((ret, rIdx) => (
                      <div
                        key={rIdx}
                        className="bg-white/90 dark:bg-zinc-900/90 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50 space-y-1"
                      >
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{ret.rmaNumber}</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">${ret.refundAmount.toFixed(2)}</span>
                        </div>
                        <p className="text-slate-600 dark:text-zinc-400 truncate text-[11px]">{ret.itemTitle}</p>
                        <p className="text-slate-400 dark:text-zinc-500 font-mono text-[10px]">
                          {ret.returnCarrier} Tracking: {ret.returnTrackingNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Merchant Split Item Tracking Cards */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Store Shipments &amp; Live Tracking</span>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400 lowercase">
                    {order.items.length} items fulfilled directly
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {order.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Item Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-zinc-700 shrink-0 bg-white dark:bg-zinc-900"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-zinc-700">
                              {item.merchant}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                              ({item.merchantDomain})
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate mt-0.5 max-w-sm">
                            {item.title}
                          </h4>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Qty: {item.quantity} • Paid: ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          {item.appliedPromo && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                              <span>Code {item.appliedPromo.code}:</span>
                              <span>-${item.appliedPromo.discountAmount.toFixed(2)} off</span>
                            </div>
                          )}

                          {/* Item-level AI return trigger */}
                          {onOpenRefundAssistant && (
                            <div className="mt-2">
                              <button
                                onClick={() => onOpenRefundAssistant(order, item.title)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Request Return / Refund</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tracking Progress & Status */}
                      <div className="w-full sm:w-72 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-700/80 space-y-2 shrink-0">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-indigo-500" />
                            {item.carrier}
                          </span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 text-[10px] uppercase">
                            {item.fulfillmentStatus}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.fulfillmentStatus === 'Delivered'
                                ? 'w-full bg-emerald-500'
                                : item.fulfillmentStatus === 'In Transit'
                                ? 'w-2/3 bg-indigo-600'
                                : 'w-1/3 bg-amber-500'
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400 pt-0.5">
                          <span>Track: {item.trackingNumber.slice(0, 12)}...</span>
                          <span className="text-slate-700 dark:text-zinc-300 font-medium">Est: {item.estimatedDelivery}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
