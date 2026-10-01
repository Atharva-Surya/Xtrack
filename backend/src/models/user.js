import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, trim: true, maxlength: 80, default: '' },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
  city: { type: String, trim: true, maxlength: 100, default: '' },
  region: { type: String, trim: true, maxlength: 100, default: '' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);