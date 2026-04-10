import request from 'supertest';
import app from '../../app.js';
import * as dbSetup from './dbSetup.js';
import CustomizationRequest from '../../models/CustomizationRequestModel.js';
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

describe('Customization Request API Integration Tests', () => {
    const customUrl = '/api/v1/customizations';
    let artisanToken;
    let customerToken;
    let artisanId;
    let customerId;
    let productId;

    beforeEach(async () => {
        // Create Category
        const category = await Category.create({
            name: 'Textiles',
            description: 'Fiber arts'
        });

        // Create Artisan
        const artisan = await User.create({
            name: 'Artisan Alice',
            email: 'alice@test.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'artisan'
        });
        artisanId = artisan._id;
        artisanToken = artisan.getSignedJwtToken();

        // Create Customer
        const customer = await User.create({
            name: 'Buyer Bob',
            email: 'bob@test.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'user'
        });
        customerId = customer._id;
        customerToken = customer.getSignedJwtToken();

        // Create Product
        const product = await Product.create({
            name: 'Textile Product',
            description: 'A custom blanket',
            price: 150,
            category: category._id,
            artisan: artisanId,
            location: { district: 'Kandy', area: 'Peradeniya' }
        });
        productId = product._id;
    });

    describe('POST /api/v1/customizations', () => {
        it('should successfully create a customization request', async () => {
            const res = await request(app)
                .post(customUrl)
                .set('Authorization', `Bearer ${customerToken}`)
                .field('product', productId.toString())
                .field('customizations', JSON.stringify([{ optionName: 'Color', selectedValue: 'Blue' }]))
                .field('customMessage', 'I want it in navy blue please.');

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.buyer).toBe(customerId.toString());
            expect(res.body.data.artisan).toBe(artisanId.toString());
            expect(res.body.data.notes).toBe('I want it in navy blue please.');

            const reqInDb = await CustomizationRequest.findOne({ buyer: customerId });
            expect(reqInDb).toBeTruthy();
        });
    });

    describe('GET /api/v1/customizations', () => {
        beforeEach(async () => {
            await CustomizationRequest.create({
                buyer: customerId,
                artisan: artisanId,
                product: productId,
                customizations: [{ optionName: 'Size', selectedValue: 'Large' }],
                notes: 'Big size'
            });
        });

        it('should fetch requests for the logged-in customer', async () => {
            const res = await request(app)
                .get(customUrl)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
        });

        it('should fetch requests for the logged-in artisan', async () => {
            const res = await request(app)
                .get(customUrl)
                .set('Authorization', `Bearer ${artisanToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
        });
    });

    describe('PUT /api/v1/customizations/:id/status', () => {
        let requestId;

        beforeEach(async () => {
            const req = await CustomizationRequest.create({
                buyer: customerId,
                artisan: artisanId,
                product: productId,
                customizations: [{ optionName: 'Weight', selectedValue: 'Heavy' }]
            });
            requestId = req._id;
        });

        it('should allow artisan to update request status and price', async () => {
            const res = await request(app)
                .put(`${customUrl}/${requestId}/status`)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({ status: 'Accepted', price: 175 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('Accepted');
            expect(res.body.data.price).toBe(175);

            const reqInDb = await CustomizationRequest.findById(requestId);
            expect(reqInDb.status).toBe('Accepted');
        });

        it('should prevent customer from updating status', async () => {
            const res = await request(app)
                .put(`${customUrl}/${requestId}/status`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ status: 'Accepted' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });
});
