const express = require("express");
const router = express.Router();

const {
 allNotifications
} = require("../controllers/notificationController");

const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/auth");


router
  .route("/notification/user/:id")
  .get(isAuthenticatedUser, allNotifications);

module.exports = router;
