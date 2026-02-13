import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as orderService from '../services/orderService.js';
import Product from '../models/ProductModel.js';

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

    if (orderItems && orderItems.length === 0) {
      return next(new ErrorResponse('No order items', 400));
    }

    // Verify products and calculate prices dynamically
    let totalAmount = 0;
    let isPreOrderOrder = false;
    const finalOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
         return next(new ErrorResponse(`Product not found with id ${item.product}`, 404));
      }
      
      // Check stock
      if (product.stock < item.quantity) {
        if (product.isPreOrder) {
            isPreOrderOrder = true;
        } else {
             return next(new ErrorResponse(`Product ${product.name} is out of stock`, 400));
        }
      } else {
         // Decrement stock for normal items
         product.stock = product.stock - item.quantity;
         await product.save();
      }

      finalOrderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images[0] // Add image reference for convenience
      });

      totalAmount += product.price * item.quantity;
    }

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
