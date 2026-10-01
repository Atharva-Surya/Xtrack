import assert from 'node:assert/strict';
import test from 'node:test';
import { Reminder } from '../src/models/reminder.js';
import { RSVP } from '../src/models/rsvp.js';
import { InviteClick } from '../src/models/invite-click.js';
import { ShareLink } from '../src/models/share-link.js';
import { User } from '../src/models/user.js';

function hasUniquePairIndex(model) {
  return model.schema.indexes().some(([keys, options]) => (
    keys.userId === 1 && keys.eventId === 1 && options.unique === true
  ));
}

test('RSVPs and reminders enforce one record per user and event', () => {
  assert.equal(hasUniquePairIndex(RSVP), true);
  assert.equal(hasUniquePairIndex(Reminder), true);
});

test('profile and RSVP schemas validate required persisted fields', () => {
  const validUser = new User({
    userId: 'f35c1117-3a9f-4b50-8d9c-760132eadb9f',
    email: 'person@example.com',
  });
  const validRsvp = new RSVP({
    userId: validUser.userId,
    eventId: 'event-1',
    eventTitle: 'Live show',
    venue: 'Main Hall',
    eventDate: '2026-10-12',
    eventTime: '19:30:00',
  });

  assert.equal(validUser.validateSync(), undefined);
  assert.equal(validUser.email, 'person@example.com');
  assert.equal(validRsvp.validateSync(), undefined);
  assert.ok(new RSVP().validateSync().errors.eventId);
});

test('share links and invite clicks enforce the required unique indexes', () => {
  assert.equal(ShareLink.schema.indexes().some(([keys, options]) => (
    keys.creatorUserId === 1 && keys.eventId === 1 && options.unique === true
  )), true);
  assert.equal(InviteClick.schema.indexes().some(([keys, options]) => (
    keys.token === 1 && keys.clickerUserId === 1 && options.unique === true
  )), true);
});