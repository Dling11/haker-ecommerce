const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getDashboardStats = asyncHandler(async (req, res) => {
  const [usersCount, ordersCount, productsCount, revenueResult, latestOrders, reviewStats] =
    await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        {
          $match: {
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]),
      Order.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
      Product.aggregate([
        {
          $project: {
            numReviews: 1,
            rating: 1,
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: "$numReviews" },
            averageStoreRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

  const statusBreakdownRaw = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  const statusBreakdown = statusBreakdownRaw.reduce((accumulator, item) => {
    accumulator[item._id] = item.count;
    return accumulator;
  }, {});

  res.status(200).json({
    success: true,
    stats: {
      usersCount,
      ordersCount,
      productsCount,
      totalReviews: reviewStats[0]?.totalReviews || 0,
      averageStoreRating: reviewStats[0]?.averageStoreRating || 0,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      statusBreakdown,
      latestOrders,
    },
  });
});

module.exports = {
  getDashboardStats,
};
