import request from 'supertest';
import app from '../../app.js';
import * as dbSetup from './dbSetup.js';
import Category from '../../models/CategoryModel.js';
import User from '../../models/UserModel.js';

beforeAll(async () => {
    await dbSetup.connectDB();
});

afterAll(async () => {
    await dbSetup.closeDB();
});

afterEach(async () => {
    await dbSetup.clearDB();
});

describe('Category API Integration Tests', () => {
    const categoryUrl = '/api/v1/categories';
    let adminToken;
    let userToken;

    beforeEach(async () => {
        // Register Admin
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@test.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'admin'
        });
        adminToken = admin.getSignedJwtToken();

        // Register User
        const user = await User.create({
            name: 'User',
            email: 'user@test.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'user'
        });
        userToken = user.getSignedJwtToken();

        // Create a base category
        await Category.create({ name: 'Crafts', description: 'Handmade crafts', image: 'crafts.jpg' });
    });

    describe('GET /api/v1/categories', () => {
        it('should publically fetch all categories', async () => {
            const res = await request(app).get(categoryUrl);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe('Crafts');
        });
    });

    describe('POST /api/v1/categories', () => {
        const newCat = { name: 'Jewelry', description: 'Handmade Jewelry' };

        it('should successfully create category if admin', async () => {
            const res = await request(app)
                .post(categoryUrl)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newCat);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Jewelry');

            // Check DB
            const catInDb = await Category.findOne({ name: 'Jewelry' });
            expect(catInDb).toBeTruthy();
        });

        it('should fail to create category if regular user', async () => {
            const res = await request(app)
                .post(categoryUrl)
                .set('Authorization', `Bearer ${userToken}`)
                .send(newCat);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not authorized/i);
        });

        it('should fail to create category without token', async () => {
            const res = await request(app).post(categoryUrl).send(newCat);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not authorized/i); // Not authorized to access this route
        });
    });

});
