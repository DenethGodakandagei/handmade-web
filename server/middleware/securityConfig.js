import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';

const configureSecurity = (app) => {
  // Set security headers
  app.use(helmet());

  // Prevent XSS attacks
  app.use(xss());

  // Sanitize data
  app.use(mongoSanitize());

  // Rate limiting (100 requests per 10 mins)
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' }
  });
  app.use('/api', limiter);

  // Prevent parameter pollution
  app.use(hpp());

  // Enable CORS
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
  }));
};

export default configureSecurity;
