import './config/env.js';
import './config/email.js';
import connectDB from './config/database.js';
import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PORT } from './config/env.js';

// Create HTTP server from Express app 
const httpServer = createServer(app);

// Initialize Socket.io 
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_URL
      : 'http://localhost:8000',
    credentials: true,
  },
});

// Track connected users 
// Maps userId -> socketId so we can send targeted notifications
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Frontend sends userId after connecting
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    // Remove user from map when they disconnect
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Export io and connectedUsers for use in controllers 
export { io, connectedUsers };

// Start Server 
const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT || 8000, () => {
      console.log(`Server is running on port: ${PORT}`);
    });

  } catch (error) {
    console.log("MONGODB connection error!!!", error);
  }
};

startServer();