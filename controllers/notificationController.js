const Notification = require("../models/Notification");



exports.allNotifications = async (req, res, next) => {
  const { id } = req.params;
  const PAGE_SIZE = 10;
  let page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * PAGE_SIZE;

  try {
    const totalNotifications = await Notification.countDocuments({ recipient: id });
    const totalUnreadNotifications = await Notification.countDocuments({ recipient: id, read: false });
    const totalPages = Math.ceil(totalNotifications / PAGE_SIZE);
    const notifications = await Notification.find({ recipient: id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(PAGE_SIZE);

    const hasMore = page < totalPages; 
    const currentPage = page; 

    res.json({
      notifications,
      totalUnreadNotifications,
      totalPages,
      hasMore,
      currentPage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.readNotification = async (req, res, next) => {
  const { id } = req.body;

  try {
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).send({ success: true, notification });

  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.allUnreadNotifications = async (req, res, next) => {
  const { id } = req.params;
  try {
    const totalUnreadNotifications = await Notification.countDocuments({ recipient: id, read: false });
    res.json({

      totalUnreadNotifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};











