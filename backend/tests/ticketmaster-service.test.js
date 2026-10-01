import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEvent } from '../src/services/ticketmaster-service.js';

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