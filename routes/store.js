const upload = require("../utils/multer");
const pdfupload = require("../utils/pdfMulter");
const express = require("express");
const router = express.Router();

const {
  allStores,
  archivedStores,
  getStoreDetails,
  updateStore,
  deleteStore,
  restoreStore,
  newStore,
  updateStoreStatus,
  updatePermit,
  updateContract
} = require("../controllers/storeController");

const {
  isAuthenticatedUser,

  authorizeRoles,
} = require("../middlewares/auth");


router
  .route("/admin/stores")
  .get(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), allStores);
router
  .route("/admin/stores/archived")
  .get(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), archivedStores);
router.route('/admin/store/:id')
  .get(isAuthenticatedUser, authorizeRoles('Admin', 'Employee', 'Owner'), getStoreDetails)
  .put(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), upload.single("logo"), updateStore)
  .delete(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), deleteStore);
router.post("/admin/store/new", isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), upload.single("logo"), newStore);
router.route('/admin/store/restore/:id')
  .get(isAuthenticatedUser, authorizeRoles('Admin', 'Employee'), restoreStore)

router.route('/admin/update-permit').patch(upload.single("image"), updatePermit);
router.route('/admin/update-contract').patch(pdfupload.single("file"), updateContract);

//////
router.route("/stores").get(allStores);




router.route('/admin/store/status/:id').put(updateStoreStatus);
module.exports = router;
