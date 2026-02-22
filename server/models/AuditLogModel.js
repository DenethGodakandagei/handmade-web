import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_ROLE_CHANGE',
      'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE',
      'ORDER_STATUS_UPDATE', 'ORDER_DELETE',
      'CONFIG_UPDATE', 'MAINTENANCE_TOGGLE',
      'SESSION_PURGE', 'TOKEN_ROTATION',
      'INVENTORY_OVERRIDE', 'CATEGORY_CREATE', 'CATEGORY_DELETE',
      'LOGIN_SUCCESS', 'LOGIN_FAILED',
      'SYSTEM_BACKUP', 'SYSTEM_RESTORE'
    ]
  },
  target: {
    type: String, // The ID of the affected resource
    default: null
  },
  targetModel: {
    type: String, // 'User', 'Product', 'Order', etc.
    default: null
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    default: '0.0.0.0'
  },
  userAgent: {
    type: String,
    default: ''
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actor: 1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.model('AuditLog', AuditLogSchema);
