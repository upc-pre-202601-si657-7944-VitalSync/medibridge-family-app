import { create } from 'zustand';
import axios from 'axios';
import { paymentsApi } from '../api/services';
import { Subscription, SubscriptionPlanType } from '../../features/payments/domain/models';
import { useAuthStore } from '../auth/auth-store';
import { appStorage } from '../storage/storage';

const SUBSCRIPTION_KEY = 'subscription-data';
const LOCAL_SUBSCRIPTION_ID = 900000;

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
  storeSubscription: (subscription: Subscription) => void;
  activateLocalSubscription: (plan: {
    planType: SubscriptionPlanType;
    billingCycle: 'MONTHLY' | 'ANNUALLY';
    price: number;
    displayName: string;
  }) => void;
  cancelRemoteSubscription: (subscriptionId: number) => Promise<boolean>;
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
    let cachedSubscription: Subscription | null = null;
    const cached = appStorage.get(key);
    if (cached) {
      try {
        cachedSubscription = JSON.parse(cached);
        set({ subscription: cachedSubscription, isPremium: isPremiumSubscription(cachedSubscription) });
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
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        appStorage.remove(key);
        set({ subscription: null, isPremium: false, isLoading: false });
        return;
      }

      set({
        subscription: cachedSubscription,
        isPremium: isPremiumSubscription(cachedSubscription),
        isLoading: false,
      });
    }
  },

  refreshSubscription: async () => {
    await get().fetchSubscription();
  },

  storeSubscription: (subscription) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) return;

    appStorage.set(subscriptionKey(userId), JSON.stringify(subscription));
    set({ subscription, isPremium: isPremiumSubscription(subscription), isLoading: false });
  },

  activateLocalSubscription: (plan) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) return;

    const startedAt = new Date();
    const currentPeriodEnd = new Date(startedAt);
    if (plan.billingCycle === 'ANNUALLY') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const subscription: Subscription = {
      id: LOCAL_SUBSCRIPTION_ID,
      userId: Number(userId),
      plan: {
        id: LOCAL_SUBSCRIPTION_ID,
        commercialLine: 'FAMILY',
        planType: plan.planType,
        billingCycle: plan.billingCycle,
        price: plan.price,
        currency: 'USD',
        displayName: plan.displayName,
        maxPatients: plan.planType === 'FREE' ? 1 : 5,
      },
      status: 'ACTIVE',
      stripeCustomerId: `local-demo-user-${userId}`,
      startedAt: startedAt.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
    };

    appStorage.set(subscriptionKey(userId), JSON.stringify(subscription));
    set({ subscription, isPremium: isPremiumSubscription(subscription), isLoading: false });
  },

  cancelRemoteSubscription: async (subscriptionId) => {
    const userId = useAuthStore.getState().currentUser?.id;
    const currentSubscription = get().subscription;

    if (currentSubscription?.id === LOCAL_SUBSCRIPTION_ID
      || currentSubscription?.stripeCustomerId?.startsWith('local-demo-user-')) {
      if (userId) appStorage.remove(subscriptionKey(userId));
      set({ subscription: null, isPremium: false });
      return true;
    }

    try {
      await paymentsApi.post(`/subscriptions/${subscriptionId}/cancel`);
      if (userId) appStorage.remove(subscriptionKey(userId));
      set({ subscription: null, isPremium: false });
      return true;
    } catch {
      return false;
    }
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
