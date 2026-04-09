import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as orderService from '../services/orderService.js';
import Product from '../models/ProductModel.js';
import CustomizationRequest from '../models/CustomizationRequestModel.js';
import { allowedCountries } from '../utils/allowedCountries.js';

// @desc      Create new order
// @route     POST /api/v1/orders
// @access    Private (Buyer)
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod
    } = req.body;

    // Validate Country
    if (shippingAddress && shippingAddress.country) {
      if (!allowedCountries.has(shippingAddress.country)) {
        return next(new ErrorResponse(`Shipping to ${shippingAddress.country} is not currently supported.`, 400));
      }
    }

    if (orderItems && orderItems.length === 0) {
      return next(new ErrorResponse('No order items', 400));
    }

    // Verify products and calculate prices dynamically
    // Optimized for scale: Fetch all products in one parallel query
    const productIds = orderItems.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // Create a map for O(1) fast lookup
    const productMap = new Map();
    products.forEach(p => productMap.set(p._id.toString(), p));

    let totalAmount = 0;
    let isPreOrderOrder = false;
    const finalOrderItems = [];
    const productsToUpdate = [];

    // Process items in memory
    for (const item of orderItems) {
      const product = productMap.get(item.product);

      if (!product) {
        return next(new ErrorResponse(`Product not found with id ${item.product}`, 404));
      }

      let itemPrice = product.price;

      if (item.customizationRequest) {
        const customReq = await CustomizationRequest.findById(item.customizationRequest);
        if (customReq && customReq.status === 'Accepted' && customReq.price) {
          itemPrice = customReq.price;
          customReq.isPaid = true;
          await customReq.save();
        } else {
          return next(new ErrorResponse(`Customization request invalid, unauthorized, or not accepted.`, 400));
        }
      } else {
        // Check stock for standard physical purchases only
        if (product.stock < item.quantity) {
          if (product.isPreOrder) {
            if (req.preordersAllowed === false) {
              return next(new ErrorResponse(`Pre-orders are currently disabled by the platform administrator. Product "${product.name}" is out of stock.`, 403));
            }
            isPreOrderOrder = true;
          } else {
            return next(new ErrorResponse(`Product ${product.name} is out of stock`, 400));
          }
        } else {
          // Mark logic for update (Verified in memory)
          product.stock -= item.quantity;
          productsToUpdate.push(product);
        }
      }

      finalOrderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        image: product.images[0],
        customizations: item.customizations || [],
        customizationRequest: item.customizationRequest || null,
        notes: item.notes || '',
        designImage: item.designImage || null
      });

      totalAmount += itemPrice * item.quantity;
    }

    // Perform all DB writes in parallel (Non-blocking)
    await Promise.all(productsToUpdate.map(p => p.save()));

    const order = await orderService.createOrder({
      user: req.user.id,
      products: finalOrderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      isPreOrder: isPreOrderOrder
    });

    sendSuccess(res, 201, 'Order created', order);
  } catch (err) {
    next(err);
  }
};

// @desc      Get order by ID
// @route     GET /api/v1/orders/:id
// @access    Private
export const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Check permissions (admin or order owner)
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to view this order', 403));
    }

    sendSuccess(res, 200, 'Order details', order);
  } catch (err) {
    next(err);
  }
};

// @desc      Get logged in user orders
// @route     GET /api/v1/orders/myorders
// @access    Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
    sendSuccess(res, 200, 'My orders', orders);
  } catch (err) {
    next(err);
  }
};

// @desc      Get all orders
// @route     GET /api/v1/orders
// @access    Private/Admin/Artisan (Artisan should only see orders with their products?)
export const getOrders = async (req, res, next) => {
  try {
    let query = {};

    // If artisan, filter orders containing their products?
    // This is complex as an order can have multiple artisans' products.
    // For MVP, allow Admin to see all.
    // Enhanced: allow Artisan to see order ITEMS related to them.
    // For now, simpler implementation: Admin sees all.

    if (req.user.role === 'artisan') {
      // Find orders where 'products.product' refers to a product owned by this artisan.
      // This requires aggregation or finding products first.
      const myProducts = await Product.find({ artisan: req.user.id }).select('_id');
      const myProductIds = myProducts.map(p => p._id);

      query = { 'products.product': { $in: myProductIds } };
    } else if (req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const orders = await orderService.getAllOrders(query);
    sendSuccess(res, 200, 'All orders', orders);
  } catch (err) {
    next(err);
  }
};

// @desc      Update order status
// @route     PUT /api/v1/orders/:id/status
// @access    Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    let order = await orderService.getOrderById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    const status = req.body.status || order.status;
    const deliveredAt = req.body.status === 'Delivered' ? Date.now() : undefined;

    const updateData = { status };
    if (deliveredAt) updateData.deliveredAt = deliveredAt;

    order = await orderService.updateOrder(req.params.id, updateData);

    sendSuccess(res, 200, 'Order updated', order);
  } catch (err) {
    next(err);
  }
};

// @desc      Delete order
// @route     DELETE /api/v1/orders/:id
// @access    Private/Admin
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Check permissions (admin only for hard delete usually, or user if pending?)
    // In this context, let's allow Admin for all, and User only if they own it and it's Pending.
    if (req.user.role !== 'admin' && (order.user._id.toString() !== req.user.id || order.status !== 'Pending')) {
      return next(new ErrorResponse('Not authorized to delete this order', 403));
    }

    // Restore stock and revert customization status if it was subtracted/marked and order not delivered/cancelled
    if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
      const restorationPromises = order.products.map(async (item) => {
        // Restore product stock
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }

        // Revert CustomizationRequest "isPaid" status
        if (item.customizationRequest) {
          const customReq = await CustomizationRequest.findById(item.customizationRequest);
          if (customReq) {
            customReq.isPaid = false;
            await customReq.save();
          }
        }
      });
      await Promise.all(restorationPromises);
    }

    await orderService.deleteOrder(req.params.id);

    sendSuccess(res, 200, 'Order deleted', {});
  } catch (err) {
    next(err);
  }
};
