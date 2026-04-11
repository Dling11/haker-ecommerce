const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
});

const updateUserManagement = asyncHandler(async (req, res) => {
  const { role, status } = req.body;
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (role) {
    user.role = role;
  }

  if (status) {
    user.status = status;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    user,
  });
});

module.exports = {
  getUsers,
  updateUserManagement,
};
