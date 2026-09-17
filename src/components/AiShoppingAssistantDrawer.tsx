import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Plus,
  Check,
  RotateCcw,
  ShieldCheck,
  Printer,
  RefreshCw,
} from 'lucide-react';
import {
  Product,
  Order,
  AiChatMessage,
  RecommendedProduct,
  ComparisonData,
  RefundProposal,
  ReturnRefundRecord,
} from '../types';

interface AiShoppingAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  orders: Order[];
  onAddToCart: (product: Partial<Product>) => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
  initialPrompt?: string;
  initialContextMode?: 'chat' | 'compare' | 'recommend' | 'refund';
  selectedOrderForRefund?: Order | null;
}

const QUICK_PROMPTS: {
  label: string;
  prompt: string;
  mode?: 'chat' | 'compare' | 'recommend' | 'refund';
}[] = [
  {
    label: '🛒 Cart Overview',
    prompt: 'Tell me about my cart breakdown, merchants, and shipping details.',
    mode: 'chat',
  },
  {
    label: '⚖️ Compare my cart items',
    prompt: 'Please compare the products currently in my cart and highlight key trade-offs, price-to-value, and return policies.',
    mode: 'compare',
  },
  {
    label: '💡 Smart accessories',
    prompt: 'What accessories or complementary essentials do you recommend based on what is in my cart right now?',
    mode: 'recommend',
  },
  {
    label: '🛡️ Returns & refunds',
    prompt: 'I would like assistance returning an item or requesting a refund from one of my orders.',
    mode: 'refund',
  },
  {
    label: '📦 Multi-store shipping',
    prompt: 'How does shipping, delivery tracking, and returns work across multiple retailers in OmniCart?',
    mode: 'chat',
  },
];

export const AiShoppingAssistantDrawer: React.FC<AiShoppingAssistantDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  orders,
  onAddToCart,
  onOrderUpdated,
  initialPrompt,
  initialContextMode = 'chat',
  selectedOrderForRefund,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'chat' | 'compare' | 'recommend' | 'refund'>(initialContextMode);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [printableSlip, setPrintableSlip] = useState<ReturnRefundRecord | null>(null);

  // Return reason form state
  const [selectedReason, setSelectedReason] = useState<'wrong_size' | 'defective' | 'changed_mind' | 'arrived_late' | 'not_as_described' | 'other'>('wrong_size');
  const [reasonExplanation, setReasonExplanation] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: AiChatMessage = {
        id: 'msg_welcome',
        role: 'assistant',
        content: `👋 Hi! I'm your **OmniCart AI Shopping Concierge**.\n\nI can analyze your **Universal Cart**, compare products side-by-side, recommend verified accessories, and guide you through **direct merchant returns & refunds**.\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Handle triggered initial prompts
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt, initialContextMode);
    }
    if (isOpen && selectedOrderForRefund) {
      const prompt = `I would like to request a return or refund for Order #${selectedOrderForRefund.orderNumber} containing ${selectedOrderForRefund.items.map(i => i.title).join(', ')}.`;
      handleSendMessage(prompt, 'refund');
    }
  }, [isOpen, initialPrompt, selectedOrderForRefund]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, contextOverride?: 'chat' | 'compare' | 'recommend' | 'refund') => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: AiChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const payload = {
        message: text,
        conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        cartItems: cartItems.map((item) => ({
          id: item.id,
          title: item.title,
          merchant: item.merchant,
          merchantDomain: item.merchantDomain,
          price: item.price,
          originalPrice: item.originalPrice,
          category: item.category,
          inStock: item.inStock,
          selectedVariant: item.selectedVariant,
          rating: item.rating,
          description: item.description,
        })),
        orders: orders.map((ord) => ({
          id: ord.id,
          orderNumber: ord.orderNumber,
          createdAt: ord.createdAt,
          totalPaid: ord.totalPaid,
          items: ord.items,
          returnRecords: ord.returnRecords || [],
        })),
        contextType: contextOverride || activeTab,
      };

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const assistantMessage: AiChatMessage = {
          id: `msg_assistant_${Date.now()}`,
          role: 'assistant',
          content: json.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedProducts: json.data.recommendedProducts,
          comparisonData: json.data.comparisonData,
          refundProposal: json.data.refundProposal,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(json.error || 'Failed to get response');
      }
    } catch (err: any) {
      const errorMessage: AiChatMessage = {
        id: `msg_error_${Date.now()}`,
        role: 'assistant',
        content: `I encountered a momentary issue processing that request. Please try again or rephrase your question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecommendedToCart = (rec: RecommendedProduct) => {
    onAddToCart({
      title: rec.title,
      merchant: rec.merchant,
      merchantDomain: rec.merchantDomain,
      merchantRoutingId: rec.merchantRoutingId || 'MERCH_DIRECT_ROUTE',
      merchantPayoutAccount: rec.merchantPayoutAccount || `${rec.merchant} Settlement Vault`,
      price: rec.price,
      originalPrice: rec.originalPrice || rec.price,
      currency: 'USD',
      imageUrl: rec.imageUrl,
      description: rec.description,
      category: rec.category,
      inStock: true,
      url: rec.url,
    });

    setAddedItemIds((prev) => ({ ...prev, [rec.id]: true }));
  };

  const handleProcessRefund = async (proposal: RefundProposal) => {
    setIsSubmittingRefund(true);
    try {
      const reasonLabels: Record<string, string> = {
        wrong_size: 'Wrong size or fit',
        defective: 'Item defective or damaged in transit',
        changed_mind: 'Changed mind / no longer needed',
        arrived_late: 'Arrived later than promised',
        not_as_described: 'Different from website listing',
        other: 'Other customer concern',
      };

      const res = await fetch('/api/refunds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: proposal.orderId,
          productId: proposal.productId,
          reason: selectedReason,
          reasonLabel: reasonLabels[selectedReason] || 'Customer Return',
          explanation: reasonExplanation || 'Initiated via OmniCart AI Concierge',
          returnMethod: 'PREPAID_DROP_OFF',
        }),
      });

      const data = await res.json();
      if (data.success && data.returnRecord) {
        if (onOrderUpdated && data.order) {
          onOrderUpdated(data.order);
        }

        const confirmMsg: AiChatMessage = {
          id: `msg_refund_done_${Date.now()}`,
          role: 'assistant',
          content: `### ✅ Return Authorized: ${data.returnRecord.rmaNumber}\n\nYour return for **${proposal.itemTitle}** has been approved by **${proposal.merchant}**.\n\n- **Authorized RMA**: \`${data.returnRecord.rmaNumber}\`\n- **Prepaid Carrier**: ${data.returnRecord.returnCarrier}\n- **UPS Return Tracking**: \`${data.returnRecord.returnTrackingNumber}\`\n- **Refund Disbursement**: **$${Number(proposal.refundAmount).toFixed(2)}** will be credited directly back to your original payment card within **48 hours** of carrier scan.\n- **Direct Settlement Ledger Reversal**: \`${data.returnRecord.merchantSettlementReversalRef}\``,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          returnRecord: data.returnRecord,
        };

        setMessages((prev) => [...prev, confirmMsg]);
      } else {
        throw new Error(data.error || 'Failed to authorize return');
      }
    } catch (err: any) {
      alert(`Return processing error: ${err?.message || 'Please try again'}`);
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full overflow-hidden text-slate-900 dark:text-zinc-100 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-drawer-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ai-drawer-title" className="text-base font-bold text-slate-950 dark:text-white tracking-tight">
                  OmniCart AI Concierge
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Connected to Universal Cart ({cartItems.length}) & Orders ({orders.length})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'msg_welcome_reset',
                    role: 'assistant',
                    content: `✨ Conversation cleared. What else can I assist you with regarding your cart, product comparisons, or refunds?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400 dark:text-zinc-500">
                <span>{msg.role === 'user' ? 'You' : 'OmniCart AI'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 rounded-tr-xs shadow-xs'
                    : 'bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-xs border border-slate-200/80 dark:border-zinc-700/80 shadow-xs'
                }`}
              >
                {/* Markdown text rendered cleanly with explicit light/dark typography */}
                <div className="max-w-none text-slate-800 dark:text-zinc-200">
                  <Markdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-800 dark:text-zinc-200">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-slate-950 dark:text-white">{children}</strong>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-base font-extrabold text-slate-950 dark:text-white mt-3 mb-1.5">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-sm font-bold text-slate-950 dark:text-white mt-3 mb-1.5">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xs font-bold text-slate-950 dark:text-white mt-2.5 mb-1 tracking-tight">{children}</h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-2 mb-1">{children}</h4>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 space-y-1 mb-2.5 text-slate-800 dark:text-zinc-200">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 space-y-1 mb-2.5 text-slate-800 dark:text-zinc-200">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-slate-800 dark:text-zinc-200">{children}</li>
                      ),
                      code: ({ children }) => (
                        <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-200/80 dark:bg-zinc-900 text-slate-900 dark:text-indigo-300 border border-slate-300/60 dark:border-zinc-700/60 font-semibold">
                          {children}
                        </code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-indigo-500 pl-3 py-1 my-2 italic text-slate-700 dark:text-zinc-300 bg-slate-50/60 dark:bg-zinc-900/60 rounded-r">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {msg.content}
                  </Markdown>
                </div>

                {/* Render Comparison Table if present */}
                {msg.comparisonData && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-zinc-700/80 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-200">
                      <span className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">⚖️</span>
                      <span>Product Comparison Matrix</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold border-b border-slate-200 dark:border-zinc-700">
                          <tr>
                            {msg.comparisonData.columns.map((col, idx) => (
                              <th key={idx} className="px-3 py-2.5 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {msg.comparisonData.rows.map((row, rIdx) => {
                            const keys = Object.keys(row).filter((k) => k !== 'criteria');
                            return (
                              <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50">
                                <td className="px-3 py-2 font-medium text-slate-800 dark:text-zinc-300 bg-slate-50/40 dark:bg-zinc-800/40">
                                  {row.criteria}
                                </td>
                                {keys.map((k, kIdx) => (
                                  <td key={kIdx} className="px-3 py-2 text-slate-600 dark:text-zinc-400">
                                    {String(row[k])}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {msg.comparisonData.verdictSummary && (
                      <p className="text-xs text-slate-600 dark:text-zinc-400 italic bg-slate-50 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
                        <strong className="text-slate-900 dark:text-zinc-200">Verdict:</strong> {msg.comparisonData.verdictSummary}
                      </p>
                    )}
                  </div>
                )}

                {/* Render Recommended Products if present */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-zinc-700/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-zinc-200">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Curated Accessories & Essentials</span>
                      </span>
                      <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">Direct Retailer Sourced</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.recommendedProducts.map((rec) => {
                        const isAdded = addedItemIds[rec.id];
                        return (
                          <div
                            key={rec.id}
                            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 flex items-center gap-3 shadow-xs hover:border-slate-300 dark:hover:border-zinc-600 transition-all"
                          >
                            <img
                              src={rec.imageUrl}
                              alt={rec.title}
                              className="w-14 h-14 object-cover rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200/60 dark:border-zinc-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                                <span className="font-semibold text-slate-700 dark:text-zinc-300">{rec.merchant}</span>
                                <span>•</span>
                                <span>{rec.category}</span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate mt-0.5">
                                {rec.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                {rec.reason}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  ${rec.price.toFixed(2)}
                                </span>
                                {rec.originalPrice && rec.originalPrice > rec.price && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    ${rec.originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddRecommendedToCart(rec)}
                              disabled={isAdded}
                              className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-xs'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Render Refund Proposal Card if present */}
                {msg.refundProposal && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-zinc-700/80 space-y-3">
                    <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <RotateCcw className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                              Return & Refund Eligibility Verified
                            </h4>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300">
                              Order #{msg.refundProposal.orderNumber} • {msg.refundProposal.merchant}
                            </p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 rounded-full border border-emerald-300 dark:border-emerald-800">
                          ${Number(msg.refundProposal.refundAmount).toFixed(2)}
                        </span>
                      </div>

                      <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-amber-200/50 dark:border-amber-800/40">
                        <p className="font-semibold text-slate-900 dark:text-zinc-100">{msg.refundProposal.itemTitle}</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{msg.refundProposal.policySummary}</p>
                      </div>

                      {/* Reason Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Select Reason for Return:
                        </label>
                        <select
                          value={selectedReason}
                          onChange={(e: any) => setSelectedReason(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="wrong_size">Wrong size or fit</option>
                          <option value="defective">Item defective / damaged</option>
                          <option value="changed_mind">Changed mind / no longer needed</option>
                          <option value="arrived_late">Arrived too late</option>
                          <option value="not_as_described">Different from website photos</option>
                          <option value="other">Other reason</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Optional notes for merchant return department..."
                          value={reasonExplanation}
                          onChange={(e) => setReasonExplanation(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <button
                        onClick={() => handleProcessRefund(msg.refundProposal!)}
                        disabled={isSubmittingRefund}
                        className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingRefund ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Contacting Retailer Settlement Rails...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Authorize Return & Generate Prepaid Label</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Render Return Record if present */}
                {msg.returnRecord && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-zinc-700/80 space-y-3">
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                            Prepaid Label Ready ({msg.returnRecord.rmaNumber})
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          Refund: ${msg.returnRecord.refundAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-zinc-300 space-y-1 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/60">
                        <p><strong>Carrier:</strong> {msg.returnRecord.returnCarrier}</p>
                        <p><strong>Return Tracking:</strong> <span className="font-mono">{msg.returnRecord.returnTrackingNumber}</span></p>
                        <p><strong>Estimated Card Credit:</strong> By {msg.returnRecord.estimatedDisbursementDate}</p>
                      </div>

                      <button
                        onClick={() => setPrintableSlip(msg.returnRecord!)}
                        className="w-full py-2 px-3 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>View / Print Return Slip & Prepaid Label</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 text-xs px-2 py-1">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>OmniCart AI is analyzing cart and retailer policies...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-200/60 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (qp.mode) setActiveTab(qp.mode);
                  handleSendMessage(qp.prompt, qp.mode);
                }}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask about cart items, comparisons, or refunds..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center mt-2">
            OmniCart AI evaluates multi-store products and merchant return windows. Always verify with retailer terms.
          </p>
        </div>
      </div>

      {/* Printable Return Slip Modal */}
      {printableSlip && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-300 dark:border-zinc-700">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-950 dark:text-white">Prepaid Return Shipping Slip</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Authorized RMA Packing Manifest</p>
              </div>
              <button
                onClick={() => setPrintableSlip(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-zinc-800/60">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-400 font-bold">RMA Identifier</p>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{printableSlip.rmaNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-400 font-bold">Carrier</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{printableSlip.returnCarrier}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 text-xs space-y-1 text-slate-700 dark:text-zinc-300">
                <p><strong className="text-slate-900 dark:text-white">Item:</strong> {printableSlip.itemTitle}</p>
                <p><strong className="text-slate-900 dark:text-white">Origin Retailer:</strong> {printableSlip.merchant}</p>
                <p><strong className="text-slate-900 dark:text-white">Return Reason:</strong> {printableSlip.reasonLabel}</p>
                <p><strong className="text-slate-900 dark:text-white">Tracking Number:</strong> <span className="font-mono">{printableSlip.returnTrackingNumber}</span></p>
                <p><strong className="text-slate-900 dark:text-white">Estimated Refund Amount:</strong> ${printableSlip.refundAmount.toFixed(2)}</p>
              </div>

              {/* Barcode Mock */}
              <div className="pt-2 flex flex-col items-center">
                <div className="w-64 h-12 bg-slate-900 flex items-center justify-around px-4 rounded-md">
                  <div className="w-1 h-full bg-white"></div>
                  <div className="w-2 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-3 h-full bg-white"></div>
                  <div className="w-1 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-2 h-full bg-white"></div>
                  <div className="w-1 h-full bg-white"></div>
                </div>
                <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 tracking-widest mt-1">*{printableSlip.rmaNumber}*</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintableSlip(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Return Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
