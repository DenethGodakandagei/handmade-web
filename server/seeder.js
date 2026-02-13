import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load models
import User from './models/UserModel.js';
import Category from './models/CategoryModel.js';
import Product from './models/ProductModel.js';
import Review from './models/ReviewModel.js';

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Hash password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash('password123', salt);

// Dummy Data
const seedData = async () => {
    try {
        // Clear all
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();
        await Review.deleteMany();

        console.log('Data Cleared...');

        // Create Users
        const users = await User.create([
            {
                name: 'System Admin',
                email: 'admin@artisan.com',
                password: 'password123',
                role: 'admin'
            },
            {
                name: 'Aruna Perera',
                email: 'aruna@artisan.com',
                password: 'password123',
                role: 'artisan'
            },
            {
                name: 'Lakshmi Devi',
                email: 'lakshmi@artisan.com',
                password: 'password123',
                role: 'artisan'
            },
            {
                name: 'Kasun Silva',
                email: 'kasun@buyer.com',
                password: 'password123',
                role: 'buyer'
            }
        ]);

        const artisan1 = users[1]._id;
        const artisan2 = users[2]._id;
        const buyer1 = users[3]._id;

        // Create Categories
        const categories = await Category.create([
            { name: 'Ceramics', description: 'Handmade clay and pottery' },
            { name: 'Textiles', description: 'Hand-loomed fabrics and garments' },
            { name: 'Woodwork', description: 'Carved wooden treasures' },
            { name: 'Basketry', description: 'Traditional woven baskets' }
        ]);

        const catCeramics = categories[0]._id;
        const catBasketry = categories[3]._id;

        // Create Products
        const products = await Product.create([
            {
                name: 'Traditional Clay Water Jug',
                description: 'A naturally cooling water jug handmade using ancient clay techniques. Keeps water chilled for hours.',
                price: 45,
                category: catCeramics,
                artisan: artisan1,
                images: ['/uploads/ceramic.png'],
                stock: 15,
                location: {
                    district: 'Kurunegala',
                    area: 'Narammala'
                },
                isPreOrder: false
            },
            {
                name: 'Woven Reed Picnic Basket',
                description: 'Eco-friendly picnic basket woven from sun-dried reeds. Durable, stylish, and sustainable.',
                price: 32,
                category: catBasketry,
                artisan: artisan2,
                images: ['/uploads/hero.png'],
                stock: 0,
                location: {
                    district: 'Galle',
                    area: 'Habaraduwa'
                },
                isPreOrder: true
            }
        ]);

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
