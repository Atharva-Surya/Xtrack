import { getProfile, saveProfile } from '../services/user-service.js';

export async function readProfile(request, response, next) {
  try {
    response.json(await getProfile(request.validated.params.userId));
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(request, response, next) {
  try {
    response.json(await saveProfile(request.validated.params.userId, request.validated.body));
  } catch (error) {
    next(error);
  }
}