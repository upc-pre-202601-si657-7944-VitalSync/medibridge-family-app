import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Badge, LoadingSpinner, EmptyState, TabBar, ChatScreen } from '../../src/shared/components';
import { profilesApi } from '../../src/core/api/services';
import { useAuthStore } from '../../src/core/auth/auth-store';
import { profilesStore } from '../../src/core/storage/profiles-store';
import { useNotifications, useMarkNotificationRead } from '../../src/features/communication/application/use-communication';
import { usePullToRefresh } from '../../src/shared/hooks/use-pull-to-refresh';
import { Notification } from '../../src/features/communication/domain/models';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../src/shared/theme';

type TabKey = 'notifications' | 'chat';
type ChatRole = 'doctor' | 'family';

interface Conversation {
  readonly userId: number;
  readonly name: string;
  readonly role: ChatRole;
  readonly description?: string;
}

interface DoctorProfile {
  readonly id: number;
  readonly userId: number;
  readonly fullName: string;
  readonly specialty?: string;
}

interface FamilyMemberProfile {
  readonly id: number;
  readonly userId: number;
  readonly fullName: string;
  readonly relationship?: string;
}

function getStoredDoctorConversation(): Conversation[] {
  const doctor = profilesStore.getReferenceDoctor();
  if (!doctor) return [];

  return [{
    userId: doctor.userId,
    name: doctor.fullName,
    role: 'doctor',
  }];
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('notifications');
  const [selectedChat, setSelectedChat] = useState<{ userId: number; name: string } | null>(null);

  const { notifications, unread, unreadCount, loading, refetch } = useNotifications();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const tabs = [
    { key: 'notifications' as TabKey, label: t('messages.tabs.notifications'), badge: unreadCount },
    { key: 'chat' as TabKey, label: t('messages.tabs.chat') },
  ];

  if (loading) return <LoadingSpinner />;

  if (selectedChat) {
    return (
      <ChatScreen
        recipientUserId={selectedChat.userId}
        recipientName={selectedChat.name}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('messages.title')}</Text>
      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={(key) => setActiveTab(key as TabKey)} />

      {activeTab === 'notifications' && (
        <NotificationsTab
          notifications={notifications}
          refreshing={refreshing}
          onRefresh={onRefresh}
          emptyMessage={t('messages.empty')}
        />
      )}
      {activeTab === 'chat' && (
        <ChatTab
          onStartChat={(userId, name) => setSelectedChat({ userId, name })}
        />
      )}
    </View>
  );
}

function NotificationsTab({ notifications, refreshing, onRefresh, emptyMessage }: {
  notifications: Notification[]; refreshing: boolean; onRefresh: () => void; emptyMessage: string;
}) {
  const { t } = useTranslation();
  const { markRead } = useMarkNotificationRead();

  const handleMarkRead = async (id: string) => {
    await markRead(id);
  };

  if (notifications.length === 0) {
    return (
      <View style={tabStyles.container}>
        <EmptyState icon="bell" message={emptyMessage} />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={tabStyles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleMarkRead(item.id)} activeOpacity={0.7}>
          <View style={[tabStyles.notifCard, item.status === 'UNREAD' && tabStyles.unreadCard]}>
            <View style={tabStyles.notifHeader}>
              <Badge label={t(`messages.type.${item.type}` as any, { defaultValue: item.type })} color="blue" />
              {item.status === 'UNREAD' && <View style={tabStyles.unreadDot} />}
            </View>
            <Text style={tabStyles.notifTitle}>{item.title}</Text>
            <Text style={tabStyles.notifBody}>{item.message}</Text>
            <Text style={tabStyles.notifDate}>
              {new Date(item.createdAt).toLocaleString('es', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {item.status === 'UNREAD' ? (
              <Text style={tabStyles.markReadHint}>{t('messages.markRead')}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

function ChatTab({ onStartChat }: { onStartChat: (userId: number, name: string) => void }) {
  const { t } = useTranslation();
  const currentUserId = useAuthStore((s) => {
    const parsed = Number(s.currentUser?.id);
    return Number.isFinite(parsed) ? parsed : null;
  });
  const [careTeamConversations, setCareTeamConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    const patientId = profilesStore.getLinkedPatientId();
    if (!patientId) {
      setCareTeamConversations(getStoredDoctorConversation());
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data } = await profilesApi.get(`/profiles/patients/${patientId}/care-team-members`);
      const doctorProfileIds = Array.isArray(data?.doctorProfileIds) ? data.doctorProfileIds : [];
      const familyMemberProfileIds = Array.isArray(data?.familyMemberProfileIds) ? data.familyMemberProfileIds : [];

      const [doctorResults, familyResults] = await Promise.all([
        Promise.allSettled(doctorProfileIds.map((id: number) => profilesApi.get(`/profiles/doctors/${id}`))),
        Promise.allSettled(familyMemberProfileIds.map((id: number) => profilesApi.get(`/profiles/family-members/${id}`))),
      ]);

      const doctorChats = doctorResults.flatMap((result): Conversation[] => {
        if (result.status !== 'fulfilled' || !result.value.data) return [];
        const doctor = result.value.data as DoctorProfile;
        return [{
          userId: doctor.userId,
          name: doctor.fullName,
          role: 'doctor',
          description: doctor.specialty,
        }];
      });

      const familyChats = familyResults.flatMap((result): Conversation[] => {
        if (result.status !== 'fulfilled' || !result.value.data) return [];
        const member = result.value.data as FamilyMemberProfile;
        if (currentUserId !== null && Number(member.userId) === currentUserId) return [];
        return [{
          userId: member.userId,
          name: member.fullName,
          role: 'family',
          description: member.relationship,
        }];
      });

      const uniqueByUserId = new Map<number, Conversation>();
      [...doctorChats, ...familyChats].forEach((conversation) => {
        if (!uniqueByUserId.has(conversation.userId)) uniqueByUserId.set(conversation.userId, conversation);
      });
      setCareTeamConversations(Array.from(uniqueByUserId.values()));
    } catch {
      setCareTeamConversations(getStoredDoctorConversation());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadConversations();
  };

  if (loading) {
    return (
      <View style={tabStyles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={tabStyles.container}>
      <FlatList
        data={careTeamConversations}
        keyExtractor={(item) => String(item.userId)}
        contentContainerStyle={tabStyles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tabStyles.conversationCard}
            onPress={() => onStartChat(item.userId, item.name)}
            activeOpacity={0.7}
          >
            <View style={tabStyles.avatar}>
              <Feather
                name={item.role === 'doctor' ? 'activity' : 'users'}
                size={20}
                color={item.role === 'doctor' ? colors.primary : '#7c3aed'}
              />
            </View>
            <View style={tabStyles.conversationInfo}>
              <Text style={tabStyles.conversationName}>{item.name}</Text>
              <Text style={tabStyles.conversationRole}>
                {item.description ?? (item.role === 'doctor' ? t('chat.doctor') : t('chat.family'))}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState icon="message-circle" message={t('chat.empty')} />
        }
      />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  notifCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: '#f8faff',
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  notifTitle: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  notifBody: {
    fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  notifDate: {
    fontFamily,
    fontSize: 12,
    color: colors.textMuted,
  },
  markReadHint: {
    fontFamily: fontFamilySemiBold,
    fontSize: 12,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  conversationRole: {
    fontFamily,
    fontSize: 13,
    color: colors.textMuted,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fontFamilyBold,
    fontSize: 24,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
