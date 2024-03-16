const express = require("express");
const router = express.Router();

const {
 allNotifications,
 readNotification,
 allUnreadNotifications
} = require("../controllers/notificationController");

const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/auth");


router
  .route("/notification/user/:id")
  .get(isAuthenticatedUser, allNotifications);

  router
  .route("/notification/user/:id/unread")
  .get(isAuthenticatedUser, allUnreadNotifications);

router
  .route("/notification/read")
  .put(isAuthenticatedUser, readNotification);

module.exports = router;
