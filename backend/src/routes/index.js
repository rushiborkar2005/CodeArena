import express from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import problemRoutes from './problemRoutes.js';

const router = express.Router();

// Register sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);

export default router;
