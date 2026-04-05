

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

//. SECURITY HEADERS 
app.use(helmet());

// CORS 
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [process.env.CLIENT_URL]           // e.g. "https://remoteflex.com"
  : ["http://localhost:8000", "http://localhost:5173"];

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

//  BODY PARSERS 
app.use(express.json({ limit: "3MB" }));           // reject huge payloads
app.use(express.urlencoded({ extended: true, limit: "3MB" }));

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
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "development"
    ? err.message
    : "Something went wrong. Please try again.";

  res.status(statusCode).json({ error: message });
});

export default app;