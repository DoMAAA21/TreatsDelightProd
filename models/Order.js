const mongoose = require('mongoose');
const orderItemSchema = mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Product'
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Store'
    },
    storeName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    }
});

const orderSchema = mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'User',
        },
        name: {
            type: String,
            required: false,
        },
    },
    orderItems: [orderItemSchema],
    paymentType: {
        type: String,
        required: true,
        default: 'Online'
    },
    paidAt: {
        type: Date
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
