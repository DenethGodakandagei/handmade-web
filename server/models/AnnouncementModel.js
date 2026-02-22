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
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

AnnouncementSchema.index({ active: 1, createdAt: -1 });

export default mongoose.model('Announcement', AnnouncementSchema);
