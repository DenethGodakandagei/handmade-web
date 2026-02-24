import AuditLog from '../models/AuditLogModel.js';

/**
 * Records an admin action into the AuditLog collection.
 * Call this from any controller after a sensitive operation.
 */
export const recordAudit = async ({ actor, action, target, targetModel, description, metadata, req, severity }) => {
  try {
    const rawIp = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '0.0.0.0';
    const ip = rawIp.split(',')[0].replace('::ffff:', '');
    const userAgent = req?.headers?.['user-agent'] || '';

    await AuditLog.create({
      actor,
      action,
      target: target ? String(target) : null,
      targetModel: targetModel || null,
      description,
      metadata: metadata || {},
      ip,
      userAgent,
      severity: severity || 'low'
    });
  } catch (err) {
    // Never let audit logging break the main flow
    console.error('Audit log write failed:', err.message);
  }
};
