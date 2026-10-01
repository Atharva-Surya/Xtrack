import { HttpError } from './http-error.js';

export function errorHandler(error, _request, response, _next) {
  const status = error instanceof HttpError ? error.status : 500;
  const message = status === 500 ? 'An unexpected server error occurred' : error.message;

  if (status === 500) console.error(error);
  response.status(status).json({ error: message });
}