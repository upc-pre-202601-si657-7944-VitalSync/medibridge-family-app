import { appStorage } from './storage';

const PENDING_CHECKOUT_KEY = 'subscription-pending-checkout';

export interface PendingSubscriptionCheckout {
  readonly checkout: 'success' | 'cancelled';
  readonly sessionId?: string;
  readonly createdAt: string;
}

function parsePendingCheckout(raw: string | undefined): PendingSubscriptionCheckout | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PendingSubscriptionCheckout>;
    if (parsed.checkout !== 'success' && parsed.checkout !== 'cancelled') return null;

    return {
      checkout: parsed.checkout,
      sessionId: typeof parsed.sessionId === 'string' ? parsed.sessionId : undefined,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export const subscriptionCheckoutStore = {
  getPending(): PendingSubscriptionCheckout | null {
    return parsePendingCheckout(appStorage.get(PENDING_CHECKOUT_KEY));
  },
  setPending(checkout: PendingSubscriptionCheckout): void {
    appStorage.set(PENDING_CHECKOUT_KEY, JSON.stringify(checkout));
  },
  clearPending(): void {
    appStorage.remove(PENDING_CHECKOUT_KEY);
  },
};
