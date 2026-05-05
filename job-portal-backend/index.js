import './config/env.js';
import './config/email.js';
import connectDB from './config/database.js';
import app from './app.js';
import logger from './config/logger.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, PORT } from './config/env.js';

// Create HTTP server from Express app 
const httpServer = createServer(app);

// Initialize Socket.io 
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_URL
      : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true,
  },
});

// Track connected users 
// Maps userId -> socketId so we can send targeted notifications
const connectedUsers = new Map();

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new Error('Invalid socket token'));
  }
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: %s`, socket.id);

  const userId = socket.user.id;
  connectedUsers.set(userId, socket.id);
  logger.info(`User %s connected with socket %s`, userId, socket.id);

  socket.on('register', () => {
    connectedUsers.set(userId, socket.id);
  });

  socket.on('disconnect', () => {
    if (connectedUsers.get(userId) === socket.id) {
      connectedUsers.delete(userId);
      logger.info(`User %s disconnected`, userId);
    }
  });
});

// Export io and connectedUsers for use in controllers 
export { io, connectedUsers };

// Start Server 
const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port: %s`, PORT);
    });

  } catch (error) {
    logger.error("MONGODB connection error!!! %O", error);
  }
};

startServer();
