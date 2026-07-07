import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/core/auth/auth-store';
import { profilesStore } from '../src/core/storage/profiles-store';

export default function IndexPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setupFinished = profilesStore.isSetupFinished();

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!setupFinished) {
    return <Redirect href="/(auth)/setup" />;
  }

  return <Redirect href="/(family)/dashboard" />;
}
