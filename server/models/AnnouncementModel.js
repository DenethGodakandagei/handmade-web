import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  audience: {
    type: String,
    enum: ['all', 'buyers', 'artisans'],
    default: 'all'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'urgent'],
    default: 'normal'
  },
  active: {
    type: Boolean,
    default: true
  },
  visibilityVersion: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

AnnouncementSchema.index({ active: 1, createdAt: -1 });
AnnouncementSchema.index({ audience: 1, priority: 1, active: 1, createdAt: -1 });
AnnouncementSchema.index({ title: 'text', body: 'text' });

export default mongoose.model('Announcement', AnnouncementSchema);
