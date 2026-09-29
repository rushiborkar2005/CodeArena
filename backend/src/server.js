import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Database connection
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 MVC Server running on http://localhost:${PORT}`);
});
