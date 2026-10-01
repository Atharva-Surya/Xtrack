import { HttpError } from './http-error.js';

export function validate(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      return next(new HttpError(400, result.error.issues[0]?.message ?? 'Invalid request'));
    }

    request.validated = result.data;
    next();
  };
}