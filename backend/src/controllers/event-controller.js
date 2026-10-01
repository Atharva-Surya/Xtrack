import { searchEvents } from '../services/ticketmaster-service.js';

export async function listEvents(request, response, next) {
  try {
    const result = await searchEvents(request.validated.query);
    response.json(result);
  } catch (error) {
    next(error);
  }
}