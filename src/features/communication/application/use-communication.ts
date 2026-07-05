import { useState, useCallback, useEffect } from 'react';
import { communicationApi } from '../../../core/api/services';
import { useAuthStore } from '../../../core/auth/auth-store';
import { Notification, ChatMessage, SendChatMessagePayload } from '../domain/models';
import axios from 'axios';

export function useNotifications() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!currentUser?.id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await communicationApi.get(`/notifications/recipients/${currentUser.id}`);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setNotifications([]);
    } finally { setLoading(false); }
  }, [currentUser?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;
  const unread = notifications.filter(n => n.status === 'UNREAD');

  return { notifications, unread, unreadCount, loading, error, refetch: fetch };
}

export function useMarkNotificationRead() {
  const [submitting, setSubmitting] = useState(false);

  const markRead = useCallback(async (notificationId: string): Promise<boolean> => {
    setSubmitting(true);
    try {
      await communicationApi.patch(`/notifications/${notificationId}/read`);
      return true;
    } catch { return false; }
    finally { setSubmitting(false); }
  }, []);

  return { markRead, submitting };
}

export function useChatMessages(senderUserId: number | null, recipientUserId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!senderUserId || !recipientUserId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await communicationApi.get(`/chat/messages/${senderUserId}/${recipientUserId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      setMessages([]);
    } finally { setLoading(false); }
  }, [senderUserId, recipientUserId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { messages, loading, error, refetch: fetch };
}

export function useSendMessage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (payload: SendChatMessagePayload): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await communicationApi.post('/chat/messages', payload);
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message);
      return false;
    } finally { setSubmitting(false); }
  }, []);

  return { send, submitting, error };
}
