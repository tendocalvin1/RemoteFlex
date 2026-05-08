let io = null;
const connectedUsers = new Map();

export const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

export { connectedUsers };