import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  eventTitle: { type: String, required: true, maxlength: 200 },
  venue: { type: String, required: true, maxlength: 200 },
  eventDate: { type: String, required: true },
  eventTime: { type: String, required: true, maxlength: 50 },
  status: { type: String, enum: ['confirmed'], default: 'confirmed', required: true },
}, { timestamps: true });

rsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });
rsvpSchema.index({ userId: 1, status: 1, eventDate: 1 });

export const RSVP = mongoose.model('RSVP', rsvpSchema);