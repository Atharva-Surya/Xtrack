import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  enabled: { type: Boolean, default: true, required: true },
  minutesBefore: { type: Number, default: 1440, min: 5, max: 10080, required: true },
}, { timestamps: true });

reminderSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Reminder = mongoose.model('Reminder', reminderSchema);