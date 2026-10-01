import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCalendar, normalizeEvent, searchEvents } from '../src/services/ticketmaster-service.js';

test('builds server-side calendar cells and event counts', () => {
  const calendar = buildCalendar('2026-10', { '2026-10-12': 2 });

  assert.equal(calendar.label, 'October 2026');
  assert.equal(calendar.leadingBlankCount, 4);
  assert.equal(calendar.days.length, 31);
  assert.equal(calendar.cells.length, 35);
  assert.equal(calendar.cells[0].date, null);
  assert.deepEqual(calendar.days[11], { date: '2026-10-12', day: 12, eventCount: 2 });
  assert.equal(calendar.previousMonth, '2026-09');
  assert.equal(calendar.nextMonth, '2026-11');
});

test('normalizes Ticketmaster event fields for cards and calendar', () => {
  const normalized = normalizeEvent({
    id: 'event-1',
    name: 'Live show',
    dates: { start: { localDate: '2026-10-12', localTime: '19:30:00' } },
    images: [{ ratio: '16_9', url: 'https://example.com/show.jpg' }],
    url: 'https://example.com/tickets',
    _embedded: { venues: [{ name: 'Main Hall', city: { name: 'London' } }] },
  });

  assert.deepEqual(normalized, {
    id: 'event-1',
    title: 'Live show',
    venue: 'Main Hall',
    city: 'London',
    date: '2026-10-12',
    time: '19:30:00',
    image: 'https://example.com/show.jpg',
    url: 'https://example.com/tickets',
  });
});

test('uses safe fallbacks when Ticketmaster omits venue and time', () => {
  const normalized = normalizeEvent({ id: 'event-2', name: 'Pop-up' });

  assert.equal(normalized.venue, 'Venue TBA');
  assert.equal(normalized.time, 'Time TBA');
  assert.equal(normalized.date, '');
});

test('date filtering keeps full-month calendar counts on the server', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.TICKETMASTER_API_KEY;
  process.env.TICKETMASTER_API_KEY = 'test-key';
  globalThis.fetch = async () => new Response(JSON.stringify({
    _embedded: { events: [
      { id: 'one', name: 'First', dates: { start: { localDate: '2026-10-12' } } },
      { id: 'two', name: 'Second', dates: { start: { localDate: '2026-10-13' } } },
    ] },
    page: { number: 0, totalElements: 2, totalPages: 1 },
  }), { status: 200 });

  try {
    const result = await searchEvents({
      city: 'Toronto', month: '2026-10', date: '2026-10-12', page: 0, size: 100,
    });
    assert.deepEqual(result.events.map((event) => event.id), ['one']);
    assert.equal(result.eventCounts['2026-10-13'], 1);
    assert.equal(result.calendar.days[12].eventCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.TICKETMASTER_API_KEY;
    else process.env.TICKETMASTER_API_KEY = originalApiKey;
  }
});