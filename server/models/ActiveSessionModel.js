import mongoose from 'mongoose';

const ActiveSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    select: false // Never expose raw tokens in API responses
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  ip: {
    type: String,
    default: '0.0.0.0'
  },
  userAgent: {
    type: String,
    default: ''
  },
  device: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto-expire after 24 hours
  }
});

ActiveSessionSchema.index({ user: 1 });
ActiveSessionSchema.index({ tokenHash: 1 });

export default mongoose.model('ActiveSession', ActiveSessionSchema);
