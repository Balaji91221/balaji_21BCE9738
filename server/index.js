const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// Configure CORS to allow multiple origins
const allowedOrigins = [
  'http://localhost:3000', // Your development URL
  'https://balaji-21-bce-9738.vercel.app', // Production URL
  // Add any other allowed origins here
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('move', (data) => {
    io.emit('updateBoard', data.board);
    io.emit('message', data.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});



server.listen(process.env.PORT || 4000, () => {
  console.log(`Listening on *:${process.env.PORT || 4000}`);
});
