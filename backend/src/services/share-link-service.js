import { randomBytes } from 'node:crypto';
import { HttpError } from '../middleware/http-error.js';
import { InviteClick } from '../models/invite-click.js';
import { RSVP } from '../models/rsvp.js';
import { ShareLink } from '../models/share-link.js';

export function calculateFriendsAttending(links, clicks) {
  const linkByToken = new Map(links.map((link) => [link.token, link]));
  const friendsByEvent = new Map();

  for (const click of clicks) {
    const link = linkByToken.get(click.token);
    if (!link || link.creatorUserId === click.clickerUserId) continue;
    if (!friendsByEvent.has(link.eventId)) friendsByEvent.set(link.eventId, new Set());
    friendsByEvent.get(link.eventId).add(click.clickerUserId);
  }

  return Object.fromEntries(
    [...friendsByEvent].map(([eventId, clickers]) => [eventId, clickers.size]),
  );
}

export async function getFriendsAttendingCounts(eventIds) {
  if (eventIds.length === 0) return {};
  const links = await ShareLink.find({ eventId: { $in: eventIds } })
    .select('token eventId creatorUserId')
    .lean();
  if (links.length === 0) return {};
  const clicks = await InviteClick.find({ token: { $in: links.map((link) => link.token) } })
    .select('token clickerUserId')
    .lean();
  return calculateFriendsAttending(links, clicks);
}

export async function createShareLink(userId, eventId) {
  const rsvp = await RSVP.findOne({ userId, eventId }).lean();
  if (!rsvp) throw new HttpError(403, 'RSVP to this event before sharing it');

  const link = await ShareLink.findOneAndUpdate(
    { creatorUserId: userId, eventId },
    { $setOnInsert: { token: randomBytes(16).toString('hex'), creatorUserId: userId, eventId } },
    { new: true, upsert: true, runValidators: true },
  ).lean();
  const clientUrl = (process.env.CLIENT_URL ?? 'http://localhost:5173').replace(/\/$/, '');

  return { token: link.token, shareUrl: `${clientUrl}/?invite=${link.token}` };
}

export async function recordInviteClick(token, clickerUserId) {
  const link = await ShareLink.findOne({ token }).lean();
  if (!link) throw new HttpError(404, 'This invite link was not found');

  if (link.creatorUserId !== clickerUserId) {
    try {
      await InviteClick.updateOne(
        { token, clickerUserId },
        { $setOnInsert: { token, clickerUserId } },
        { upsert: true },
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }

  const rsvp = await RSVP.findOne({ userId: link.creatorUserId, eventId: link.eventId })
    .select('eventId eventTitle venue eventDate eventTime')
    .lean();
  const counts = await getFriendsAttendingCounts([link.eventId]);

  return {
    event: rsvp ? {
      id: rsvp.eventId,
      title: rsvp.eventTitle,
      venue: rsvp.venue,
      date: rsvp.eventDate,
      time: rsvp.eventTime,
    } : { id: link.eventId, title: 'Shared event' },
    friendsAttending: counts[link.eventId] ?? 0,
  };
}