const express = require('express')
const router = express.Router();
const { ordersPerMonth,
    productsSold,
    salesPerMonth,
    electricityBillPerMonth,
    waterBillPerMonth,
    rentBillPerMonth,
    storeProductsSold,
    topStores,
    storeSalesCurrentMonth,
    storeSalesCurrentDay,
    allProductsSold,
    totalSalesValue,
    storeSalesPerDay,
    storeSalesPerMonth,
    getDynamicSalesData,
    getDynamicSoldData
} = require('../controllers/chartController')

router.route('/chart/orders-per-month').get(ordersPerMonth);
router.route('/chart/products-sold').get(productsSold);
router.route('/chart/sales-per-month').get(salesPerMonth);
router.route('/chart/store/:id/electricity-bill-per-month').get(electricityBillPerMonth);
router.route('/chart/store/:id/water-bill-per-month').get(waterBillPerMonth);
router.route('/chart/store/:id/rent-bill-per-month').get(rentBillPerMonth);
router.route('/chart/store/:id/products-sold').get(storeProductsSold);
router.route('/chart/store/:id/sales-current-month').get(storeSalesCurrentMonth);
router.route('/chart/store/:id/sales-current-day').get(storeSalesCurrentDay);
router.route('/chart/store/:id/sales-per-day').get(storeSalesPerDay);
router.route('/chart/store/:id/sales-per-month').get(storeSalesPerMonth);
router.route('/chart/store/:id/dynamic-sales').get(getDynamicSalesData);
router.route('/chart/store/:id/dynamic-sold').get(getDynamicSoldData);
router.route('/chart/top-stores').get(topStores);
router.route('/chart/all-products-sold').get(allProductsSold);
router.route('/chart/all-total-sale').get(totalSalesValue);
module.exports = router;