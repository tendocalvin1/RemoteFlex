import './config/env.js';
import './config/email.js';

import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import app from './app.js';
import connectDB from './config/database.js';
import logger from './config/logger.js';

import { JWT_SECRET, PORT } from './config/env.js';

import {
  setSocketIO,
  connectedUsers,
} from './config/socket.js';

// ─────────────────────────────────────────────
// Create HTTP Server
// ─────────────────────────────────────────────
const httpServer = createServer(app);

// ─────────────────────────────────────────────
// Initialize Socket.IO
// ─────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://remoteflex-frontend.vercel.app',
            'http://127.0.0.1:5500',
            'http://localhost:5500',
          ],
    credentials: true,
  },
});

// Register socket instance globally
setSocketIO(io);

// ─────────────────────────────────────────────
// Parse Cookies Helper
// ─────────────────────────────────────────────
const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((cookies, pair) => {
    const [key, value] = pair.split('=');

    if (!key || !value) return cookies;

    cookies[key.trim()] = decodeURIComponent(value.trim());

    return cookies;
  }, {});
};

// ─────────────────────────────────────────────
// Socket Authentication Middleware
// ─────────────────────────────────────────────
io.use((socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token;

    const cookies = parseCookies(
      socket.handshake.headers?.cookie || ''
    );

    const token = authToken || cookies.accessToken;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    socket.user = jwt.verify(token, JWT_SECRET);

    next();
  } catch (error) {
    next(new Error('Invalid socket token'));
  }
});

// ─────────────────────────────────────────────
// Socket Events
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  const userId = socket.user.id;

  connectedUsers.set(userId, socket.id);

  logger.info(
    `User ${userId} connected with socket ${socket.id}`
  );

  socket.on('register', () => {
    connectedUsers.set(userId, socket.id);
  });

  socket.on('disconnect', () => {
    if (connectedUsers.get(userId) === socket.id) {
      connectedUsers.delete(userId);

      logger.info(`User ${userId} disconnected`);
    }
  });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port: ${PORT}`);
    });
  } catch (error) {
    logger.error('MONGODB connection error!!! %O', error);

    process.exit(1);
  }
};

startServer();