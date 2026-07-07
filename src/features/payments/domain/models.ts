export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'PAST_DUE';
export type SubscriptionPlanType = 'FREE' | 'FAMILY_PREMIUM' | 'INSTITUTION_BASIC' | 'INSTITUTION_PREMIUM';
export type CommercialLine = 'FAMILY' | 'INSTITUTION';
export type BillingCycle = 'MONTHLY' | 'ANNUALLY';
export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Plan {
  readonly id: number;
  readonly commercialLine: CommercialLine;
  readonly planType: SubscriptionPlanType;
  readonly billingCycle: BillingCycle;
  readonly price: number;
  readonly currency: string;
  readonly displayName: string;
  readonly maxPatients: number;
}

export interface Subscription {
  readonly id: number;
  readonly userId: number;
  readonly plan: Plan;
  readonly status: SubscriptionStatus;
  readonly stripeCustomerId: string;
  readonly startedAt: string;
  readonly currentPeriodEnd: string;
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
}

export interface CreateSubscriptionPayload {
  readonly userId: number;
  readonly commercialLine: CommercialLine;
  readonly planType: SubscriptionPlanType;
  readonly billingCycle: BillingCycle;
  readonly paymentMethodId: number;
}

export interface CreateCheckoutSessionPayload {
  readonly userId: number;
  readonly commercialLine: CommercialLine;
  readonly planType: SubscriptionPlanType;
  readonly billingCycle: BillingCycle;
}

export interface CheckoutSessionResponse {
  readonly checkoutUrl: string;
}

export interface ConfirmCheckoutSessionPayload {
  readonly sessionId: string;
}

export interface AddPaymentMethodPayload {
  readonly userId: number;
  readonly type: PaymentMethodType;
  readonly cardNumber: string;
  readonly expiryMonth: number;
  readonly expiryYear: number;
  readonly cvv: string;
}
