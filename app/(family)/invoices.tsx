import { useEffect } from 'react';
import { router } from 'expo-router';

export default function InvoicesRedirect() {
  useEffect(() => {
    router.replace('/(family)/subscription' as any);
  }, []);

  return null;
}
