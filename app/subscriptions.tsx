import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LoadingSpinner } from '../src/shared/components';
import { useAuthStore } from '../src/core/auth/auth-store';
import { subscriptionCheckoutStore } from '../src/core/storage/subscription-checkout-store';

export default function StripeSubscriptionReturnPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useLocalSearchParams<{ checkout?: string | string[]; session_id?: string | string[] }>();

  useEffect(() => {
    const checkout = Array.isArray(params.checkout) ? params.checkout[0] : params.checkout;
    const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;

    if (checkout === 'success' || checkout === 'cancelled') {
      subscriptionCheckoutStore.setPending({
        checkout,
        sessionId,
        createdAt: new Date().toISOString(),
      });
    }

    router.replace(accessToken ? '/(family)/subscription' as any : '/(auth)/login' as any);
  }, [accessToken, params.checkout, params.session_id]);

  return <LoadingSpinner />;
}
