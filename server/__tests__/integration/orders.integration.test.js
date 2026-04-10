import request from 'supertest';
import app from '../../app.js';
import * as dbSetup from './dbSetup.js';
import Order from '../../models/OrderModel.js';
import Product from '../../models/ProductModel.js';
import User from '../../models/UserModel.js';
import Category from '../../models/CategoryModel.js';

beforeAll(async () => {
    await dbSetup.connectDB();
});

afterAll(async () => {
    await dbSetup.closeDB();
});

afterEach(async () => {
    await dbSetup.clearDB();
});

describe('Order API Integration Tests', () => {
    const orderUrl = '/api/v1/orders';
    let userToken;
    let userId;
    let productId;
    let categoryId;
    let artisanId;

    beforeEach(async () => {
        // Create Category
        const category = await Category.create({
            name: 'Ceramics',
            description: 'Handmade ceramics',
            image: 'ceramics.jpg'
        });
        categoryId = category._id;

        // Create Artisan
        const artisan = await User.create({
            name: 'Artisan John',
            email: 'artisan@test.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'artisan'
        });
        artisanId = artisan._id;

        // Create Regular User
        const user = await User.create({
            name: 'Buyer Bob',
            email: 'bob@test.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'user'
        });
        userId = user._id;
        userToken = user.getSignedJwtToken();

        // Create Product
        const product = await Product.create({
            name: 'Clay Pot',
            description: 'A fine clay pot',
            price: 100,
            stock: 10,
            category: categoryId,
            artisan: artisanId,
            location: { district: 'Colombo', area: 'Borella' }
        });
        productId = product._id;
    });

    const validOrder = {
        orderItems: [
            {
                product: null, // fill in test
                quantity: 2
            }
        ],
        shippingAddress: {
            address: '123 Main St',
            city: 'Colombo',
            postalCode: '00100',
            country: 'Sri Lanka'
        },
        paymentMethod: 'Cash on Delivery'
    };

    describe('POST /api/v1/orders', () => {

        it('should successfully create an order and reduce stock', async () => {
            const orderData = { ...validOrder };
            orderData.orderItems[0].product = productId;

            const res = await request(app)
                .post(orderUrl)
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalAmount).toBe(200); // 100 * 2

            // Check Order in DB
            const orderInDb = await Order.findOne({ user: userId });
            expect(orderInDb).toBeTruthy();
            expect(orderInDb.products.length).toBe(1);

            // Check Stock Reduction
            const updatedProduct = await Product.findById(productId);
            expect(updatedProduct.stock).toBe(8); // 10 - 2
        });

        it('should fail if product is out of stock', async () => {
            const orderData = { ...validOrder };
            orderData.orderItems[0].product = productId;
            orderData.orderItems[0].quantity = 11; // More than stock

            const res = await request(app)
                .post(orderUrl)
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/out of stock/i);
        });

        it('should fail if shipping to unsupported country', async () => {
            const orderData = { ...validOrder };
            orderData.orderItems[0].product = productId;
            orderData.shippingAddress.country = 'Unsupported Country';

            const res = await request(app)
                .post(orderUrl)
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData);

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/not currently supported/i);
        });
    });

    describe('GET /api/v1/orders/myorders', () => {
        it('should fetch orders for the logged in user', async () => {
            // Create an order first
            await Order.create({
                user: userId,
                products: [{ product: productId, quantity: 1, price: 100, name: 'Clay Pot' }],
                totalAmount: 100,
                shippingAddress: validOrder.shippingAddress,
                paymentMethod: 'COD'
            });

            const res = await request(app)
                .get(`${orderUrl}/myorders`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
        });
    });
});
