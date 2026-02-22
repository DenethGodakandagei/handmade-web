import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import Product from '../models/ProductModel.js';
import AuditLog from '../models/AuditLogModel.js';
import PlatformConfig from '../models/PlatformConfigModel.js';
import { sendSuccess, ErrorResponse } from '../utils/responseUtils.js';
import { recordAudit } from '../utils/auditLogger.js';
import { invalidateConfigCache } from '../middleware/platformGates.js';
import mongoose from 'mongoose';

// ─── ANALYTICS ───────────────────────────────────────────

/**
 * @desc    Get deep analytics (revenue trends, user growth, order velocity)
 * @route   GET /api/v1/admin/analytics
 * @access  Private/Admin
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Revenue by day (last 30 days)
    const revenueByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Previous 30 day revenue for comparison
    const prevRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const currentRevenue = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
    const currentOrders = revenueByDay.reduce((sum, d) => sum + d.orders, 0);
    const previousRevenue = prevRevenue[0]?.total || 0;
    const previousOrders = prevRevenue[0]?.count || 0;

    const revenueGrowth = previousRevenue > 0 ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : 0;
    const orderGrowth = previousOrders > 0 ? (((currentOrders - previousOrders) / previousOrders) * 100).toFixed(1) : 0;

    // User growth (last 30 days)
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const totalUsers = await User.countDocuments();
    const prevNewUsers = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const userGrowth = prevNewUsers > 0 ? (((newUsers - prevNewUsers) / prevNewUsers) * 100).toFixed(1) : 0;

    // Top performing products
    const topProducts = await Order.aggregate([
      { $unwind: '$products' },
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$products.product',
          name: { $first: '$products.name' },
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Top artisans by revenue
    const topArtisans = await Order.aggregate([
      { $unwind: '$products' },
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.artisan',
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          totalSold: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'artisan'
        }
      },
      { $unwind: '$artisan' },
      {
        $project: {
          name: '$artisan.name',
          studioName: '$artisan.studioName',
          totalRevenue: 1,
          totalSold: 1
        }
      }
    ]);

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average order value
    const avgOrderValue = currentOrders > 0 ? (currentRevenue / currentOrders).toFixed(2) : 0;

    sendSuccess(res, 200, 'Analytics Dashboard', {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: Number(revenueGrowth),
        byDay: revenueByDay
      },
      orders: {
        current: currentOrders,
        previous: previousOrders,
        growth: Number(orderGrowth),
        avgValue: Number(avgOrderValue),
        statusBreakdown
      },
      users: {
        total: totalUsers,
        newThisMonth: newUsers,
        growth: Number(userGrowth)
      },
      topProducts,
      topArtisans
    });
  } catch (error) {
    next(error);
  }
};

// ─── TRANSACTIONS ────────────────────────────────────────

/**
 * @desc    Get all transactions (orders with payment details)
 * @route   GET /api/v1/admin/transactions
 * @access  Private/Admin
 */
export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status) query.status = status;

    const [transactions, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    // Compute aggregated totals
    const totals = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    sendSuccess(res, 200, 'Transactions Ledger', {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: totals[0] || { totalRevenue: 0, avgOrderValue: 0, totalOrders: 0 }
    });
  } catch (error) {
    next(error);
  }
};

// ─── INVENTORY ───────────────────────────────────────────

/**
 * @desc    Get full inventory status with stock alerts
 * @route   GET /api/v1/admin/inventory
 * @access  Private/Admin
 */
export const getInventory = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('artisan', 'name studioName')
      .populate('category', 'name')
      .sort({ stock: 1 })
      .lean();

    const outOfStock = products.filter(p => p.stock === 0 && !p.isPreOrder);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
    const healthy = products.filter(p => p.stock > 5);
    const preOrder = products.filter(p => p.isPreOrder);

    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);

    sendSuccess(res, 200, 'Inventory Report', {
      products,
      alerts: {
        outOfStock: outOfStock.length,
        lowStock: lowStock.length,
        healthy: healthy.length,
        preOrder: preOrder.length
      },
      totals: {
        totalProducts: products.length,
        totalUnits,
        totalValue: totalValue.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Override stock for a product
 * @route   PUT /api/v1/admin/inventory/:id
 * @access  Private/Admin
 */
export const updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return next(new ErrorResponse('Invalid stock value', 400));
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    await recordAudit({
      actor: req.user.id,
      action: 'INVENTORY_OVERRIDE',
      target: product._id,
      targetModel: 'Product',
      description: `Stock override on "${product.name}" to ${stock} units`,
      metadata: { previousStock: product.stock, newStock: stock },
      req,
      severity: 'medium'
    });

    sendSuccess(res, 200, 'Stock updated', product);
  } catch (error) {
    next(error);
  }
};

// ─── PLATFORM CONFIG ─────────────────────────────────────

/**
 * @desc    Get all platform configuration flags
 * @route   GET /api/v1/admin/config
 * @access  Private/Admin
 */
export const getConfig = async (req, res, next) => {
  try {
    let configs = await PlatformConfig.find().populate('updatedBy', 'name email').lean();

    // If no configs exist yet, seed defaults
    if (configs.length === 0) {
      const defaults = [
        { key: 'maintenance_mode', value: false, label: 'Maintenance Mode', description: 'Locks all non-admin routes and displays a maintenance screen', type: 'boolean' },
        { key: 'signup_freeze', value: false, label: 'Signup Freeze', description: 'Blocks new user and artisan registrations', type: 'boolean' },
        { key: 'commission_rate', value: 10, label: 'Platform Commission (%)', description: 'Percentage fee deducted from artisan sales', type: 'number' },
        { key: 'default_currency', value: 'USD', label: 'Default Currency', description: 'Base currency for all transactions', type: 'string' },
        { key: 'max_upload_size_mb', value: 10, label: 'Max Upload Size (MB)', description: 'Maximum file upload size for images and media', type: 'number' },
        { key: 'allow_reviews', value: true, label: 'Allow Reviews', description: 'Enable or disable product reviews globally', type: 'boolean' },
        { key: 'allow_customizations', value: true, label: 'Allow Customizations', description: 'Enable or disable customization requests', type: 'boolean' },
        { key: 'allow_preorders', value: true, label: 'Allow Pre-Orders', description: 'Enable or disable pre-order purchases', type: 'boolean' }
      ];
      configs = await PlatformConfig.insertMany(defaults);
    }

    sendSuccess(res, 200, 'Platform Configuration', configs);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a platform configuration value
 * @route   PUT /api/v1/admin/config/:key
 * @access  Private/Admin
 */
export const updateConfig = async (req, res, next) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return next(new ErrorResponse('Value is required', 400));
    }

    const config = await PlatformConfig.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedBy: req.user.id, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!config) {
      return next(new ErrorResponse(`Config key "${req.params.key}" not found`, 404));
    }

    await recordAudit({
      actor: req.user.id,
      action: 'CONFIG_UPDATE',
      target: config._id,
      targetModel: 'PlatformConfig',
      description: `Updated "${config.label}" to ${JSON.stringify(value)}`,
      metadata: { key: req.params.key, newValue: value },
      req,
      severity: req.params.key === 'maintenance_mode' ? 'critical' : 'high'
    });

    // Instantly invalidate the in-memory config cache
    invalidateConfigCache();

    sendSuccess(res, 200, 'Configuration updated', config);
  } catch (error) {
    next(error);
  }
};

// ─── AUDIT TRAIL ─────────────────────────────────────────

/**
 * @desc    Get full admin audit trail
 * @route   GET /api/v1/admin/audit
 * @access  Private/Admin
 */
export const getAuditTrail = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const severity = req.query.severity;
    const action = req.query.action;

    const query = {};
    if (severity) query.severity = severity;
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    // Severity distribution
    const severityDist = await AuditLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Action distribution
    const actionDist = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    sendSuccess(res, 200, 'Audit Trail', {
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      distributions: { severity: severityDist, actions: actionDist }
    });
  } catch (error) {
    next(error);
  }
};
