import { confirmRsvp, listUserRsvps, removeRsvp } from '../services/rsvp-service.js';

export async function listRsvps(request, response, next) {
  try {
    response.json({ rsvps: await listUserRsvps(request.validated.params.userId) });
  } catch (error) {
    next(error);
  }
}

export async function createRsvp(request, response, next) {
  try {
    const rsvp = await confirmRsvp(request.validated.params.userId, request.validated.body);
    response.status(201).json({ rsvp });
  } catch (error) {
    next(error);
  }
}

export async function deleteRsvp(request, response, next) {
  try {
    await removeRsvp(request.validated.params.userId, request.validated.params.eventId);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
}