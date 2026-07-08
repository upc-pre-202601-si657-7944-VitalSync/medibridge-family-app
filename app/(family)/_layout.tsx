import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { colors, radius } from '../../src/shared/theme';
import { DrawerContent } from '../../src/features/family/ui/drawer-content';

type FeatherName = keyof typeof Feather.glyphMap;

export default function FamilyLayout() {
  const { t } = useTranslation();

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
          headerStyle: { backgroundColor: colors.sidebar },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          drawerType: 'front',
          drawerStyle: {
            backgroundColor: colors.sidebar,
            width: 280,
          },
          drawerLabelStyle: {
            color: '#fff',
            fontSize: 14,
            marginLeft: -16,
          },
          drawerActiveTintColor: '#fff',
          drawerActiveBackgroundColor: colors.primary,
          drawerItemStyle: {
            borderRadius: radius.md,
          },
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            title: t('profiles.sidebar.dashboard'),
            drawerIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: t('profiles.sidebar.familyProfile'),
            drawerIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="patient/index"
          options={{
            title: t('profiles.sidebar.patient'),
            drawerIcon: ({ color, size }) => <Feather name="heart" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="patient/[id]"
          options={{ drawerItemStyle: { display: 'none' }, title: 'Patient Detail' }}
        />
        <Drawer.Screen
          name="doctor/index"
          options={{
            title: t('profiles.sidebar.doctor'),
            drawerIcon: ({ color, size }) => <Feather name="activity" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="doctor/[id]"
          options={{ drawerItemStyle: { display: 'none' }, title: 'Doctor Detail' }}
        />
        <Drawer.Screen
          name="care-team"
          options={{
            title: t('profiles.sidebar.careTeam'),
            drawerIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="appointments"
          options={{
            title: t('profiles.sidebar.appointments'),
            drawerIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="medication"
          options={{
            title: t('profiles.sidebar.medication'),
            drawerIcon: ({ color, size }) => <Feather name="box" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="monitoring"
          options={{
            title: t('profiles.sidebar.monitoring'),
            drawerIcon: ({ color, size }) => <Feather name="heart" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="messages"
          options={{
            title: t('profiles.sidebar.messages'),
            drawerIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="reports"
          options={{
            title: t('profiles.sidebar.reports'),
            drawerIcon: ({ color, size }) => <Feather name="file-text" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="subscription"
          options={{
            title: t('profiles.sidebar.subscription'),
            drawerIcon: ({ color, size }) => <Feather name="credit-card" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="invoices"
          options={{
            title: t('profiles.sidebar.invoices'),
            drawerIcon: ({ color, size }) => <Feather name="file" size={size} color={color} />,
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: t('profiles.sidebar.settings'),
            drawerIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
          }}
        />
      </Drawer>
  );
}
