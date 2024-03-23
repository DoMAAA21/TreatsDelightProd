const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
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
            product: item._id,
            id: uuid.v4(),
            status: 'Paid',
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
    const { id, status } = req.body; 
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
        orderItem.status = status
        if(status === "Completed"){
            if(order?.user?.id){
                await global.io.timeout(1000).emit(`notification/${order.user.id}`, { type: 'success', message: 'Order completed' });
            }
            const notification = new Notification({
                message: `Your order item "${orderItem.name}" has been completed.".`,
                recipient: order.user.id,
                image: orderItem.image,
                webLink: "/me/my-orders",
                mobileLink: {
                    stack: "Profile",
                    screen: "MyOrder"
                }
            });
            notification.save();
        }

        if(status === "Incomplete"){
            if(order?.user?.id){
            await global.io.timeout(1000).emit(`notification/${order.user.id}`, { type: 'success', message: 'Incomplete Order' });
            }
            const notification = new Notification({
                message: `Incomplete order "${orderItem.name}".`,
                recipient: order.user.id,
                image: orderItem.image,
                webLink: "/me/my-orders",
                mobileLink: {
                    stack: "Profile",
                    screen: "MyOrder"
                }
            });
            notification.save();
        }

        await order.save();

        res.status(200).json({ success: true, message: 'Order item status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


exports.myOrder = async (req, res, next) => {
    const { id } = req.params;
    const userId = new ObjectId(id);
    try {
        const orders = await Order.aggregate([
            {
                $match: {
                    'user.id': userId
                }
            },
            {
                $unwind: '$orderItems'
            },
            {
                $match: {
                    'user.id': userId
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
            orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};



exports.scanUpdateOrder = async (req, res, next) => {
    const { id, storeId } = req.body; 
    const formattedStoreId = new ObjectId(storeId);
 
    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const allCompleted = order.orderItems.every(orderItem => orderItem.status === 'Completed');
        
        if (allCompleted) {
            
            await global.io.timeout(1000).emit(`notification/${order.user.id}`, { type: 'success', message: 'Order completed' });
            return res.status(400).json({ success: false, message: 'Order has already been scanned.' });
        }

        order.orderItems.forEach(orderItem => {
            if (orderItem.storeId.equals(formattedStoreId)) {
                orderItem.status = 'Completed';
        
                const notification = new Notification({
                    message: `Your order item "${orderItem.name}" has been completed.`,
                    recipient: order.user.id,
                    image: orderItem.image,
                    webLink: "/me/my-orders",
                    mobileLink: {
                        stack: "Profile",
                        screen: "MyOrder"
                    }
                });
                notification.save();
            }
        });

        if(order?.user?.id){
        await global.io.timeout(1000).emit(`notification/${order.user.id}`, { type: 'success', message: 'Order completed' });
        }
        await order.save();
        res.status(200).json({ success: true, message: 'Order item status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};




