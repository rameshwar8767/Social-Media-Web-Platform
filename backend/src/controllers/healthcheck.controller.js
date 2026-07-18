export const healthCheck = (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
};