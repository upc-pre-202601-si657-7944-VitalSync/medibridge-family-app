import { create } from 'zustand';
import { paymentsApi } from '../api/services';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../../features/payments/domain/models';
import { useAuthStore } from '../auth/auth-store';
import { appStorage } from '../storage/storage';

const SUBSCRIPTION_KEY = 'subscription-data';

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

    const cached = appStorage.get(SUBSCRIPTION_KEY);
    if (cached) {
      try {
        const sub: Subscription = JSON.parse(cached);
        const isPremium = sub.status === 'ACTIVE' && sub.plan !== 'FREE';
        set({ subscription: sub, isPremium });
      } catch { /* ignore */ }
    }

    set({ isLoading: true });
    try {
      const { data } = await paymentsApi.get(`/subscriptions/users/${userId}/active`);
      if (data) {
        const sub: Subscription = data;
        const isPremium = sub.status === 'ACTIVE' && sub.plan !== 'FREE';
        appStorage.set(SUBSCRIPTION_KEY, JSON.stringify(sub));
        set({ subscription: sub, isPremium, isLoading: false });
      } else {
        set({ subscription: null, isPremium: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  refreshSubscription: async () => {
    await get().fetchSubscription();
  },

  clearSubscription: () => {
    appStorage.remove(SUBSCRIPTION_KEY);
    set({ subscription: null, isPremium: false });
  },
}));

export function isPremiumPlan(plan: SubscriptionPlan): boolean {
  return plan === 'PREMIUM' || plan === 'FAMILY';
}

export function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  return sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date();
}
