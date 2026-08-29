import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { ENV } from '../utils/env.js';

const connectDB = async () => {
  try {
    const mongoUri = ENV.MONGO_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not set in environment');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    logger.error(`MongoDB Error Code: ${error.code || 'N/A'}`);

    process.exit(1);
  }
};

export default connectDB;