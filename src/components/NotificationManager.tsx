import React, { useEffect, useRef } from 'react';
import { useStore, CalendarEvent, Message } from '../store/useStore';

export function NotificationManager() {
  const { events, user, subscribeToEvents, updateFCMToken, communityMessages, subscribeToCommunityMessages } = useStore();
  const prevEventsRef = useRef<CalendarEvent[]>([]);
  const prevCommunityMsgsRef = useRef<Message[]>([]);
  const appStartTimeRef = useRef<number>(Date.now());
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    if (user) {
      const unsubEvents = subscribeToEvents();
      const unsubCommunity = subscribeToCommunityMessages();
      
      // Handle FCM Token registration
      const handleTokenUpdate = async () => {
        if (!('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
          try {
            await updateFCMToken();
          } catch (err) {
            console.error("Token update failed in manager:", err);
          }
        } else if (Notification.permission === 'default' && !hasRequestedPermission.current) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await updateFCMToken();
          }
          hasRequestedPermission.current = true;
        }
      };

      handleTokenUpdate();

      return () => {
        unsubEvents();
        unsubCommunity();
      };
    }
  }, [user, subscribeToEvents, subscribeToCommunityMessages, updateFCMToken]);

  useEffect(() => {
    if (events.length === 0) {
      prevEventsRef.current = [];
      return;
    }

    if (prevEventsRef.current.length > 0) {
      const prevIds = new Set(prevEventsRef.current.map(e => e.id));
      events.forEach(event => {
        const isNew = !prevIds.has(event.id);
        const existingEvent = prevEventsRef.current.find(e => e.id === event.id);
        const isUpdated = existingEvent && (
          existingEvent.title !== event.title || 
          existingEvent.date !== event.date || 
          existingEvent.location !== event.location
        );

        if ((isNew || isUpdated) && (event.timestamp > appStartTimeRef.current || isUpdated)) {
          showNotification(`📅 ${isUpdated ? 'Atualizado' : 'Novo'} Evento`, `${event.title} - ${new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR')}`);
        }
      });
    }
    prevEventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (communityMessages.length === 0) {
      prevCommunityMsgsRef.current = [];
      return;
    }

    if (prevCommunityMsgsRef.current.length > 0) {
      const prevIds = new Set(prevCommunityMsgsRef.current.map(m => m.id));
      communityMessages.forEach(msg => {
        const isNew = !prevIds.has(msg.id);
        if (isNew && msg.senderId !== user?.id && msg.timestamp > appStartTimeRef.current) {
          showNotification(`💬 Nova mensagem: ${msg.senderName}`, msg.text || 'Imagem enviada');
        }
      });
    }
    prevCommunityMsgsRef.current = communityMessages;
  }, [communityMessages, user?.id]);

  const showNotification = (title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const options: NotificationOptions = {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'sentinela-alert'
    };

    try {
      // Background notifications are handled by the SW
      // This is for foreground fallback
      new Notification(title, options);
    } catch (e) {
      console.error('Failed to show notification', e);
    }
  };

  return null; // This component doesn't render anything
}
