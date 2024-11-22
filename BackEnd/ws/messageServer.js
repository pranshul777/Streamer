// messageServer.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
// const Message = require('../models/message.model');
const { customApiError } = require('../utils/ApiError');
const { unauthorised } = require('../utils/errors/error');

module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173' }
  });

  // JWT Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(customApiError(401, 'Access token is missing or invalid'));
      }
      if (token.split(" ")[0] !== "Bearer") { // token format: Bearer ujhasifhreuif...
        return next(unauthorised());
      }

      const decoded = jwt.verify(token.split(" ")[1], process.env.ACCESSKEY);
      socket.user = decoded.id;
      socket.username = decoded.username;
      console.log("Authorized");
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Token has expired
        next(customApiError(401, 'Token expired'));
      } else {
        next(error);
      }
    }
  });

  io.on('connection', async (socket) => {
    console.log("User connected:", socket.user);

    // Emit all messages for the specific user and channel
    socket.on('sendAllMessage', async (channelId) => {
      const messages = await Message.find({ user: socket.user, channel: channelId });
      socket.emit('getAllMessages', messages);
    });

    // Listen for new messages and save them to the database
    socket.on('sendMessage', async (messageData) => {
      const newMessage = await Message.create({
        user: socket.user,
        channel: messageData.channelId,
        text: messageData.text,
        sentBy : messageData.sender
      });
      await newMessage.save();

      const messages = await Message.find({ user: socket.user, channel: messageData.channelId });
      socket.emit('getAllMessages', messages);
    });

    socket.on('disconnect', () => {
      console.log("User disconnected:", socket.user);
    });
  });
};
