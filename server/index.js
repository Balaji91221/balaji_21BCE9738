const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.frontend_url || 'http://localhost:3000', // Fallback to localhost if not set
    methods: ['GET', 'POST']
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

app.get('/health', (req, res) => {
  res.status(200).send('Socket.IO server is running');
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`Listening on *:${process.env.PORT || 4000}`);
});
