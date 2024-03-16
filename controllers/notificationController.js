


const Notification = require("../models/Notification");
const ErrorHandler = require("../utils/errorHandler");

const bcrypt = require("bcryptjs");

const cloudinary = require("cloudinary");



exports.allNotifications = async (req, res, next) => {
  const { id } = req.params; 
  const PAGE_SIZE = 10;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * PAGE_SIZE;

  try {
    const totalNotifications = await Notification.countDocuments({ recipient: id });
    const totalUnreadNotifications = await Notification.countDocuments({ recipient: id, read: false })
    const totalPages = Math.ceil(totalNotifications / PAGE_SIZE);
    const notifications = await Notification.find({ recipient: id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(PAGE_SIZE);
  
    res.json({
      notifications,
      totalUnreadNotifications,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};












