export const healthCheck = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "✅ API is healthy",
    timestamp: new Date().toISOString(),
  });
};
