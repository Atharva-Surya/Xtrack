import { useEffect, useState } from 'react';
import { request } from '../services/api.js';
import { realtimeSocket } from '../services/realtime.js';
import { AppDataContext } from './app-data-context.js';

function getUserId() {
  const existingId = window.localStorage.getItem('xtrack-user-id');
  if (existingId) return existingId;

  const userId = window.crypto.randomUUID();
  window.localStorage.setItem('xtrack-user-id', userId);
  return userId;
}

export function AppDataProvider({ children }) {
  const [userId] = useState(getUserId);
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [month, setMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [calendar, setCalendar] = useState(null);
  const [total, setTotal] = useState(0);
  const [rsvps, setRsvps] = useState([]);
  const [profile, setProfile] = useState({ userId, displayName: '', email: '' });
  const [reminders, setReminders] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [rsvpsLoading, setRsvpsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyEventId, setBusyEventId] = useState('');
  const [busyReminderEventId, setBusyReminderEventId] = useState('');
  const [sharingEventId, setSharingEventId] = useState('');
  const [shareCopiedEventId, setShareCopiedEventId] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    function updateFriendsAttending(update) {
      setEvents((current) => current.map((event) => (
        event.id === update.eventId ? { ...event, friendsAttending: update.friendsAttending } : event
      )));
    }

    realtimeSocket.on('friends-attending:update', updateFriendsAttending);
    realtimeSocket.connect();
    return () => {
      realtimeSocket.off('friends-attending:update', updateFriendsAttending);
      realtimeSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    realtimeSocket.emit('events:join', events.map((event) => event.id));
  }, [events]);

  useEffect(() => {
    const controller = new AbortController();
    request(`/users/${userId}/rsvps`, { signal: controller.signal })
      .then((result) => setRsvps(result.rsvps))
      .catch((error) => {
        if (error.name !== 'AbortError') setActionError(error.message);
      })
      .finally(() => setRsvpsLoading(false));
    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      request(`/users/${userId}`, { signal: controller.signal }),
      request(`/users/${userId}/reminders`, { signal: controller.signal }),
    ])
      .then(([savedProfile, savedReminders]) => {
        setProfile(savedProfile);
        setReminders(savedReminders.reminders);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setActionError(error.message);
      })
      .finally(() => setProfileLoading(false));
    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (!city) return undefined;

    const controller = new AbortController();
    const parameters = new URLSearchParams({ city, page: '0', size: '100' });
    if (month) parameters.set('month', month);
    if (keyword) parameters.set('keyword', keyword);
    if (selectedDate) parameters.set('date', selectedDate);

    request(`/events?${parameters}`, { signal: controller.signal })
      .then((result) => {
        setEvents(result.events);
        setCalendar(result.calendar);
        setTotal(result.total);
        if (!month) setMonth(result.calendar.month);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setEventsError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setEventsLoading(false);
      });

    return () => controller.abort();
  }, [city, keyword, month, selectedDate]);

  async function toggleRsvp(event) {
    setBusyEventId(event.id);
    setActionError('');
    try {
      const existing = rsvps.some((rsvp) => rsvp.eventId === event.id);
      if (existing) {
        await request(`/users/${userId}/rsvps/${encodeURIComponent(event.id)}`, { method: 'DELETE' });
        setRsvps((current) => current.filter((rsvp) => rsvp.eventId !== event.id));
      } else {
        const result = await request(`/users/${userId}/rsvps`, {
          method: 'POST',
          body: JSON.stringify({
            eventId: event.id,
            title: event.title,
            venue: event.venue,
            date: event.date,
            time: event.time,
          }),
        });
        setRsvps((current) => [...current.filter((item) => item.eventId !== event.id), result.rsvp]);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyEventId('');
    }
  }

  async function saveProfile(fields) {
    try {
      const savedProfile = await request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(fields),
      });
      setProfile(savedProfile);
      setActionError('');
      return true;
    } catch (error) {
      setActionError(error.message);
      return false;
    }
  }

  async function saveReminder(eventId, settings) {
    setBusyReminderEventId(eventId);
    setActionError('');
    try {
      const result = await request(`/users/${userId}/reminders/${encodeURIComponent(eventId)}`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setReminders((current) => [
        ...current.filter((reminder) => reminder.eventId !== eventId),
        result.reminder,
      ]);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyReminderEventId('');
    }
  }

  async function shareRsvp(eventId) {
    setSharingEventId(eventId);
    setActionError('');
    try {
      const result = await request('/share-links', {
        method: 'POST',
        body: JSON.stringify({ userId, eventId }),
      });
      await window.navigator.clipboard.writeText(result.shareUrl);
      setShareCopiedEventId(eventId);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSharingEventId('');
    }
  }

  async function sendChatMessage(message) {
    setChatMessages((current) => [...current, { role: 'user', text: message }]);
    setChatLoading(true);
    try {
      const result = await request('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, city }),
      });
      setChatMessages((current) => [...current, { role: 'assistant', ...result }]);
    } catch (error) {
      setChatMessages((current) => [...current, { role: 'assistant', reply: error.message, events: [] }]);
    } finally {
      setChatLoading(false);
    }
  }

  const value = {
    userId,
    city,
    setCity: (value) => {
      setCity(value);
      setSelectedDate(null);
      setEventsLoading(Boolean(value));
      setEventsError('');
      if (!value) {
        setEvents([]);
        setCalendar(null);
      }
    },
    keyword,
    setKeyword: (value) => {
      setKeyword(value);
      setEventsLoading(true);
      setEventsError('');
    },
    month,
    setMonth: (value) => {
      setMonth(value);
      setEventsLoading(true);
      setEventsError('');
    },
    selectedDate,
    setSelectedDate: (value) => {
      setSelectedDate(value);
      setEventsLoading(true);
      setEventsError('');
    },
    events,
    calendar,
    total,
    rsvps,
    rsvpsLoading,
    profile,
    profileLoading,
    saveProfile,
    reminders,
    saveReminder,
    busyReminderEventId,
    sharingEventId,
    shareCopiedEventId,
    shareRsvp,
    chatMessages,
    chatLoading,
    sendChatMessage,
    eventsLoading,
    eventsError,
    actionError,
    busyEventId,
    toggleRsvp,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
