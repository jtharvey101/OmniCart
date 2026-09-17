export interface PriceHistoryPoint {
  date: string;
  price: number;
  note?: string;
}

export interface AppliedPromoCode {
  code: string;
  productId: string;
  productTitle: string;
  merchant: string;
  merchantDomain: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  description: string;
  validatedAt: string;
  verificationRef: string;
  storeValidationStatus: 'VERIFIED_BY_ORIGIN_STORE';
}

export interface Product {
  id: string;
  url: string;
  title: string;
  merchant: string;
  merchantDomain: string;
  merchantRoutingId: string;
  merchantPayoutAccount: string;
  price: number;
  originalPrice: number;
  currency: string;
  imageUrl: string;
  description: string;
  category: string;
  inStock: boolean;
  rating?: number;
  reviewsCount?: number;
  priceHistory: PriceHistoryPoint[];
  targetAlertPrice?: number;
  alertEmail?: string;
  alertEnabled?: boolean;
  quantity: number;
  selectedVariant?: string;
  availableVariants?: string[];
  appliedPromo?: AppliedPromoCode;
  addedAt: string;
}

export interface Cart {
  id: string;
  title: string;
  ownerName: string;
  ownerEmail: string;
  items: Product[];
  appliedPromoCodes?: AppliedPromoCode[];
  createdAt: string;
  updatedAt: string;
  shareCode: string;
}

export interface MerchantDisbursement {
  merchant: string;
  merchantDomain: string;
  merchantRoutingId: string;
  merchantPayoutAccount: string;
  amount: number;
  itemCount: number;
  transferStatus: 'settled' | 'pending';
  disbursementReference: string;
  settlementNetwork: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  selectedVariant?: string;
  merchant: string;
  merchantDomain: string;
  merchantRoutingId: string;
  merchantPayoutAccount: string;
  payoutAmount: number;
  price: number;
  quantity: number;
  imageUrl: string;
  trackingNumber: string;
  carrier: string;
  fulfillmentStatus: 'Processing' | 'Dispatched to Carrier' | 'In Transit' | 'Delivered';
  estimatedDelivery: string;
  appliedPromo?: AppliedPromoCode;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentDetails {
  token: string;
  last4: string;
  cardBrand: string;
  expMonth: string;
  expYear: string;
  pciComplianceRef: string;
  authorizationCode: string;
  processedAt: string;
  isTokenizedPCICompliant: boolean;
}

export interface MerchantOrderDispatch {
  merchant: string;
  merchantDomain: string;
  retailerOrderId: string;
  dispatchProtocol: 'DIRECT_API_WEBHOOK' | 'RETAILER_RPA_BOT' | 'AFFILIATE_MERCHANT_EDI';
  dispatchedAt: string;
  warehouseLocation: string;
  httpStatus: number;
  handshakeStatus: 'CONFIRMED' | 'IN_QUEUE' | 'PROCESSING';
  itemsCount: number;
  totalDisbursed: number;
  payloadDelivered: {
    recipientName: string;
    shippingAddress: string;
    skus: Array<{ title: string; variant?: string; quantity: number; unitPrice: number }>;
    payoutRef: string;
  };
  merchantResponse: {
    ackToken: string;
    internalFulfillmentBatch: string;
    estimatedDispatchDate: string;
  };
  nativeStoreCartUrl: string;
}

export interface ReturnRefundRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  itemTitle: string;
  merchant: string;
  merchantDomain: string;
  refundAmount: number;
  reason: 'wrong_size' | 'defective' | 'changed_mind' | 'arrived_late' | 'not_as_described' | 'other';
  reasonLabel: string;
  explanation?: string;
  status: 'REQUESTED' | 'AUTHORIZED' | 'LABEL_GENERATED' | 'RETURN_IN_TRANSIT' | 'MERCHANT_INSPECTED' | 'REFUND_DISBURSED';
  rmaNumber: string;
  returnCarrier: string;
  returnTrackingNumber: string;
  labelUrl?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDisbursementDate: string;
  merchantSettlementReversalRef: string;
}

export interface RecommendedProduct {
  id: string;
  title: string;
  merchant: string;
  merchantDomain: string;
  merchantRoutingId: string;
  merchantPayoutAccount: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  description: string;
  category: string;
  reason: string;
  url: string;
}

export interface ComparisonTableRow {
  criteria: string;
  [productKey: string]: string | number;
}

export interface ComparisonData {
  columns: string[];
  productTitles: string[];
  rows: ComparisonTableRow[];
  verdictSummary?: string;
}

export interface RefundProposal {
  orderId: string;
  orderNumber: string;
  productId: string;
  itemTitle: string;
  merchant: string;
  merchantDomain: string;
  refundAmount: number;
  eligible: boolean;
  returnWindowDays: number;
  policySummary: string;
  rmaSuggested: boolean;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendedProducts?: RecommendedProduct[];
  comparisonData?: ComparisonData;
  refundProposal?: RefundProposal;
  returnRecord?: ReturnRefundRecord;
}

export interface Order {
  id: string;
  orderNumber: string;
  cartId?: string;
  createdAt: string;
  buyerEmail: string;
  buyerName: string;
  isGift: boolean;
  giftMessage?: string;
  giftReceiptOnlyToBuyer: boolean;
  cartCreatorEmail?: string;
  subtotal: number;
  promoDiscountTotal?: number;
  appliedPromoCodes?: AppliedPromoCode[];
  shippingTotal: number;
  taxTotal: number;
  totalPaid: number;
  items: OrderItem[];
  merchantDisbursements: MerchantDisbursement[];
  merchantDispatches?: MerchantOrderDispatch[];
  payment: PaymentDetails;
  shippingAddress: ShippingAddress;
  returnRecords?: ReturnRefundRecord[];
  livePriceValidation?: {
    verifiedAt: string;
    discrepanciesDetected: number;
    zeroDiscrepancyGuarantee: boolean;
    itemsAudit: any[];
  };
}

export interface PriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  merchant: string;
  currentPrice: number;
  targetPrice: number;
  email: string;
  createdAt: string;
  triggered: boolean;
  lastNotified?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  provider: 'google' | 'phone' | 'email' | 'guest' | 'apple';
  isGuest: boolean;
  createdAt: string;
}

export interface VerifiedPromoOffer {
  code: string;
  merchant: string;
  merchantDomain: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minCartSpend: number;
  description: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED';
  applicableScope: 'SPECIFIC_MERCHANT' | 'UNIVERSAL';
  badge: string;
}

