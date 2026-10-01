import { searchEvents } from '../services/ticketmaster-service.js';
import { getFriendsAttendingCounts } from '../services/share-link-service.js';

export async function listEvents(request, response, next) {
  try {
    const result = await searchEvents(request.validated.query);
    const friendsAttending = await getFriendsAttendingCounts(result.events.map((event) => event.id));
    result.events = result.events.map((event) => ({
      ...event,
      friendsAttending: friendsAttending[event.id] ?? 0,
    }));
    response.json(result);
  } catch (error) {
    next(error);
  }
}