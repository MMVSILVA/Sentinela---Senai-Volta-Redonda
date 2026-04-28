import React, { useEffect, useRef } from 'react';
import { useStore, CalendarEvent } from '../store/useStore';

export function NotificationManager() {
  const { events, user, subscribeToEvents } = useStore();
  const prevEventsRef = useRef<CalendarEvent[]>([]);
  const appStartTimeRef = useRef<number>(Date.now());
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    if (user) {
      return subscribeToEvents();
    }
  }, [user, subscribeToEvents]);

  useEffect(() => {
    // Request permission on first mount if not already granted/denied
    if (!hasRequestedPermission.current && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
      hasRequestedPermission.current = true;
    }
  }, []);

  useEffect(() => {
    if (events.length === 0) {
      prevEventsRef.current = [];
      return;
    }

    // Only notify if we have a previous state to compare to (avoid notification storm on login)
    if (prevEventsRef.current.length > 0) {
      const prevIds = new Set(prevEventsRef.current.map(e => e.id));
      
      events.forEach(event => {
        // Condition 1: It's a completely new event
        const isNew = !prevIds.has(event.id);
        
        // Condition 2: It's an updated event (title, date, or location changed)
        const existingEvent = prevEventsRef.current.find(e => e.id === event.id);
        const isUpdated = existingEvent && (
          existingEvent.title !== event.title || 
          existingEvent.date !== event.date || 
          existingEvent.location !== event.location
        );

        // Only notify for events created AFTER the app started 
        // OR events that were modified while the app is open
        const isRecent = event.timestamp > appStartTimeRef.current || isUpdated;

        if ((isNew || isUpdated) && isRecent) {
          showNotification(event, isUpdated ? 'Atualizado' : 'Novo');
        }
      });
    }

    prevEventsRef.current = events;
  }, [events]);

  const showNotification = (event: CalendarEvent, type: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Don't notify the person who probably just created it (approximation)
    // In a real app we'd track creatorId, but here we can check if the user is admin
    // and if the event was just created. However, it's safer to notify everyone 
    // including the admin for confirmation.

    const title = `📅 Evento de Segurança ${type}`;
    const options: NotificationOptions = {
      body: `${event.title}\nData: ${new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR')}\nLocal: ${event.location || 'A definir'}`,
      icon: '/logo192.png', // Assuming this exists or using a default
      tag: event.id, // Group notifications for the same event
      badge: '/logo192.png'
    };

    try {
      new Notification(title, options);
    } catch (e) {
      // Fallback for some browsers or platforms
      console.error('Failed to show notification', e);
    }
  };

  return null; // This component doesn't render anything
}
