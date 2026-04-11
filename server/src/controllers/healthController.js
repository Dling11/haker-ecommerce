const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: "haker-ecommerce API is healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealthStatus,
};
