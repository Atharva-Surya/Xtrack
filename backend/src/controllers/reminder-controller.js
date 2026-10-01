import { listReminders, saveReminder } from '../services/reminder-service.js';

export async function listUserReminders(request, response, next) {
  try {
    response.json({ reminders: await listReminders(request.validated.params.userId) });
  } catch (error) {
    next(error);
  }
}

export async function updateReminder(request, response, next) {
  try {
    const { userId, eventId } = request.validated.params;
    response.json({ reminder: await saveReminder(userId, eventId, request.validated.body) });
  } catch (error) {
    next(error);
  }
}