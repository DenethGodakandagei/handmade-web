import request from 'supertest';
import app from '../../app.js';
import * as dbSetup from './dbSetup.js';
import Chat from '../../models/ChatModel.js';
import Message from '../../models/MessageModel.js';
import User from '../../models/UserModel.js';
import Product from '../../models/ProductModel.js';
import Category from '../../models/CategoryModel.js';

import { createServer } from 'http';
import { initSocket } from '../../utils/socket.js';

beforeAll(async () => {
    await dbSetup.connectDB();
    const httpServer = createServer(app);
    initSocket(httpServer);
});

afterAll(async () => {
    await dbSetup.closeDB();
});

afterEach(async () => {
    await dbSetup.clearDB();
});

describe('Chat API Integration Tests', () => {
    const chatUrl = '/api/v1/chat';
    let artisanToken;
    let customerToken;
    let artisanId;
    let customerId;
    let productId;

    beforeEach(async () => {
        // Create Category
        const category = await Category.create({
            name: 'Handmade Crafts',
            description: 'Crafts description'
        });

        // Create Artisan
        const artisan = await User.create({
            name: 'Artisan John',
            email: 'artisan@chat.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'artisan'
        });
        artisanId = artisan._id;
        artisanToken = artisan.getSignedJwtToken();

        // Create Customer
        const customer = await User.create({
            name: 'Customer Joe',
            email: 'customer@chat.com',
            password: 'password123',
            confirmPassword: 'password123',
            role: 'user'
        });
        customerId = customer._id;
        customerToken = customer.getSignedJwtToken();

        // Create Product
        const product = await Product.create({
            name: 'Chat Product',
            description: 'Testing chat',
            price: 100,
            category: category._id,
            artisan: artisanId,
            location: { district: 'Colombo', area: 'Borella' }
        });
        productId = product._id;
    });

    describe('POST /api/v1/chat/start', () => {
        it('should start a new chat between customer and artisan', async () => {
            const res = await request(app)
                .post(`${chatUrl}/start`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ artisanId, productId });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.customer).toBe(customerId.toString());
            expect(res.body.data.artisan).toBe(artisanId.toString());
            
            const chatInDb = await Chat.findOne({ customer: customerId, artisan: artisanId });
            expect(chatInDb).toBeTruthy();
        });
    });

    describe('POST /api/v1/chat/message', () => {
        let chatId;

        beforeEach(async () => {
            const chat = await Chat.create({
                customer: customerId,
                artisan: artisanId,
                product: productId
            });
            chatId = chat._id;
        });

        it('should send a message in an existing chat', async () => {
            const res = await request(app)
                .post(`${chatUrl}/message`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ chatId, content: 'Hello Artisan!' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.content).toBe('Hello Artisan!');
            
            const messageInDb = await Message.findOne({ chat: chatId });
            expect(messageInDb).toBeTruthy();
            expect(messageInDb.content).toBe('Hello Artisan!');
        });
    });

    describe('GET /api/v1/chat/:chatId/messages', () => {
        let chatId;

        beforeEach(async () => {
            const chat = await Chat.create({
                customer: customerId,
                artisan: artisanId,
                product: productId
            });
            chatId = chat._id;

            await Message.create({
                chat: chatId,
                sender: customerId,
                content: 'Message 1'
            });
            await Message.create({
                chat: chatId,
                sender: artisanId,
                content: 'Message 2'
            });
        });

        it('should fetch all messages for a chat', async () => {
            const res = await request(app)
                .get(`${chatUrl}/${chatId}/messages`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(2);
        });
    });

    describe('GET /api/v1/chat', () => {
        beforeEach(async () => {
            await Chat.create({
                customer: customerId,
                artisan: artisanId,
                product: productId,
                lastMessage: 'Latest message'
            });
        });

        it('should return all chats for the logged-in user', async () => {
            const res = await request(app)
                .get(chatUrl)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
        });
    });
});
