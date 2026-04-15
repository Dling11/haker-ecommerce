const Notification = require("../models/Notification");

const MAX_NOTIFICATIONS = 50;

const buildNotificationRoute = (notification) => {
  if (notification.targetModel === "Order") {
    return "/admin/orders";
  }

  return "/admin/users";
};

const normalizeNotification = (notification) => ({
  _id: notification._id,
  type: notification.type,
  title: notification.title,
  subtitle: notification.subtitle,
  targetModel: notification.targetModel,
  targetId: notification.targetId,
  route: buildNotificationRoute(notification),
  isRead: notification.isRead,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const pruneOldNotifications = async () => {
  const notifications = await Notification.find({})
    .sort({ createdAt: -1 })
    .skip(MAX_NOTIFICATIONS)
    .select("_id");

  if (!notifications.length) {
    return;
  }

  await Notification.deleteMany({
    _id: { $in: notifications.map((item) => item._id) },
  });
};

const createAdminNotification = async ({
  type,
  title,
  subtitle = "",
  targetModel,
  targetId,
  sourceKey,
}) => {
  const notification = await Notification.findOneAndUpdate(
    { sourceKey },
    {
      $setOnInsert: {
        type,
        title,
        subtitle,
        targetModel,
        targetId,
        sourceKey,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  await pruneOldNotifications();

  return normalizeNotification(notification);
};

const listAdminNotifications = async ({ unreadOnly = true, limit = 8 } = {}) => {
  const query = unreadOnly ? { isRead: false } : {};
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  return notifications.map(normalizeNotification);
};

const markNotificationAsRead = async (notificationId) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    {
      isRead: true,
      readAt: new Date(),
    },
    {
      new: true,
    }
  );

  if (!notification) {
    return null;
  }

  return normalizeNotification(notification);
};

const markAllNotificationsAsRead = async () => {
  await Notification.updateMany(
    { isRead: false },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

module.exports = {
  createAdminNotification,
  listAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
