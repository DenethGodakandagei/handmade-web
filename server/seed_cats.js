
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/CategoryModel.js';

dotenv.config();

const categories = [
    "Art & Crafts",
    "Home Decor",
    "Kitchen & Dining",
    "Jewelry & Accessories",
    "Bags & Textiles",
    "Eco Products",
    "Cultural Crafts",
    "Custom Products"
];

const seedCategories = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        for (const catName of categories) {
            const exists = await Category.findOne({ name: catName });
            if (!exists) {
                await Category.create({ name: catName, description: `${catName} category` });
                console.log(`Created category: ${catName}`);
            } else {
                console.log(`Category exists: ${catName}`);
            }
        }

        console.log('Categories seeded!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedCategories();
