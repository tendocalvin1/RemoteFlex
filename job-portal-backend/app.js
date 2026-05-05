

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import logger from './config/logger.js';
import { sanitizeInput, limitPayloadSize } from './middleware/sanitization.middleware.js';
import { swaggerUi, specs } from './config/swagger.js';

const app = express();
app.set('trust proxy', 1);
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

//. SECURITY HEADERS  TO ENFORCE PROPER SECURITY PRACTICES AGAINST COMMON VULNERABILITIES
app.use(helmet());

// CORS 
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [process.env.CLIENT_URL]
  : ["http://localhost:8000", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// RATE LIMITING 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per IP per window
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                   // stricter — only 10 login/register attempts
  message: { error: "Too many auth attempts. Please try again later." },
});

app.use("/api", limiter);                       // global API limit
app.use("/api/users/login", authLimiter);       // strict auth limit
app.use("/api/users/register", authLimiter);

// INPUT SANITIZATION & SIZE LIMITS
app.use(limitPayloadSize);

//  BODY PARSERS 
app.use(express.json({ limit: "3MB" }));           // reject huge payloads
app.use(express.urlencoded({ extended: true, limit: "3MB" }));
app.use(sanitizeInput);

// API DOCUMENTATION
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//  HEALTH CHECK 
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", env: process.env.NODE_ENV });
});

//  ROUTES 
import ApplicationRouter from './routes/applications.routes.js';
import JobRouter from './routes/jobs.routes.js';
import UserRouter from './routes/users.routes.js';
import UploadRouter from './routes/upload.routes.js';


app.use('/api/applications', ApplicationRouter);
app.use('/api/jobs', JobRouter);
app.use('/api/users', UserRouter);
app.use('/api/upload', UploadRouter);

//  404 HANDLER 
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// GLOBAL ERROR HANDLER 
app.use((err, req, res, next) => {
  logger.error(`[ERROR] ${req.method} ${req.originalUrl} → %s`, err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "development"
    ? err.message
    : "Something went wrong. Please try again.";

  res.status(statusCode).json({ error: message });
});

export default app;