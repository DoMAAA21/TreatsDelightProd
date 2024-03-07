const Order = require('../models/Order');
const mongoose = require("mongoose");
const uuid = require('uuid');
const { ObjectId } = mongoose.Types;


exports.newOrder = async (req, res, next) => {
    const {
        orderItems,
        totalPrice,
        user,
        isReserve
    } = req.body;

    const newOrderItems = orderItems.map(item => ({
        ...item,
        id: uuid.v4() 
    }));

    try {
        const order = await Order.create({
            orderItems: newOrderItems, 
            totalPrice,
            paidAt: Date.now(),
            user: {
                id: user.id,
                name: user.name
            }
        });

        let qrCodeURL;
        if (isReserve) {
            qrCodeURL = order._id.toString();
        } else {
            qrCodeURL = null;
        }
        res.status(200).json({
            success: true,
            qrCodeURL,
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


exports.orderTransaction = async (req, res, next) => {
    const { id } = req.params;
    const storeId = new ObjectId(id);
    try {
        const transactions = await Order.aggregate([
            {
                $match: {
                    'orderItems.storeId': storeId
                }
            },
            {
                $unwind: '$orderItems'
            },
            {
                $match: {
                    'orderItems.storeId': storeId
                }
            },
            {
                $sort: {
                    createdAt: -1 // Sort by createdAt field in descending order (latest first)
                }
            }
        ]);
        res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.updateOrder = async (req, res, next) => {
    const { id } = req.body; 
    try {
        const order = await Order.findOne({ 'orderItems.id': id });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        const orderItemIndex = order.orderItems.findIndex(item => item.id === id);
        if (orderItemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Order item not found' });
        }

        const orderItem = order.orderItems[orderItemIndex];
        if(!orderItem.status){
            orderItem.status = 'Pending';
        }
        else if (orderItem.status === 'Pending') {
            orderItem.status = 'Paid';
        } else if (orderItem.status === 'Paid') {
            orderItem.status = 'Completed';
        } 


        await order.save();

        res.status(200).json({ success: true, message: 'Order item status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};









// exports.servicenewOrder = async (req, res, next) => {

//     //  console.log(req.user)

//     const {

//         orderItems,

//         shippingInfo,

//         itemsPrice,

//         taxPrice,

//         shippingPrice,

//         totalPrice,

//         paymentInfo,
//         // user



//     } = req.body;



//     const order = await Order.create({

//         orderItems,

//         shippingInfo,

//         itemsPrice,

//         taxPrice,

//         shippingPrice,

//         totalPrice,

//         paymentInfo,
//         type: 'Service',
//         paidAt: Date.now(),
       

//         user: req.body.userid
        
        

//     })



//     res.status(200).json({

//         success: true,

//         order

//     })

// }
// exports.getSingleOrder = async (req, res, next) => {

//     const order = await Order.findById(req.params.id).populate('user', 'name email')



//     if (!order) {

//         return next(new ErrorHandler('No Order found with this ID', 404))

//     }



//     res.status(200).json({

//         success: true,

//         order

//     })

// }




// exports.allOrders = async (req, res, next) => {

//     const orders = await Order.find()

//     // console.log(orders)

//     let totalAmount = 0;



//     orders.forEach(order => {



//         totalAmount += order.totalPrice

//     })



//     res.status(200).json({

//         success: true,

//         totalAmount,

//         orders

//     })

// }

// exports.updateOrder = async (req, res, next) => {

//     const order = await Order.findById(req.params.id)


//     console.log(res)

//     if (order.orderStatus === 'Delivered') {

//         return next(new ErrorHandler('You have already delivered this order', 400))

//     }

//     console.log(order.type)

//     if(!order.type || order.type != 'Service'){
//     order.orderItems.forEach(async item => {

//         await updateStock(item.product, item.quantity)

//     })
//     }




//     order.orderStatus = req.body.status

//         order.deliveredAt = Date.now()



//     await order.save()



//     res.status(200).json({

//         success: true,

//     })

// }

// async function updateStock(id, quantity) {

//     const product = await Product.findById(id);



//     product.stock = product.stock - quantity;



//     await product.save({ validateBeforeSave: false })

// }


// exports.deleteOrder = async (req, res, next) => {

//     const order = await Order.findById(req.params.id)



//     if (!order) {

//         return next(new ErrorHandler('No Order found with this ID', 404))

//     }



//     await order.deleteOne()



//     res.status(200).json({

//         success: true

//     })

// }

// exports.totalOrders = async (req, res, next) => {
//     const totalOrders = await Order.aggregate([
//         {
//             $group: {
//                 _id: null,
//                 count: { $sum: 1 }
//             }
//         }
//     ])
//     if (!totalOrders) {
//         return next(new ErrorHandler('error total orders', 404))

//     }
//     res.status(200).json({
//         success: true,
//         totalOrders
//     })

// }

// exports.totalSales = async (req, res, next) => {
//     const totalSales = await Order.aggregate([
//         {
//             $group: {
//                 _id: null,
//                 total: { $sum: "$totalPrice" }
//             }
//         }
//     ])
//     if (!totalSales) {
//         return next(new ErrorHandler('error total saless', 404))

//     }
//     res.status(200).json({
//         success: true,
//         totalSales
//     })

// }

// exports.customerSales = async (req, res, next) => {
//     const customerSales = await Order.aggregate([

//         {
//             $lookup: {
//                 from: 'users',
//                 localField: 'user',
//                 foreignField: '_id',
//                 as: 'userDetails'
//             },
//         },

//         // {
//         //     $group: {
//         //        _id: "$user",
//         //        total: { $sum: "$totalPrice" },


//         //     }
//         //   },

//         { $unwind: "$userDetails" },

//         {
//             $group: {
//                 _id: "$user",
//                 total: { $sum: "$totalPrice" },
//                 doc: { "$first": "$$ROOT" },

//             }
//         },

//         {
//             $replaceRoot: {
//                 newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
//             },
//         },
//         // {
//         //     $group: {
//         //         _id: "$userDetails.name",
//         //         total: { $sum: "$totalPrice" }
//         //     }
//         // },
//         { $sort: { total: -1 } },
//         {
//             $project: {
//                 _id: 0,
//                 "userDetails.name": 1,
//                 total: 1,

//             }
//         }

//     ])
//     if (!customerSales) {
//         return next(new ErrorHandler('error customer sales', 404))

//     }
//     // return console.log(customerSales)
//     res.status(200).json({
//         success: true,
//         customerSales
//     })

// }

// exports.salesPerMonth = async (req, res, next) => {
//     const salesPerMonth = await Order.aggregate([
//         {
//             $group: {
//                 _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
//                 total: { $sum: "$totalPrice" },
//             },
//         },

//         {
//             $addFields: {
//                 month: {
//                     $let: {
//                         vars: {
//                             monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', ' Sept', 'Oct', 'Nov', 'Dec']
//                         },
//                         in: {
//                             $arrayElemAt: ['$$monthsInString', "$_id.month"]
//                         }
//                     }
//                 }
//             }
//         },
//         { $sort: { "_id.month": 1 } },
//         {
//             $project: {
//                 _id: 1,
//                 month: 1,
               
//                 total: 1,

//             }
//         }

//     ])
//     if (!salesPerMonth) {
//         return next(new ErrorHandler('error sales per month', 404))

//     }
//     res.status(200).json({
//         success: true,
//         salesPerMonth
//     })

// }

// async function updateStock(id, quantity) {
//     const product = await Product.findById(id);
//     product.stock = product.stock - quantity;
//     await product.save({ validateBeforeSave: false })
// }


