import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js';

export const createOrder = async (orderData) => {
    // Logic extracted from controller to service not fully trivial due to product checks
    // But we can move the main orchestration here.
    // For now, let's keep the controller logic as is but move the DB operations if feasible.
    // Given the complexity of stock check interaction, a full refactor might be larger.
    // Let's implement basic methods.
    return await Order.create(orderData);
}

export const getOrderById = async (id) => {
    return await Order.findById(id).populate('user', 'name email');
}

export const getOrdersByUser = async (userId) => {
    return await Order.find({ user: userId });
}

export const getAllOrders = async (query = {}) => {
    return await Order.find(query).populate('user', 'id name');
}

export const updateOrder = async (id, updateData) => {
    return await Order.findByIdAndUpdate(id, updateData, { new: true });
}
