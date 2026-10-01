import mongoose from 'mongoose';

const shareLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  eventId: { type: String, required: true },
  creatorUserId: { type: String, required: true },
}, { timestamps: true });

shareLinkSchema.index({ creatorUserId: 1, eventId: 1 }, { unique: true });
shareLinkSchema.index({ eventId: 1 });

export const ShareLink = mongoose.model('ShareLink', shareLinkSchema);