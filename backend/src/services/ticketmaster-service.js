import { HttpError } from '../middleware/http-error.js';

const API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

export function buildCalendar(month, eventCounts) {
  const [year, monthNumber] = month.split('-').map(Number);
  const firstWeekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const datePrefix = `${month}-`;
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${datePrefix}${String(day).padStart(2, '0')}`;
    return { date, day, eventCount: eventCounts[date] ?? 0 };
  });
  const previous = new Date(Date.UTC(year, monthNumber - 2, 1));
  const next = new Date(Date.UTC(year, monthNumber, 1));
  const monthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  const cells = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `blank-${index}`, date: null })),
    ...days.map((day) => ({ ...day, key: day.date })),
  ];

  return {
    month,
    label: new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(Date.UTC(year, monthNumber - 1, 1))),
    previousMonth: monthKey(previous),
    nextMonth: monthKey(next),
    leadingBlankCount: firstWeekday,
    days,
    cells,
  };
}

export function normalizeEvent(event) {
  const venue = event._embedded?.venues?.[0];
  const start = event.dates?.start;
  const image = event.images?.find((item) => item.ratio === '16_9')?.url
    ?? event.images?.[0]?.url
    ?? null;

  return {
    id: event.id,
    title: event.name,
    venue: venue?.name ?? 'Venue TBA',
    city: venue?.city?.name ?? '',
    date: start?.localDate ?? '',
    time: start?.localTime ?? 'Time TBA',
    image,
    url: event.url ?? null,
  };
}

export async function searchEvents({ city, month, keyword, date, page, size }) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey || apiKey === 'replace-me') {
    throw new HttpError(503, 'Event search is unavailable until TICKETMASTER_API_KEY is configured');
  }

  const parameters = new URLSearchParams({ apikey: apiKey, city, page: String(page), size: String(size) });
  if (keyword) parameters.set('keyword', keyword);

  const selectedMonth = month ?? new Date().toISOString().slice(0, 7);
  const [year, monthNumber] = selectedMonth.split('-').map(Number);
  const start = new Date(Date.UTC(year, monthNumber - 1, 1));
  const end = new Date(Date.UTC(year, monthNumber, 1) - 1);
  parameters.set('startDateTime', start.toISOString().replace('.000Z', 'Z'));
  parameters.set('endDateTime', end.toISOString().replace('.999Z', 'Z'));

  let response;
  try {
    response = await fetch(`${API_URL}?${parameters}`, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new HttpError(502, 'Ticketmaster could not be reached. Please try again.');
  }

  if (!response.ok) {
    throw new HttpError(502, 'Ticketmaster event search failed. Please try again.');
  }

  const data = await response.json();
  const events = (data._embedded?.events ?? []).map(normalizeEvent);
  const eventCounts = {};
  for (const event of events) {
    if (event.date) eventCounts[event.date] = (eventCounts[event.date] ?? 0) + 1;
  }
  const calendar = buildCalendar(selectedMonth, eventCounts);
  const visibleEvents = date ? events.filter((event) => event.date === date) : events;

  return {
    events: visibleEvents,
    eventCounts,
    calendar,
    total: data.page?.totalElements ?? events.length,
    page: data.page?.number ?? page,
    totalPages: data.page?.totalPages ?? 0,
  };
}