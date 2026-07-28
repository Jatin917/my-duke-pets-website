import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import petRoutes from './routes/petRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import customerAuthRoutes from './routes/customerAuthRoutes.js';
import donateRoutes from './routes/donateRoutes.js';
import sellRoutes from './routes/sellRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import breedRoutes from './routes/breedRoutes.js';
import enquiryPromptRoutes from './routes/enquiryPromptRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Hostinger sits behind reverse proxy / CDN and sets X-Forwarded-For.
// Use true so express-rate-limit can read the real client IP (ERR_ERL_UNEXPECTED_X_FORWARDED_FOR).
const trustProxySetting =
  process.env.TRUST_PROXY === 'false'
    ? false
    : process.env.TRUST_PROXY_HOPS
      ? Number(process.env.TRUST_PROXY_HOPS)
      : true;
app.set('trust proxy', trustProxySetting);
console.log('[app] trust proxy:', app.get('trust proxy'));

const rateLimitCommon = {
  standardHeaders: true,
  legacyHeaders: false,
  // Avoid throwing if a host still injects X-Forwarded-For unexpectedly.
  validate: { xForwardedForHeader: false },
};

/** Strip path/trailing slash so https://site.com/ and https://site.com match. */
const toOrigin = (value) => {
  if (!value) return null;
  try {
    return new URL(String(value).trim()).origin;
  } catch {
    return String(value).trim().replace(/\/$/, '') || null;
  }
};

/** Include www + apex variants so either hostname works. */
const withWwwVariants = (origin) => {
  if (!origin) return [];
  const set = new Set([origin]);
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) {
      return [...set];
    }
    if (url.hostname.startsWith('www.')) {
      set.add(`${url.protocol}//${url.hostname.slice(4)}`);
    } else {
      set.add(`${url.protocol}//www.${url.hostname}`);
    }
  } catch {
    /* ignore */
  }
  return [...set];
};

const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  ...(process.env.ALLOWED_ORIGINS || '').split(','),
]
  .map(toOrigin)
  .flatMap(withWwwVariants);

if (process.env.NODE_ENV !== 'production') {
  configuredOrigins.push(
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  );
}

const allowedOrigins = [...new Set(configuredOrigins.filter(Boolean))];

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser / same-origin proxy requests often omit Origin.
      if (!origin) return callback(null, true);
      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`[cors] blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  ...rateLimitCommon,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  ...rateLimitCommon,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/customer/auth/send-otp', authLimiter);
app.use('/api/customer/auth/verify-otp', authLimiter);
app.use('/api/customer/auth/login', authLimiter);
app.use('/api/customer/auth/register', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Pets Marketplace API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/breeds', breedRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/enquiry-prompt', enquiryPromptRoutes);
app.use('/api/donate', donateRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
