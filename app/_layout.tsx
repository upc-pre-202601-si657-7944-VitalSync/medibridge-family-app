import 'react-native-gesture-handler';
import '../src/core/i18n';
import { Stack, Redirect, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/core/auth/auth-store';
import { profilesStore } from '../src/core/storage/profiles-store';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { colors } from '../src/shared/theme';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false }} />
      <RouteGuard />
    </>
  );
}

function RouteGuard() {
  const segments = useSegments();
  const accessToken = useAuthStore((s) => s.accessToken);
  const inAuth = segments[0] === '(auth)';
  const inSetup = segments.includes('setup');

  const setupFinished = profilesStore.isSetupFinished();

  if (!accessToken && !inAuth) {
    return <Redirect href="/(auth)/login" />;
  }

  if (accessToken && inAuth && !inSetup) {
    if (!setupFinished) {
      return <Redirect href="/(auth)/setup" />;
    }
    return <Redirect href="/(family)/dashboard" />;
  }

  if (accessToken && !inAuth && !setupFinished && !inSetup) {
    return <Redirect href="/(auth)/setup" />;
  }

  return null;
}
