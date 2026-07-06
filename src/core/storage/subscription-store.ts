import { create } from 'zustand';
import { paymentsApi } from '../api/services';
import { Subscription, SubscriptionPlanType } from '../../features/payments/domain/models';
import { useAuthStore } from '../auth/auth-store';
import { appStorage } from '../storage/storage';

const SUBSCRIPTION_KEY = 'subscription-data';

function subscriptionKey(userId: string): string {
  return `${SUBSCRIPTION_KEY}.${userId}`;
}

function isPremiumSubscription(sub: Subscription | null): boolean {
  return sub?.status === 'ACTIVE' && sub.plan?.planType !== 'FREE';
}

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  isPremium: boolean;
  fetchSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  isLoading: false,
  isPremium: false,

  fetchSubscription: async () => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) return;

    const key = subscriptionKey(userId);
    const cached = appStorage.get(key);
    if (cached) {
      try {
        const sub: Subscription = JSON.parse(cached);
        set({ subscription: sub, isPremium: isPremiumSubscription(sub) });
      } catch { /* ignore */ }
    }

    set({ isLoading: true });
    try {
      const { data } = await paymentsApi.get(`/subscriptions/users/${userId}/active`);
      if (data) {
        const sub: Subscription = data;
        appStorage.set(key, JSON.stringify(sub));
        set({ subscription: sub, isPremium: isPremiumSubscription(sub), isLoading: false });
      } else {
        set({ subscription: null, isPremium: false, isLoading: false });
      }
    } catch {
      set({ subscription: null, isPremium: false, isLoading: false });
    }
  },

  refreshSubscription: async () => {
    await get().fetchSubscription();
  },

  clearSubscription: () => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (userId) appStorage.remove(subscriptionKey(userId));
    set({ subscription: null, isPremium: false });
  },
}));

export function isPremiumPlan(plan: SubscriptionPlanType): boolean {
  return plan !== 'FREE';
}

export function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  return sub.status === 'ACTIVE' && new Date(sub.currentPeriodEnd) > new Date();
}
