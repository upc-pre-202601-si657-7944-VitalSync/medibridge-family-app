import { View, Text, StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerItem,
} from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { colors, spacing, fontFamilySemiBold, fontFamily } from '../../../shared/theme';
import { Logo } from '../../../shared/components';
import { useAuth } from '../../../features/iam/application/use-auth';
import { useAuthStore } from '../../../core/auth/auth-store';

type FeatherName = keyof typeof Feather.glyphMap;

interface NavItem {
  route: string;
  icon: FeatherName;
  labelKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: '/(family)/dashboard', icon: 'grid', labelKey: 'profiles.sidebar.dashboard' },
  { route: '/(family)/profile', icon: 'user', labelKey: 'profiles.sidebar.familyProfile' },
  { route: '/(family)/patient', icon: 'heart', labelKey: 'profiles.sidebar.patient' },
  { route: '/(family)/doctor', icon: 'activity', labelKey: 'profiles.sidebar.doctor' },
  { route: '/(family)/care-team', icon: 'users', labelKey: 'profiles.sidebar.careTeam' },
  { route: '/(family)/appointments', icon: 'calendar', labelKey: 'profiles.sidebar.appointments' },
  { route: '/(family)/medication', icon: 'box', labelKey: 'profiles.sidebar.medication' },
  { route: '/(family)/monitoring', icon: 'trending-up', labelKey: 'profiles.sidebar.monitoring' },
  { route: '/(family)/messages', icon: 'message-circle', labelKey: 'profiles.sidebar.messages' },
  { route: '/(family)/reports', icon: 'file-text', labelKey: 'profiles.sidebar.reports' },
  { route: '/(family)/subscription', icon: 'credit-card', labelKey: 'profiles.sidebar.subscription' },
  { route: '/(family)/invoices', icon: 'file', labelKey: 'profiles.sidebar.invoices' },
  { route: '/(family)/settings', icon: 'settings', labelKey: 'profiles.sidebar.settings' },
];

export function DrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const currentUser = useAuthStore((s) => s.currentUser);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size={56} />
        <Text style={styles.appName}>MediBridge</Text>
        {currentUser && (
          <View style={styles.userBadge}>
            <Text style={styles.userName}>{currentUser.username}</Text>
            <Text style={styles.userRole}>{t(`auth.register.roles.${currentUser.role}`)}</Text>
          </View>
        )}
      </View>

      <DrawerContentScrollView {...props} style={styles.scroll}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
          return (
            <DrawerItem
              key={item.route}
              label={t(item.labelKey)}
              icon={({ color, size }) => <Feather name={item.icon} size={size} color={color} />}
              onPress={() => {
                props.navigation.closeDrawer();
                router.push(item.route as any);
              }}
              labelStyle={[styles.itemLabel, isActive && styles.itemLabelActive]}
              style={[styles.item, isActive && styles.itemActive]}
              activeBackgroundColor={colors.primary}
              inactiveTintColor={colors.border}
              focused={isActive}
            />
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <DrawerItem
          label={t('common.logout')}
          icon={({ color, size }) => <Feather name="log-out" size={size} color={color} />}
          onPress={handleLogout}
          labelStyle={styles.logoutLabel}
          inactiveTintColor="#f87171"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sidebar },
  header: {
    paddingTop: 56,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  appName: {
    fontFamily: fontFamilySemiBold,
    fontSize: 20,
    color: '#fff',
    marginTop: spacing.md,
    letterSpacing: -0.3,
  },
  userBadge: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  userName: {
    fontFamily: fontFamilySemiBold,
    fontSize: 14,
    color: '#fff',
  },
  userRole: {
    fontFamily: fontFamily,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  scroll: { flex: 1, paddingTop: spacing.sm },
  item: { borderRadius: 10, marginHorizontal: spacing.sm, marginVertical: 1 },
  itemActive: { backgroundColor: 'rgba(37,99,235,0.18)' },
  itemLabel: { fontFamily: fontFamily, fontSize: 14, color: colors.border },
  itemLabelActive: { fontFamily: fontFamilySemiBold, color: '#fff' },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.sm,
  },
  logoutLabel: { fontFamily: fontFamilySemiBold, fontSize: 14 },
});
