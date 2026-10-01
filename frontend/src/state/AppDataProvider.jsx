import { useEffect, useState } from 'react';
import { request } from '../services/api.js';
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
  const [eventsLoading, setEventsLoading] = useState(false);
  const [rsvpsLoading, setRsvpsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyEventId, setBusyEventId] = useState('');

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
    eventsLoading,
    eventsError,
    actionError,
    busyEventId,
    toggleRsvp,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
