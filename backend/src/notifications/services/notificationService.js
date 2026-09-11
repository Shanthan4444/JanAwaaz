import { Notification } from '../../models/Notification.js';

export const notificationService = {
  createNotification: async (payload) => {
    const {
      recipientId,
      type,
      title,
      message,
      issueId,
      actorId = 'system',
      priority = 'NORMAL',
      deduplicationKey,
      metadata = {}
    } = payload || {};

    if (!recipientId || !type || !title || !message) {
      console.warn('[NOTIFICATION SERVICE] Missing required fields for notification creation.', payload);
      return null;
    }

    // Check deduplication key if provided to avoid duplicate notifications on retries
    if (deduplicationKey) {
      const existing = await Notification.findOne({ recipientId, deduplicationKey });
      if (existing) {
        console.log(`[NOTIFICATION SERVICE] Deduplicated existing notification for key '${deduplicationKey}'`);
        return existing.toObject();
      }
    }

    const doc = await Notification.create({
      recipientId,
      type,
      title,
      message,
      issueId,
      actorId,
      priority,
      deduplicationKey: deduplicationKey || null,
      metadata,
      isRead: false
    });

    console.log(`[NOTIFICATION ENGINE] Notification created for recipient '${recipientId}' -> [${type}] "${title}"`);
    return doc.toObject();
  },

  getNotifications: async (recipientId, filters = {}) => {
    const query = { recipientId };

    if (filters.unreadOnly === 'true' || filters.unreadOnly === true) {
      query.isRead = false;
    }

    const limit = parseInt(filters.limit, 10) || 30;
    const skip = ((parseInt(filters.page, 10) || 1) - 1) * limit;

    const docs = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipientId, isRead: false });

    return {
      notifications: docs.map((d) => d.toObject()),
      total,
      unreadCount,
      page: parseInt(filters.page, 10) || 1,
      limit
    };
  },

  getUnreadCount: async (recipientId) => {
    const count = await Notification.countDocuments({ recipientId, isRead: false });
    return { count };
  },

  markAsRead: async (notificationId, recipientId) => {
    const doc = await Notification.findOne({ _id: notificationId, recipientId });
    if (!doc) {
      const err = new Error(`Notification '${notificationId}' not found for user.`);
      err.status = 404;
      throw err;
    }

    if (!doc.isRead) {
      doc.isRead = true;
      doc.readAt = new Date();
      await doc.save();
    }

    return doc.toObject();
  },

  markAllAsRead: async (recipientId) => {
    const result = await Notification.updateMany(
      { recipientId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  },

  deleteNotification: async (notificationId, recipientId) => {
    const doc = await Notification.findOneAndDelete({ _id: notificationId, recipientId });
    if (!doc) {
      const err = new Error(`Notification '${notificationId}' not found.`);
      err.status = 404;
      throw err;
    }

    return { success: true };
  }
};
