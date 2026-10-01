import { User } from '../models/user.js';

export async function getProfile(userId) {
  const user = await User.findOne({ userId }).lean();
  return user ?? { userId, displayName: '', city: '', region: '' };
}

export async function saveProfile(userId, profile) {
  return User.findOneAndUpdate(
    { userId },
    { $set: profile, $setOnInsert: { userId } },
    { new: true, upsert: true, runValidators: true },
  ).lean();
}