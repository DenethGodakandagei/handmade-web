import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import Product from '../models/ProductModel.js';
import Review from '../models/ReviewModel.js';
import AdminNotification from '../models/AdminNotificationModel.js';
import Announcement from '../models/AnnouncementModel.js';
import { sendSuccess, ErrorResponse } from '../utils/responseUtils.js';
import { recordAudit } from '../utils/auditLogger.js';
import mongoose from 'mongoose';

// ─── GLOBAL SEARCH (for ⌘K palette) ─────────────────────

export const globalSearch = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
      return sendSuccess(res, 200, 'Search', { users: [], products: [], orders: [] });
    }

    const regex = new RegExp(q, 'i');

    const [users, products, orders] = await Promise.all([
      User.find({ $or: [{ name: regex }, { email: regex }, { studioName: regex }] })
        .select('name email role profilePicture studioName sellerRequestStatus')
        .limit(8)
        .lean(),
      Product.find({ $or: [{ name: regex }, { description: regex }] })
        .select('name price stock images artisan')
        .populate('artisan', 'name')
        .limit(8)
        .lean(),
      // Search orders by ID prefix
      q.match(/^[0-9a-fA-F]{4,}$/)
        ? Order.find({ _id: { $regex: `^${q}`, $options: 'i' } })
            .select('totalAmount status createdAt')
            .populate('user', 'name')
            .limit(5)
            .lean()
        : []
    ]);

    sendSuccess(res, 200, 'Search Results', { users, products, orders });
  } catch (error) {
    next(error);
  }
};

// ─── NOTIFICATIONS ───────────────────────────────────────

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await AdminNotification.countDocuments({ read: false });

    sendSuccess(res, 200, 'Notifications', { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    if (req.params.id === 'all') {
      await AdminNotification.updateMany({ read: false }, { read: true });
    } else {
      await AdminNotification.findByIdAndUpdate(req.params.id, { read: true });
    }
    sendSuccess(res, 200, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Utility: push a notification into the admin feed.
 * Called internally from other parts of the app.
 */
export const pushNotification = async ({ type, title, message, severity = 'info', link, metadata }) => {
  try {
    await AdminNotification.create({ type, title, message, severity, link, metadata });
  } catch (e) {
    // Non-blocking
  }
};

// ─── GEOGRAPHIC REVENUE MAP ──────────────────────────────

export const getGeoRevenue = async (req, res, next) => {
  try {
    // Revenue by country
    const byCountry = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$shippingAddress.country',
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Revenue by city
    const byCity = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { city: '$shippingAddress.city', country: '$shippingAddress.country' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 }
    ]);

    // Orders timeline by country (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const timeline = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            country: '$shippingAddress.country'
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const totalCountries = byCountry.length;
    const totalRevenue = byCountry.reduce((s, c) => s + c.revenue, 0);

    sendSuccess(res, 200, 'Geographic Revenue', {
      byCountry,
      byCity,
      timeline,
      summary: { totalCountries, totalRevenue }
    });
  } catch (error) {
    next(error);
  }
};

// ─── EXPORT / REPORT CENTER ──────────────────────────────

export const exportData = async (req, res, next) => {
  try {
    const { type } = req.params; // orders, users, products, revenue
    let data = [];
    let headers = [];

    switch (type) {
      case 'orders': {
        const orders = await Order.find()
          .populate('user', 'name email')
          .sort({ createdAt: -1 })
          .lean();
        headers = ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Country', 'City', 'Date'];
        data = orders.map(o => [
          o._id, o.user?.name, o.user?.email, o.totalAmount, o.status,
          o.shippingAddress?.country, o.shippingAddress?.city,
          new Date(o.createdAt).toISOString().split('T')[0]
        ]);
        break;
      }
      case 'users': {
        const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
        headers = ['User ID', 'Name', 'Email', 'Role', 'Seller Status', 'Studio', 'Location', 'Joined'];
        data = users.map(u => [
          u._id, u.name, u.email, u.role, u.sellerRequestStatus || 'N/A',
          u.studioName || '', u.location || '',
          new Date(u.createdAt).toISOString().split('T')[0]
        ]);
        break;
      }
      case 'products': {
        const products = await Product.find()
          .populate('artisan', 'name studioName')
          .populate('category', 'name')
          .sort({ createdAt: -1 })
          .lean();
        headers = ['Product ID', 'Name', 'Price', 'Stock', 'Category', 'Artisan', 'Studio', 'Rating', 'Created'];
        data = products.map(p => [
          p._id, p.name, p.price, p.stock, p.category?.name || '',
          p.artisan?.name || '', p.artisan?.studioName || '',
          p.averageRating || 'N/A',
          new Date(p.createdAt).toISOString().split('T')[0]
        ]);
        break;
      }
      case 'revenue': {
        const revenue = await Order.aggregate([
          { $match: { status: { $ne: 'Cancelled' } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 },
              avgOrderValue: { $avg: '$totalAmount' }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        headers = ['Date', 'Revenue', 'Orders', 'Avg Order Value'];
        data = revenue.map(r => [r._id, r.revenue.toFixed(2), r.orders, r.avgOrderValue.toFixed(2)]);
        break;
      }
      default:
        return next(new ErrorResponse('Invalid export type', 400));
    }

    // Generate CSV
    const csv = [headers.join(','), ...data.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    await recordAudit({
      actor: req.user.id,
      action: 'DATA_EXPORT',
      description: `Exported ${type} data (${data.length} rows)`,
      metadata: { type, rows: data.length },
      req,
      severity: 'medium'
    });

    sendSuccess(res, 200, 'Export Data', { csv, headers, rows: data.length, type });
  } catch (error) {
    next(error);
  }
};

// ─── USER DEEP PROFILE ───────────────────────────────────

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return next(new ErrorResponse('User not found', 404));

    // Orders
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    // Reviews
    const reviews = await Review.find({ user: req.params.id })
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Products (if artisan)
    let products = [];
    if (user.role === 'artisan') {
      products = await Product.find({ artisan: req.params.id })
        .select('name price stock images averageRating createdAt')
        .sort({ createdAt: -1 })
        .lean();
    }

    // Stats
    const totalSpent = orders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Activity timeline (combine orders + reviews)
    const timeline = [
      ...orders.map(o => ({ type: 'order', date: o.createdAt, data: { id: o._id, amount: o.totalAmount, status: o.status } })),
      ...reviews.map(r => ({ type: 'review', date: r.createdAt, data: { product: r.product?.name, rating: r.rating, title: r.title } }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Risk score: basic heuristic
    let risk = 0;
    if (orders.filter(o => o.status === 'Cancelled').length > 3) risk += 30;
    if (reviews.filter(r => r.rating <= 2).length > 2) risk += 20;
    if (!user.email.match(/^[\w.]+@[\w.]+\.[a-z]{2,}$/i)) risk += 50;
    risk = Math.min(risk, 100);
    const riskLevel = risk >= 60 ? 'high' : risk >= 30 ? 'medium' : 'low';

    sendSuccess(res, 200, 'User Profile', {
      user,
      stats: { totalSpent: totalSpent.toFixed(2), totalOrders, avgOrderValue: avgOrderValue.toFixed(2), totalReviews: reviews.length, totalProducts: products.length, riskScore: risk, riskLevel },
      orders: orders.slice(0, 20),
      reviews: reviews.slice(0, 20),
      products: products.slice(0, 20),
      timeline: timeline.slice(0, 30)
    });
  } catch (error) {
    next(error);
  }
};

// ─── CONTENT MODERATION ──────────────────────────────────

export const getModerationQueue = async (req, res, next) => {
  try {
    // Products created in last 7 days (recent products needing review)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentProducts = await Product.find({ createdAt: { $gte: sevenDaysAgo } })
      .populate('artisan', 'name email studioName')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Low-rated reviews (potential spam or inappropriate content)
    const flaggedReviews = await Review.find({ rating: { $lte: 2 } })
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // All reviews for general moderation
    const recentReviews = await Review.find({ createdAt: { $gte: sevenDaysAgo } })
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Products with no images (potential incomplete listings)
    const noImageProducts = await Product.find({ $or: [{ images: { $size: 0 } }, { images: { $exists: false } }] })
      .populate('artisan', 'name')
      .select('name price stock artisan createdAt')
      .lean();

    sendSuccess(res, 200, 'Moderation Queue', {
      recentProducts,
      flaggedReviews,
      recentReviews,
      noImageProducts,
      summary: {
        pendingProducts: recentProducts.length,
        flaggedReviews: flaggedReviews.length,
        recentReviews: recentReviews.length,
        incompleteListings: noImageProducts.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const moderateProduct = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'remove'
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorResponse('Product not found', 404));

    if (action === 'remove') {
      await Product.findByIdAndDelete(req.params.id);
      await recordAudit({
        actor: req.user.id,
        action: 'CONTENT_MODERATE',
        target: req.params.id,
        targetModel: 'Product',
        description: `Removed product "${product.name}" for policy violation`,
        req,
        severity: 'high'
      });
      return sendSuccess(res, 200, 'Product removed');
    }

    await recordAudit({
      actor: req.user.id,
      action: 'CONTENT_MODERATE',
      target: req.params.id,
      targetModel: 'Product',
      description: `Approved product "${product.name}"`,
      req,
      severity: 'low'
    });
    sendSuccess(res, 200, 'Product approved');
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const { action } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return next(new ErrorResponse('Review not found', 404));

    if (action === 'remove') {
      await Review.findByIdAndDelete(req.params.id);
      await recordAudit({
        actor: req.user.id,
        action: 'CONTENT_MODERATE',
        target: req.params.id,
        targetModel: 'Review',
        description: `Removed review "${review.title}" for policy violation`,
        req,
        severity: 'high'
      });
      return sendSuccess(res, 200, 'Review removed');
    }

    sendSuccess(res, 200, 'Review approved');
  } catch (error) {
    next(error);
  }
};

// ─── ARTISAN VERIFICATION PIPELINE ───────────────────────

export const getVerificationQueue = async (req, res, next) => {
  try {
    const pending = await User.find({ sellerRequestStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const approved = await User.find({ sellerRequestStatus: 'approved', role: 'artisan' })
      .select('name email studioName createdAt profilePicture')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const rejected = await User.find({ sellerRequestStatus: 'rejected' })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    sendSuccess(res, 200, 'Verification Queue', {
      pending,
      approved,
      rejected,
      summary: { pending: pending.length, approved: approved.length, rejected: rejected.length }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyArtisan = async (req, res, next) => {
  try {
    const { action, notes } = req.body; // 'approve' or 'reject'
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorResponse('User not found', 404));

    if (action === 'approve') {
      user.sellerRequestStatus = 'approved';
      user.role = 'artisan';
      user.isSeller = true;
      await user.save();

      await pushNotification({
        type: 'verification',
        title: 'Artisan Approved',
        message: `${user.name} has been verified as an artisan`,
        severity: 'info',
        link: `/admin/users`
      });
    } else if (action === 'reject') {
      user.sellerRequestStatus = 'rejected';
      await user.save();
    }

    await recordAudit({
      actor: req.user.id,
      action: 'ARTISAN_VERIFY',
      target: user._id,
      targetModel: 'User',
      description: `${action === 'approve' ? 'Approved' : 'Rejected'} artisan application for ${user.name}${notes ? ` — ${notes}` : ''}`,
      metadata: { action, notes },
      req,
      severity: action === 'approve' ? 'medium' : 'high'
    });

    sendSuccess(res, 200, `Artisan ${action}d`, user);
  } catch (error) {
    next(error);
  }
};

// ─── ANNOUNCEMENTS ───────────────────────────────────────

export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, 200, 'Announcements', { announcements, total: announcements.length });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, audience, priority } = req.body;
    if (!title || !body) return next(new ErrorResponse('Title and body are required', 400));

    const announcement = await Announcement.create({
      title, body, audience, priority,
      createdBy: req.user.id
    });

    // Count affected users
    let targetQuery = {};
    if (audience === 'buyers') targetQuery = { role: 'user' };
    else if (audience === 'artisans') targetQuery = { role: 'artisan' };
    const affectedCount = await User.countDocuments(targetQuery);

    await recordAudit({
      actor: req.user.id,
      action: 'BROADCAST',
      description: `Broadcast "${title}" to ${audience} (${affectedCount} users, priority: ${priority})`,
      metadata: { title, audience, priority, affectedCount },
      req,
      severity: priority === 'urgent' ? 'critical' : 'medium'
    });

    sendSuccess(res, 201, 'Announcement created', { announcement, affectedCount });
  } catch (error) {
    next(error);
  }
};

export const toggleAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return next(new ErrorResponse('Announcement not found', 404));
    ann.active = !ann.active;
    await ann.save();
    sendSuccess(res, 200, `Announcement ${ann.active ? 'activated' : 'deactivated'}`, ann);
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return next(new ErrorResponse('Announcement not found', 404));
    sendSuccess(res, 200, 'Announcement deleted');
  } catch (error) {
    next(error);
  }
};
