export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'PAST_DUE';
export type SubscriptionPlan = 'FREE' | 'PREMIUM' | 'FAMILY';
export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Subscription {
  readonly id: number;
  readonly userId: number;
  readonly plan: SubscriptionPlan;
  readonly status: SubscriptionStatus;
  readonly startDate: string;
  readonly endDate: string;
  readonly autoRenew: boolean;
  readonly monthlyPrice: number;
  readonly currency: string;
}

export interface PaymentMethod {
  readonly id: number;
  readonly userId: number;
  readonly type: PaymentMethodType;
  readonly last4: string;
  readonly expiryMonth: number;
  readonly expiryYear: number;
  readonly isDefault: boolean;
}

export interface Invoice {
  readonly id: number;
  readonly userId: number;
  readonly subscriptionId: number;
  readonly amount: number;
  readonly currency: string;
  readonly status: InvoiceStatus;
  readonly issuedAt: string;
  readonly paidAt: string | null;
  readonly pdfUrl: string;
}

export interface CreateSubscriptionPayload {
  readonly userId: number;
  readonly plan: SubscriptionPlan;
  readonly paymentMethodId: number;
}

export interface AddPaymentMethodPayload {
  readonly userId: number;
  readonly type: PaymentMethodType;
  readonly cardNumber: string;
  readonly expiryMonth: number;
  readonly expiryYear: number;
  readonly cvv: string;
}
