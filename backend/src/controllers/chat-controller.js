import { respondToChat } from '../services/chat-service.js';

export async function chat(request, response, next) {
  try {
    response.json(await respondToChat(request.validated.body));
  } catch (error) {
    next(error);
  }
}