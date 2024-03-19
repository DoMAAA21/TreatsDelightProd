const Order = require('../models/Order');
const mongoose = require("mongoose");
const Electricity = require('../models/Electricity');
const Water = require('../models/Water');
const Rent = require('../models/Rent');
const { ObjectId } = mongoose.Types;

exports.ordersPerMonth = async (req, res, next) => {
  try {
    const salesData = await Order.aggregate([
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            order: '$_id',
          },
          totalOrderItems: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          totalOrderItems: { $sum: '$totalOrderItems' },
        },
      },
      {
        $sort: {
          '_id': 1,
        },
      },
    ]);

    res.json(salesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.productsSold = async (req, res, next) => {
  try {
    const salesData = await Order.aggregate([
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: '$orderItems.name',
          totalProductsSold: { $sum: '$orderItems.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          label: '$_id',
          value: '$totalProductsSold',
        },
      },
      {
        $sort: {
          value: -1,
        },
      },
      {
        $facet: {
          topProducts: [
            { $limit: 5 }, // Take the top 5 products
          ],
          others: [
            { $skip: 5 }, // Skip the top 5 products
          ],
        },
      },
      {
        $project: {
          data: {
            $concatArrays: ['$topProducts', [{ label: 'Others', value: { $sum: '$others.value' } }]],
          },
        },
      },
    ]);

    res.json(salesData[0].data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.salesPerMonth = async (req, res, next) => {
  try {
    const salesData = await Order.aggregate([
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            order: '$_id',
          },
          totalSales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          totalSales: { $sum: '$totalSales' },
        },
      },
      {
        $sort: {
          '_id': 1,
        },
      },
    ]);

    res.json(salesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.electricityBillPerMonth = async (req, res, next) => {
  const { id } = req.params;
  const storeId = new ObjectId(id);
  try {
    const billData = await Electricity.aggregate([
      {
        $match: {
          storeId: storeId,
          type: "paid",
          deletedAt: null
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$issuedAt' }, // Extract year
            month: { $month: '$issuedAt' } // Extract month
          },
          totalBill: { $sum: '$total' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year', // Project year
          month: '$_id.month', // Project month
          totalBill: { $abs: '$totalBill' }
        }
      },
      {
        $sort: { // Sort by year and month
          year: 1,
          month: 1
        }
      }
    ]);

    res.json(billData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.waterBillPerMonth = async (req, res, next) => {
  const { id } = req.params;
  const storeId = new ObjectId(id);
  try {
    const billData = await Water.aggregate([
      {
        $match: {
          storeId: storeId,
          type: "paid",
          deletedAt: null
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$issuedAt' }, // Extract year
            month: { $month: '$issuedAt' } // Extract month
          },
          totalBill: { $sum: '$total' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year', // Project year
          month: '$_id.month', // Project month
          totalBill: { $abs: '$totalBill' }
        }
      },
      {
        $sort: {
          year: 1,
          month: 1
        }
      }
    ]);

    res.json(billData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.rentBillPerMonth = async (req, res, next) => {
  const { id } = req.params;
  const storeId = new ObjectId(id);
  try {
    const billData = await Rent.aggregate([
      {
        $match: {
          storeId: storeId,
          type: "paid",

          deletedAt: null
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$issuedAt' }, // Extract year
            month: { $month: '$issuedAt' } // Extract month
          },
          totalBill: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year', // Project year
          month: '$_id.month', // Project month
          totalBill: { $abs: '$totalBill' }
        }
      },
      {
        $sort: {
          year: 1,
          month: 1
        }
      }
    ]);

    res.json(billData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.storeProductsSold = async (req, res, next) => {
  const { id } = req.params;
  const storeId = new ObjectId(id);
  try {
    const salesData = await Order.aggregate([
      {
        $unwind: '$orderItems',
      },
      {
        $match: {
          'orderItems.storeId': storeId,
        }
      },
      {
        $group: {
          _id: '$orderItems.name',
          totalProductsSold: { $sum: '$orderItems.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          label: '$_id',
          value: '$totalProductsSold',
        },
      },
      {
        $sort: {
          value: -1,
        },
      },
      {
        $facet: {
          topProducts: [
            { $limit: 5 }, // Take the top 5 products
          ],
          others: [
            { $skip: 5 }, // Skip the top 5 products
          ],
        },
      },
      {
        $project: {
          data: {
            $concatArrays: ['$topProducts', [{ label: 'Others', value: { $sum: '$others.value' } }]],
          },
        },
      },
    ]);

    res.json(salesData[0].data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.topStores = async (req, res, next) => {
  try {
    const topStores = await Order.aggregate([
      {
        $unwind: '$orderItems', 
      },
      {
        $group: {
          _id: '$orderItems.storeId', 
          totalProductsSold: { $sum: '$orderItems.quantity' },
        },
      },
      {
        $lookup: { 
          from: 'stores',
          localField: '_id',
          foreignField: '_id',
          as: 'store'
        }
      },
      {
        $match: {
          'store.deletedAt': null
        }
      },
      {
        $project: {
          _id: 0,
          label: { $arrayElemAt: ['$store.name', 0] },
          value: '$totalProductsSold',
        },
      },
      {
        $sort: {
          value: -1,
        },
      },
    ]);

    res.json(topStores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.storeSalesCurrentMonth = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const storeId = new ObjectId(id);
    const startDate = new Date();
    startDate.setDate(1); 
    startDate.setHours(0, 0, 0, 0); 

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); 
    const storeSalesCurrentMonth = await Order.aggregate([
      {
        $match: {
          'orderItems.storeId': storeId, 
          'createdAt': { $gte: startDate, $lte: endDate }, 
          'store.deletedAt': null
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } } // Calculate total revenue
        }
      }
    ]);

    res.json(storeSalesCurrentMonth[0] ? storeSalesCurrentMonth[0].totalRevenue : 0);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.storeSalesCurrentDay = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const storeId = new ObjectId(id);
    
    // Get the start and end of the current date
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0); // Set time to beginning of the day

    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999); // Set time to end of the day
    
    const storeSalesCurrentDate = await Order.aggregate([
      {
        $match: {
          'orderItems.storeId': storeId, 
          'createdAt': { $gte: startDate, $lte: endDate }, 
          'store.deletedAt': null
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } } // Calculate total revenue
        }
      }
    ]);

    res.json(storeSalesCurrentDate[0] ? storeSalesCurrentDate[0].totalRevenue : 0);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.allProductsSold = async (req, res, next) => {
  try {
    const totalProductsSold = await Order.aggregate([
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: null,
          totalProductsSold: { $sum: '$orderItems.quantity' }, // Count the total quantity of all order items
        },
      },
      {
        $project: {
          _id: 0,
          totalProductsSold: 1,
        },
      },
    ]);

    // Extracting the totalProductsSold value
    const total = totalProductsSold[0]?.totalProductsSold || 0; // Defaulting to 0 if totalProductsSold is not available

    res.json(total); // Return the total directly
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.totalSalesValue = async (req, res, next) => {
  try {
    const totalSalesValue = await Order.aggregate([
      {
        $unwind: '$orderItems',
      },
      {
        $group: {
          _id: null,
          totalSalesValue: { 
            $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } 
          }, 
        },
      },
      {
        $project: {
          _id: 0,
          totalSalesValue: 1,
        },
      },
    ]);

    const total = totalSalesValue[0]?.totalSalesValue || 0; 

    res.json(total); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




async function getStoreSalesPerDay(id, startDate, endDate) {
  try {
    const storeId = new mongoose.Types.ObjectId(id);

    // Find orders within the specified date range
    const orders = await Order.find({
      storeId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Initialize an object to store sales per day
    const salesPerDay = {};

    // Iterate through each order and aggregate sales per day
    orders.forEach(order => {
      const dayOfWeek = order.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
      if (!salesPerDay[dayOfWeek]) {
        salesPerDay[dayOfWeek] = 0;
      }
      salesPerDay[dayOfWeek] += order.totalPrice;
    });

    return salesPerDay;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

exports.storeSalesPerDay = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get start and end date for the current week (Monday to Sunday)
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Set to Monday of current week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday of current week

    // Retrieve sales per day for the current week
    const salesPerDay = await getStoreSalesPerDay(id, startOfWeek, endOfWeek);

    res.status(200).json({ success: true, salesPerDay });
  } catch (error) {
    console.error('Error fetching store products sold:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};





















