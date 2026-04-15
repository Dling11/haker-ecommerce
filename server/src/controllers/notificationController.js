const asyncHandler = require("../utils/asyncHandler");
const {
  listAdminNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} = require("../services/notificationService");

const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await listAdminNotifications({
    unreadOnly: req.query.unread !== "false",
    limit: Number(req.query.limit) || 8,
  });

  res.status(200).json({
    success: true,
    notifications,
    unreadCount: notifications.filter((item) => !item.isRead).length,
  });
});

const readAdminNotification = asyncHandler(async (req, res) => {
  const notification = await markNotificationAsRead(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  res.status(200).json({
    success: true,
    notification,
  });
});

const readAllAdminNotifications = asyncHandler(async (req, res) => {
  await markAllNotificationsAsRead();

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
});

module.exports = {
  getAdminNotifications,
  readAdminNotification,
  readAllAdminNotifications,
};
