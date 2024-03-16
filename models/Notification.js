const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    required: true
  },
  webLink: {
    type: String,
    required: false,
  },
  mobileLink: {
    type: String,
    required: false,
  },
  read: {
    type: Boolean,
    default: false
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
