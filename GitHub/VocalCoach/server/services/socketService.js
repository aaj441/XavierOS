const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 */
const initializeSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Handle connections
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle real-time audio analysis
    socket.on('audio-stream', (audioData) => {
      try {
        // Process real-time audio data
        // This would integrate with the AudioAnalysisService
        // for live pitch detection and feedback
        
        // Emit real-time feedback
        socket.emit('audio-feedback', {
          pitch: 220, // Mock data
          volume: 0.5,
          timestamp: Date.now()
        });
        
      } catch (error) {
        logger.error('Real-time audio processing error:', error);
        socket.emit('error', { message: 'Audio processing failed' });
      }
    });

    // Handle coaching session updates
    socket.on('session-update', (sessionData) => {
      try {
        // Broadcast session updates to all connected clients
        socket.broadcast.emit('session-updated', sessionData);
        
      } catch (error) {
        logger.error('Session update error:', error);
        socket.emit('error', { message: 'Session update failed' });
      }
    });

    // Handle user join room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      logger.info(`Client ${socket.id} joined room ${roomId}`);
    });

    // Handle user leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      logger.info(`Client ${socket.id} left room ${roomId}`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Handle server errors
  io.on('error', (error) => {
    logger.error('Socket.IO server error:', error);
  });

  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Broadcast message to all connected clients
 * @param {string} event - Event name
 * @param {Object} data - Data to broadcast
 */
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

/**
 * Broadcast message to specific room
 * @param {string} roomId - Room ID
 * @param {string} event - Event name
 * @param {Object} data - Data to broadcast
 */
const broadcastToRoom = (roomId, event, data) => {
  if (io) {
    io.to(roomId).emit(event, data);
  }
};

/**
 * Send message to specific client
 * @param {string} socketId - Socket ID
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
const sendToClient = (socketId, event, data) => {
  if (io) {
    io.to(socketId).emit(event, data);
  }
};

module.exports = {
  initializeSocketIO,
  getSocketIO,
  broadcast,
  broadcastToRoom,
  sendToClient
};

