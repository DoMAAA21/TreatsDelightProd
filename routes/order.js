const express = require('express')
const router = express.Router();
const { newOrder,
    newInventoryOrder,
    orderTransaction,
    updateOrder
} = require('../controllers/orderController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')



router.route('/order/new').post(newOrder);
router.route('/order/new-inventory-order').post(newInventoryOrder);
router.route('/admin/store/:id/transactions').get(orderTransaction);
router.route('/admin/transaction/update').patch(updateOrder);

module.exports = router;