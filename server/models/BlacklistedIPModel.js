import mongoose from 'mongoose';

const BlacklistedIPSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  reason: {
    type: String,
    default: 'Manual block by administrator'
  },
  blockedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  autoBlocked: {
    type: Boolean,
    default: false
  },
  country: String,
  isp: String,
  hitCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('BlacklistedIP', BlacklistedIPSchema);
