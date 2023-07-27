const mongoose = require('mongoose');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
    order_id: { type: String, required: true }, // consider as identifier keyword for sensibull apis
    order_tag: { type: String },
    symbol: { type: String },
    quantity: { type: Number, default: 0 },
    filled_quantity: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'complete', 'error', 'cancel'] },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

function validateOrder(order) {
    const schema = Joi.object({
        symbol: Joi.string().min(3).required(),
        quantity: Joi.number().integer().min(1).required(),
    })
    return schema.validate(order);
}

function validateModifyOrder(order) {
    const schema = Joi.object({
        identifier: Joi.string().required(),
        new_quantity: Joi.number().integer().min(1).required(),
    })
    return schema.validate(order);
}

function validateIdentifier(order) {
    const schema = Joi.object({
        identifier: Joi.string().required(),
    })
    return schema.validate(order);
}

const Order = mongoose.model('Order', orderSchema);

exports.Order = Order;
exports.validate = validateOrder;
exports.validateModifyOrder = validateModifyOrder;
exports.validateIdentifier = validateIdentifier;