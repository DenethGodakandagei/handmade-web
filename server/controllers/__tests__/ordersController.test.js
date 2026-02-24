import { jest } from '@jest/globals';

jest.unstable_mockModule('../../utils/responseUtils.js', () => ({
    sendSuccess: jest.fn(),
    ErrorResponse: class ErrorResponse extends Error {
        constructor(message, statusCode) {
            super(message);
            this.statusCode = statusCode;
        }
    },
}));

jest.unstable_mockModule('../../services/orderService.js', () => ({
    createOrder: jest.fn(),
    getOrderById: jest.fn(),
    getOrdersByUser: jest.fn(),
    getAllOrders: jest.fn(),
    updateOrder: jest.fn(),
}));

jest.unstable_mockModule('../../models/ProductModel.js', () => ({
    default: {
        find: jest.fn(),
    },
}));

jest.unstable_mockModule('../../models/CustomizationRequestModel.js', () => ({
    default: {
        findById: jest.fn(),
    },
}));

jest.unstable_mockModule('../../utils/allowedCountries.js', () => ({
    allowedCountries: new Set(['US', 'CA']),
}));

const { createOrder, getOrder, getMyOrders, getOrders, updateOrderStatus } = await import('../ordersController.js');
const orderService = await import('../../services/orderService.js');
const responseUtils = await import('../../utils/responseUtils.js');
const Product = (await import('../../models/ProductModel.js')).default;
const CustomizationRequest = (await import('../../models/CustomizationRequestModel.js')).default;

describe('ordersController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {}, user: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should calculate total dynamically and create an order with physical items', async () => {
            req.user = { id: 'buyerId' };
            req.body = {
                shippingAddress: { country: 'US' },
                orderItems: [{ product: 'p1', quantity: 2 }],
                paymentMethod: 'CreditCard'
            };

            const product = { _id: 'p1', name: 'Mug', price: 15, stock: 10, images: ['img.jpg'], save: jest.fn().mockResolvedValue() };
            Product.find.mockResolvedValue([product]);
            orderService.createOrder.mockResolvedValue({ id: 'o1', totalAmount: 30 });

            await createOrder(req, res, next);

            expect(Product.find).toHaveBeenCalledWith({ _id: { $in: ['p1'] } });
            expect(orderService.createOrder).toHaveBeenCalledWith(expect.objectContaining({
                user: 'buyerId',
                paymentMethod: 'CreditCard',
                totalAmount: 30,
                isPreOrder: false
            }));
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 201, 'Order created', { id: 'o1', totalAmount: 30 });
            expect(product.stock).toBe(8);
            expect(product.save).toHaveBeenCalled();
        });

        it('should fail if country is unsupported', async () => {
            req.body = { shippingAddress: { country: 'LK' } };
            await createOrder(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Shipping to LK is not currently supported.');
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });

        it('should fail if no order items', async () => {
            req.body = { shippingAddress: { country: 'US' }, orderItems: [] };
            await createOrder(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('No order items');
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });

        it('should fail if a product is not found', async () => {
            req.body = { shippingAddress: { country: 'US' }, orderItems: [{ product: 'p1', quantity: 2 }] };
            Product.find.mockResolvedValue([]);

            await createOrder(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Product not found with id p1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

        it('should override price using customization request when accepted', async () => {
            req.user = { id: 'buyerId' };
            req.body = {
                shippingAddress: { country: 'US' },
                orderItems: [{ product: 'p1', quantity: 1, customizationRequest: 'c1' }],
                paymentMethod: 'CreditCard'
            };

            const product = { _id: 'p1', name: 'Mug', price: 15, stock: 10, images: ['img.jpg'], save: jest.fn().mockResolvedValue() };
            Product.find.mockResolvedValue([product]);

            const customReq = { _id: 'c1', status: 'Accepted', price: 50, isPaid: false, save: jest.fn().mockResolvedValue() };
            CustomizationRequest.findById.mockResolvedValue(customReq);

            orderService.createOrder.mockResolvedValue({ id: 'o1', totalAmount: 50 });

            await createOrder(req, res, next);

            expect(CustomizationRequest.findById).toHaveBeenCalledWith('c1');
            expect(customReq.isPaid).toBe(true);
            expect(customReq.save).toHaveBeenCalled();
            expect(orderService.createOrder).toHaveBeenCalledWith(expect.objectContaining({ totalAmount: 50 }));
        });

        it('should fail if customization request is not accepted', async () => {
            req.user = { id: 'buyerId' };
            req.body = {
                shippingAddress: { country: 'US' },
                orderItems: [{ product: 'p1', quantity: 1, customizationRequest: 'c1' }],
            };

            const product = { _id: 'p1', name: 'Mug', price: 15, stock: 10, images: ['img.jpg'] };
            Product.find.mockResolvedValue([product]);

            const customReq = { _id: 'c1', status: 'Pending', price: 50 };
            CustomizationRequest.findById.mockResolvedValue(customReq);

            await createOrder(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Customization request invalid, unauthorized, or not accepted.');
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });

        it('should fail if product out of stock', async () => {
            req.body = { shippingAddress: { country: 'US' }, orderItems: [{ product: 'p1', quantity: 10 }] };
            const product = { _id: 'p1', name: 'Mug', stock: 5, price: 10, images: [] };
            Product.find.mockResolvedValue([product]);

            await createOrder(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Product Mug is out of stock');
        });
    });

    describe('getOrder', () => {
        it('should get order if authorized (owner)', async () => {
            req.params.id = 'o1';
            req.user = { id: 'u1', role: 'user' };
            const order = { id: 'o1', user: { _id: { toString: () => 'u1' } } };
            orderService.getOrderById.mockResolvedValue(order);

            await getOrder(req, res, next);

            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Order details', order);
        });

        it('should get order if authorized (admin)', async () => {
            req.params.id = 'o1';
            req.user = { id: 'adminId', role: 'admin' };
            const order = { id: 'o1', user: { _id: { toString: () => 'u1' } } };
            orderService.getOrderById.mockResolvedValue(order);

            await getOrder(req, res, next);

            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Order details', order);
        });

        it('should return error if unauthorized', async () => {
            req.params.id = 'o1';
            req.user = { id: 'u2', role: 'user' };
            const order = { id: 'o1', user: { _id: { toString: () => 'u1' } } };
            orderService.getOrderById.mockResolvedValue(order);

            await getOrder(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].statusCode).toBe(403);
        });
    });

    describe('getMyOrders', () => {
        it('should get all orders for user', async () => {
            req.user = { id: 'u1' };
            const orders = [{ id: 'o1' }];
            orderService.getOrdersByUser.mockResolvedValue(orders);

            await getMyOrders(req, res, next);

            expect(orderService.getOrdersByUser).toHaveBeenCalledWith('u1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'My orders', orders);
        });
    });

    describe('getOrders', () => {
        it('should return all orders for admin', async () => {
            req.user = { role: 'admin' };
            const orders = [{ id: 'o1' }];
            orderService.getAllOrders.mockResolvedValue(orders);

            await getOrders(req, res, next);

            expect(orderService.getAllOrders).toHaveBeenCalledWith({});
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'All orders', orders);
        });

        it('should error for non-admin/artisan', async () => {
            req.user = { role: 'user' };
            await getOrders(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].statusCode).toBe(403);
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status', async () => {
            req.params.id = 'o1';
            req.body = { status: 'Delivered' };

            const order = { id: 'o1', status: 'Pending' };
            orderService.getOrderById.mockResolvedValue(order);

            const updatedOrder = { ...order, status: 'Delivered', deliveredAt: expect.any(Number) };
            orderService.updateOrder.mockResolvedValue(updatedOrder);

            await updateOrderStatus(req, res, next);

            expect(orderService.updateOrder).toHaveBeenCalledWith('o1', expect.objectContaining({ status: 'Delivered', deliveredAt: expect.any(Number) }));
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Order updated', updatedOrder);
        });
    });
});
