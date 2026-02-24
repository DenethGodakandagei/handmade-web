import mongoose from 'mongoose';

const FailedLoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  country: String,
  city: String,
  reason: {
    type: String,
    enum: ['invalid_credentials', 'account_not_found', 'account_locked'],
    default: 'invalid_credentials'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Auto-delete after 7 days (TTL index)
  }
});

FailedLoginSchema.index({ ip: 1 });
FailedLoginSchema.index({ email: 1 });
FailedLoginSchema.index({ createdAt: -1 });

export default mongoose.model('FailedLogin', FailedLoginSchema);
