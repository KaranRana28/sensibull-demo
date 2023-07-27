const express = require('express');
const users = require('../routes/user');
const order = require('../routes/order');

module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/user', users);
    app.use('/order-service', order);
}