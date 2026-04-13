
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/CategoryModel.js';

dotenv.config();

const categories = [
    "Pottery & Ceramics",
    "Woodwork & Carving",
    "Textiles & Weaving",
    "Handmade Jewelry",
    "Leathercrafts",
    "Glass Art",
    "Metalwork & Sculptures",
    "Candles & Soaps",
    "Fine Art & Paintings",
    "Home Decor & Accessories"
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
