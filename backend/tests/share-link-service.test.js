import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateFriendsAttending } from '../src/services/share-link-service.js';

test('counts unique event invite clickers once and excludes link creators', () => {
  const links = [
    { token: 'first', eventId: 'event-a', creatorUserId: 'creator-a' },
    { token: 'second', eventId: 'event-a', creatorUserId: 'creator-b' },
    { token: 'other', eventId: 'event-b', creatorUserId: 'creator-a' },
  ];
  const clicks = [
    { token: 'first', clickerUserId: 'friend-1' },
    { token: 'second', clickerUserId: 'friend-1' },
    { token: 'first', clickerUserId: 'friend-2' },
    { token: 'first', clickerUserId: 'creator-a' },
    { token: 'second', clickerUserId: 'creator-b' },
  ];

  assert.deepEqual(calculateFriendsAttending(links, clicks), { 'event-a': 2 });
});