import { createShareLink, recordInviteClick } from '../services/share-link-service.js';

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
    response.json(await recordInviteClick(token, userId));
  } catch (error) {
    next(error);
  }
}