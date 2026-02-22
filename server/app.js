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

// Swagger
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';

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
import system from './routes/systemRoutes.js';
import admin from './routes/adminRoutes.js';
import securityOps from './routes/securityOpsRoutes.js';
import adminExtended from './routes/adminExtendedRoutes.js';
import announcements from './routes/announcementRoutes.js';
import payment from './routes/paymentRoute.js';
import messageRoutes from './routes/messageRoute.js'


import requestLogger from './middleware/requestLogger.js';
import logger from './config/logger.js';
import { maintenanceGate } from './middleware/platformGates.js';
import { trafficTracker } from './middleware/trafficTracker.js';

// Load env vars
dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// Standard middleware
app.use(express.json());
app.use(trafficTracker);
app.use(requestLogger);

// Enable CORS
app.use(cors());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 500
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

// ─── PLATFORM GATES ──────────────────────────────────────
// Maintenance mode: blocks ALL non-admin requests when enabled
app.use(maintenanceGate);

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/categories', categories);
app.use('/api/v1/products', products);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/orders', orders);
app.use('/api/v1/contact', contact);
app.use('/api/v1/customizations', customizations);

app.use('/api/v1/system', system);
app.use('/api/v1/admin', admin);
app.use('/api/v1/admin/security', securityOps);
app.use('/api/v1/admin/ext', adminExtended);
app.use('/api/v1/announcements', announcements);
app.use('/api/v1/payment', payment);
app.use('/api/v1/messages', messageRoutes);



// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(errorHandler);

export default app;
