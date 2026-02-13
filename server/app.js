import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import errorHandler from './middleware/errorMiddleware.js';

// Route files
// Route files
import auth from './routes/authRoute.js';
import users from './routes/usersRoute.js';
import categories from './routes/categoriesRoute.js';
import products from './routes/productsRoute.js';
import reviews from './routes/reviewsRoute.js';
import orders from './routes/ordersRoute.js';
import contact from './routes/contactRoute.js';
import customizations from './routes/customizationRequestRoute.js';

import requestLogger from './middleware/requestLogger.js';
import logger from './config/logger.js';

// Load env vars
dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// Standard middleware
app.use(express.json());
app.use(requestLogger);

// Enable CORS
app.use(cors());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Sanitize data
app.use(mongoSanitize());

// Set static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/categories', categories);
app.use('/api/v1/products', products);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/orders', orders);
app.use('/api/v1/contact', contact);
app.use('/api/v1/customizations', customizations);

app.use(errorHandler);

export default app;
