import { createShareLink, recordInviteClick } from '../services/share-link-service.js';
import { emitFriendsAttending } from '../sockets/realtime.js';

export async function createLink(request, response, next) {
  try {
    const { userId, eventId } = request.validated.body;
    response.status(201).json(await createShareLink(userId, eventId));
  } catch (error) {
    next(error);
  }
}

export async function openLink(request, response, next) {
  try {
    const { token } = request.validated.params;
    const { userId } = request.validated.query;
    const result = await recordInviteClick(token, userId);
    emitFriendsAttending(result.event.id, result.friendsAttending);
    response.json(result);
  } catch (error) {
    next(error);
  }
}