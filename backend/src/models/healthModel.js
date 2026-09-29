/**
 * Health Model
 * Represents system health and status data logic.
 */

export const getHealthStatus = () => {
  return {
    status: 'ok',
    message: 'Backend server operating normally with MVC architecture',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
};
