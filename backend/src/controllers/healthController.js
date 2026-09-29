import { getHealthStatus } from '../models/healthModel.js';

/**
 * @desc   Get API Health Status
 * @route  GET /api/health
 * @access Public
 */
export const checkHealth = (req, res, next) => {
  try {
    const healthData = getHealthStatus();
    res.status(200).json(healthData);
  } catch (error) {
    next(error);
  }
};
