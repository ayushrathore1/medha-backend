const Notification = require("../models/Notification");

// Get notifications for the current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications
      
    // Count unread
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      read: false 
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark a single notification or all as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'all') {
      await Notification.updateMany(
        { recipient: req.user._id, read: false },
        { read: true }
      );
    } else {
      await Notification.findOneAndUpdate(
        { _id: id, recipient: req.user._id },
        { read: true }
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// Internal helper to create notification
exports.createNotification = async ({ recipient, type, title, message, link, sender }) => {
  try {
    await Notification.create({
      recipient,
      type,
      title,
      message,
      link,
      sender
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};
