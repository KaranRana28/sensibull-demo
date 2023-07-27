const auth = require('../middleware/auth');
const { validate, validateModifyOrder, validateIdentifier, Order } = require('../models/order');
const response = require('../response_model/response');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const { placeOrder, modifyOrder, cancelOrder, checkOrderStatus } = require('../utils/sensibull-api');

/** place new order api */
router.post('/', auth, async (req, res) => {
   try {
      const { error } = validate(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      let data = req.body;
      var query = { symbol: data.symbol, user_id: req.user._id };

      let checkDuplicateOrder = await Order.findOne(query);
      if (checkDuplicateOrder) {
         let result = response.unProcessable("Order for this symbol already exists.");
         return res.status(result.code).send(result);
      }

      /** sensibull api call for place order */
      let orderObj = { symbol: data.symbol, quantity: data.quantity, order_tag: "order-" + data.symbol.toLowerCase() };
      let newOrder = await placeOrder(orderObj);

      data.createdAt = new Date();
      data.user_id = req.user._id;
      data.order_id = newOrder.order.order_id;
      data.order_tag = newOrder.order.order_tag;
      data.status = newOrder.order.status;
      data.filled_quantity = newOrder.order.filled_quantity;
      order = new Order(data);

      let addOrder = await order.save();
      let result = response.success("Order placed successfully.", addOrder);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

/** modify order api */
router.put('/', auth, async (req, res) => {
   try {
      const { error } = validateModifyOrder(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      let data = req.body;
      let order_id = data.identifier;
      let query = { order_id: order_id };

      let getOrder = await Order.findOne(query);
      if (!getOrder) {
         let result = response.notFound("Order not found.");
         return res.status(result.code).send(result);
      }
      if (getOrder && getOrder.status != 'open') {
         let result = response.unProcessable("Order can't be modify.");
         return res.status(result.code).send(result);
      }

      /** sensibull api call for modify order */
      let orderModifyObj = { identifier: order_id, quantity: data.new_quantity };
      let updateOrder = await modifyOrder(orderModifyObj);

      data.updatedAt = new Date();
      data.status = updateOrder.order.status;
      data.quantity = updateOrder.order.request_quantity;
      data.filled_quantity = updateOrder.order.filled_quantity;
      delete data.identifier;
      delete data.new_quantity;

      let updateOrderDB = await Order.findOneAndUpdate({ order_id: order_id }, { $set: data }, { new: true });
      let result = response.success("Order modify successfully.", updateOrderDB);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

/** cancel order api */
router.delete('/', auth, async (req, res) => {
   try {
      const { error } = validateIdentifier(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      let data = req.body;
      let order_id = data.identifier;
      let query = { order_id: order_id };

      let getOrder = await Order.findOne(query);
      if (!getOrder) {
         let result = response.notFound("Order not found.");
         return res.status(result.code).send(result);
      }
      if (getOrder && getOrder.status != 'open') {
         let result = response.unProcessable("Order can't be cancelled.");
         return res.status(result.code).send(result);
      }

      /** sensibull api call for cancel order */
      let orderCancelObj = { identifier: order_id };
      let deleteOrder = await cancelOrder(orderCancelObj);
      if (deleteOrder && deleteOrder.order.status != 'cancel') {
         let result = response.unProcessable("Something went wrong while cancelling order.");
         return res.status(result.code).send(result);
      }

      data.updatedAt = new Date();
      data.status = deleteOrder.order.status;
      data.quantity = deleteOrder.order.request_quantity;
      data.filled_quantity = deleteOrder.order.filled_quantity;
      delete data.identifier;

      let updateOrderDB = await Order.findOneAndUpdate({ order_id: order_id }, { $set: data }, { new: true });
      let result = response.success("Order cancelled successfully.", updateOrderDB);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message ? ex.message : ex.error);
      return res.status(result.code).send(result);
   }
})

/** status order api */
router.post('/status', auth, async (req, res) => {
   try {
      const { error } = validateIdentifier(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      let data = req.body;
      let order_id = data.identifier;
      let query = { order_id: order_id };

      let getOrder = await Order.findOne(query);
      if (!getOrder) {
         let result = response.notFound("Order not found.");
         return res.status(result.code).send(result);
      }

      let result = response.success("Order status get successfully.", getOrder);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message ? ex.message : ex.error);
      return res.status(result.code).send(result);
   }
})

module.exports = router;