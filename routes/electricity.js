const express = require("express");
const router = express.Router();

const {
  allElectricity,
  archivedElectricity,
  newElectricity,
  deleteElectricity,
  restoreElectricity,
  updateElectricityStatus
} = require("../controllers/electricityController");

const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../middlewares/auth");

router.post("/admin/electricity/new", isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), newElectricity);
router
  .route("/admin/electricity/store/:id")
  .get(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), allElectricity);

router
  .route("/admin/electricity/store/:id/archived")
  .get(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), archivedElectricity);

router.route('/admin/electricity/:id').delete(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), deleteElectricity);
router.route('/admin/electricity/restore')
  .put(isAuthenticatedUser,authorizeRoles('Admin', 'Employee'),restoreElectricity)

router.route('/admin/electricity/update-status')
  .patch(isAuthenticatedUser,authorizeRoles('Admin', 'Employee'),updateElectricityStatus)



module.exports = router;
