import request from 'supertest';
import app from '../../app.js';
import * as dbSetup from './dbSetup.js';
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

describe('Product API Integration Tests', () => {
    const productUrl = '/api/v1/products';
    let artisanToken;
    let userToken;
    let artisanId;
    let categoryId;

    beforeEach(async () => {
        // Create Category
        const category = await Category.create({
            name: 'Home Decor',
            description: 'Handmade home decor items',
            image: 'decor.jpg'
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
        artisanToken = artisan.getSignedJwtToken();

        // Create Regular User
        const user = await User.create({
            name: 'Regular Joe',
            email: 'joe@test.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'user'
        });
        userToken = user.getSignedJwtToken();
    });

    describe('POST /api/v1/products', () => {
        const validProduct = {
            name: 'Handmade Vase',
            description: 'A beautiful clay vase',
            price: 50,
            stock: 10,
            category: null, // fill in test
            location: {
                district: 'Colombo',
                area: 'Borella'
            }
        };

        it('should successfully create a product if artisan', async () => {
            const productData = { ...validProduct, category: categoryId };
            
            const res = await request(app)
                .post(productUrl)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send(productData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Handmade Vase');
            expect(res.body.data.artisan).toBe(artisanId.toString());

            // Check DB
            const productInDb = await Product.findOne({ name: 'Handmade Vase' });
            expect(productInDb).toBeTruthy();
            expect(productInDb.price).toBe(50);
        });

        it('should fail to create product if regular user', async () => {
            const productData = { ...validProduct, category: categoryId };
            
            const res = await request(app)
                .post(productUrl)
                .set('Authorization', `Bearer ${userToken}`)
                .send(productData);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not authorized/i);
        });

        it('should fail if required fields are missing', async () => {
            const invalidProduct = { name: 'Incomplete' };
            
            const res = await request(app)
                .post(productUrl)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send(invalidProduct);

            expect(res.status).toBe(400); // Validation error
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/products', () => {
        beforeEach(async () => {
            await Product.create({
                name: 'Product 1',
                description: 'Description 1',
                price: 10,
                stock: 5,
                category: categoryId,
                artisan: artisanId,
                location: { district: 'D1', area: 'A1' }
            });
        });

        it('should fetch all products (public)', async () => {
            const res = await request(app).get(productUrl);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.products.length).toBe(1);
        });

        it('should filter products by category', async () => {
            const res = await request(app).get(`${productUrl}?category=${categoryId}`);

            expect(res.status).toBe(200);
            expect(res.body.data.count).toBe(1);
        });
    });

    describe('GET /api/v1/products/:id', () => {
        let productId;

        beforeEach(async () => {
            const product = await Product.create({
                name: 'Detail Product',
                description: 'Description',
                price: 20,
                stock: 5,
                category: categoryId,
                artisan: artisanId,
                location: { district: 'D1', area: 'A1' }
            });
            productId = product._id;
        });

        it('should fetch single product details', async () => {
            const res = await request(app).get(`${productUrl}/${productId}`);

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Detail Product');
        });

        it('should return 404 for non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app).get(`${productUrl}/${fakeId}`);

            expect(res.status).toBe(404);
        });
    });
});
