const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware — verify JWT on connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name role');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Join a private room keyed by requestId so only the two parties chat
    socket.on('join_request_room', (requestId) => {
      socket.join(`request:${requestId}`);
    });

    socket.on('send_message', ({ requestId, message }) => {
      const payload = {
        sender: { _id: socket.user._id, name: socket.user.name },
        message,
        timestamp: new Date().toISOString(),
      };
      // Emit to everyone in the room (both vendor and requester)
      io.to(`request:${requestId}`).emit('receive_message', payload);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialised');
  return io;
};

module.exports = { initSocket, getIO };
