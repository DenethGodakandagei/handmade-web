import mongoose from 'mongoose';

const AdminNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['order', 'security', 'stock', 'user', 'system', 'review', 'verification'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  link: String,
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Auto-delete after 7 days
  }
});

AdminNotificationSchema.index({ read: 1, createdAt: -1 });

export default mongoose.model('AdminNotification', AdminNotificationSchema);
