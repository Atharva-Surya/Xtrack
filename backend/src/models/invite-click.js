import mongoose from 'mongoose';

const inviteClickSchema = new mongoose.Schema({
  token: { type: String, required: true },
  clickerUserId: { type: String, required: true },
}, { timestamps: true });

inviteClickSchema.index({ token: 1, clickerUserId: 1 }, { unique: true });

export const InviteClick = mongoose.model('InviteClick', inviteClickSchema);