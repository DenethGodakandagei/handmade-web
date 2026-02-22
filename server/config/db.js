import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { ENV } from '../utils/env.js';

const connectDB = async () => {
  try {
    const mongoUri = ENV.MONGO_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not set in environment');
    }

    const conn = await mongoose.connect(mongoUri);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
