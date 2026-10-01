import { RSVP } from '../models/rsvp.js';

export async function listUserRsvps(userId) {
  return RSVP.find({ userId, status: 'confirmed' }).sort({ eventDate: 1 }).lean();
}

export async function confirmRsvp(userId, event) {
  return RSVP.findOneAndUpdate(
    { userId, eventId: event.eventId },
    {
      $set: {
        eventTitle: event.title,
        venue: event.venue,
        eventDate: event.date,
        eventTime: event.time,
        status: 'confirmed',
      },
      $setOnInsert: { userId, eventId: event.eventId },
    },
    { new: true, upsert: true, runValidators: true },
  ).lean();
}

export async function removeRsvp(userId, eventId) {
  await RSVP.deleteOne({ userId, eventId });
}