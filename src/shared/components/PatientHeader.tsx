import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePatientProfile } from '../../features/profiles/application/use-profiles';
import { PremiumBadge } from './PremiumGate';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

interface PatientHeaderProps {
  onPatientPress?: () => void;
  notificationCount?: number;
  onNotificationPress?: () => void;
}

export function PatientHeader({ onPatientPress, notificationCount = 0, onNotificationPress }: PatientHeaderProps) {
  const { profile } = usePatientProfile();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.patientSection} onPress={onPatientPress} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{profile?.fullName || 'Sin familiar vinculado'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.rolePill}>
              <Feather name="heart" size={10} color={colors.primary} />
              <Text style={styles.roleText}>Familiar vinculado</Text>
            </View>
            <PremiumBadge />
          </View>
        </View>
        <Feather name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.notifButton} onPress={onNotificationPress} activeOpacity={0.7}>
        <Feather name="bell" size={22} color={colors.textPrimary} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  patientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    color: '#fff',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  roleText: {
    fontFamily,
    fontSize: 11,
    color: colors.primary,
  },
  notifButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.error,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: fontFamilyBold,
    fontSize: 10,
    color: '#fff',
  },
});
