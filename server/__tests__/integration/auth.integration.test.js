import request from 'supertest';
import app from '../../app.js';
import * as dbSetup from './dbSetup.js';
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

describe('Auth API Integration Tests', () => {
    const registerUrl = '/api/v1/auth/register';
    const loginUrl = '/api/v1/auth/login';

    const validUser = {
        name: 'Test Artisan',
        email: 'artisan@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'user'
    };

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully and return token', async () => {
            const res = await request(app)
                .post(registerUrl)
                .send(validUser);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();

            // Check cookie
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toMatch(/token=/);

            // Verify user was actually saved to DB
            const user = await User.findOne({ email: validUser.email });
            expect(user).toBeTruthy();
            expect(user.role).toBe('user');
        });

        it('should return error if email already exists', async () => {
            // Create user first
            await request(app).post(registerUrl).send(validUser);

            // Try creating again
            const res = await request(app)
                .post(registerUrl)
                .send(validUser);

            expect(res.status).toBe(400); // Usually duplicates return 400 or 500
            expect(res.body.success).toBe(false);
            // The exact error message depends on the error handling middleware
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Register user before each login test
            await request(app).post(registerUrl).send(validUser);
        });

        it('should login an existing user and return token', async () => {
            const res = await request(app)
                .post(loginUrl)
                .send({ email: validUser.email, password: validUser.password });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('should fail login with incorrect password', async () => {
            const res = await request(app)
                .post(loginUrl)
                .send({ email: validUser.email, password: 'wrongpassword' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should fail if email does not exist', async () => {
            const res = await request(app)
                .post(loginUrl)
                .send({ email: 'nonexistent@test.com', password: 'password123' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
