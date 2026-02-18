
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/ProductModel.js';
import Category from './models/CategoryModel.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const productCount = await Product.countDocuments();
        console.log(`Product Count: ${productCount}`);

        const products = await Product.find({}).populate('category').limit(5);
        console.log('Sample Products:', JSON.stringify(products, null, 2));

        const categories = await Category.find({});
        console.log('Categories:', JSON.stringify(categories, null, 2));

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
