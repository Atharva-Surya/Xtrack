import { Reminder } from '../models/reminder.js';

export async function listReminders(userId) {
  return Reminder.find({ userId }).sort({ updatedAt: -1 }).lean();
}

export async function saveReminder(userId, eventId, settings) {
  return Reminder.findOneAndUpdate(
    { userId, eventId },
    { $set: settings, $setOnInsert: { userId, eventId } },
    { new: true, upsert: true, runValidators: true },
  ).lean();
}