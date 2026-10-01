import assert from 'node:assert/strict';
import test from 'node:test';
import { respondToChat } from '../src/services/chat-service.js';

test('chat asks for a city before searching events', async () => {
  assert.deepEqual(await respondToChat({ message: 'jazz', city: '' }), {
    reply: 'Choose a city first and I can look for matching events.',
    events: [],
  });
});

test('chat searches Ticketmaster and returns matching events', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.TICKETMASTER_API_KEY;
  process.env.TICKETMASTER_API_KEY = 'test-key';
  globalThis.fetch = async (url) => {
    assert.match(String(url), /keyword=jazz/);
    return new Response(JSON.stringify({
      _embedded: { events: [{
        id: 'jazz-1',
        name: 'Jazz night',
        dates: { start: { localDate: '2026-10-12' } },
        _embedded: { venues: [{ name: 'Blue Room' }] },
      }] },
      page: { totalElements: 1 },
    }), { status: 200 });
  };

  try {
    const response = await respondToChat({ message: 'jazz', city: 'Toronto' }, async () => ({}));
    assert.equal(response.events[0].title, 'Jazz night');
    assert.match(response.reply, /Toronto/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.TICKETMASTER_API_KEY;
    else process.env.TICKETMASTER_API_KEY = originalApiKey;
  }
});