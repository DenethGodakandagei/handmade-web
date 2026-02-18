
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/ProductModel.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected`);

        const count = await Product.countDocuments();
        console.log(`PRODUCT_COUNT: ${count}`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
