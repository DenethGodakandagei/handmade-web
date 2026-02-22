import mongoose from 'mongoose';

const PlatformConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'maintenance_mode',
      'signup_freeze',
      'commission_rate',
      'default_currency',
      'max_upload_size_mb',
      'allow_reviews',
      'allow_customizations',
      'allow_preorders'
    ]
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['boolean', 'number', 'string'],
    default: 'string'
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PlatformConfig', PlatformConfigSchema);
