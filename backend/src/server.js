import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setupSockets } from './sockets.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Database connection
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSockets(io);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server with Socket.IO running on http://localhost:${PORT}`);
});
