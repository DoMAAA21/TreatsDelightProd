const Order = require('../models/Order');
const Product = require('../models/Product');
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

  

    try {

        for (const item of orderItems) {
            const product = await Product.findById(item._id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found`,
                });
            }
            if (!product.portion) {
                if (item.quantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient stock for product: ' + product.name,
                    });
                }
                product.stock -= item.quantity;
                await product.save();
            }
        }

        const newOrderItems = orderItems.map(item => ({
            ...item,
            id: uuid.v4() 
        }));

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

exports.newInventoryOrder = async (req, res, next) => {
    const {
        orderItems,
        totalPrice,
    } = req.body;
    try {
        for (const item of orderItems) {
            const product = await Product.findById(item._id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found`,
                });
            }
            if (!product.portion) {
                if (item.quantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient stock for product: ' + product.name,
                    });
                }
                product.stock -= item.quantity;
                await product.save();
            }
        }

        const newOrderItems = orderItems.map(item => ({
            ...item,
            status: 'Completed',
            id: uuid.v4() 
        }));

        const order = await Order.create({
            orderItems: newOrderItems, 
            totalPrice,
            paidAt: Date.now(),
        });

        res.status(200).json({
            success: true,
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
        else if (orderItem.status.toLowerCase() === 'pending') {
            orderItem.status = 'Paid';
        } else if (orderItem.status.toLowerCase() === 'paid') {
           
            orderItem.status = 'Completed';
        } else if(orderItem.status.toLowerCase() === 'completed'){
            orderItem.status = 'Incomplete'
        } else if (orderItem.status.toLowerCase() === 'incomplete'){
            orderItem.status = 'Pending'
        }


        await order.save();

        res.status(200).json({ success: true, message: 'Order item status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



