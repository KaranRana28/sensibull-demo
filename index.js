const express = require('express');
const pug = require('pug');
const config = require('config');
const app = express();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
var CronJob = require('cron').CronJob;
const { Order } = require('./models/order');
const { checkOrderStatus } = require('./utils/sensibull-api');

app.set('view engine', 'pug');
app.set('views', './views');

require('./startup/routes')(app)
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

var job = new CronJob('0/30 * * * * *',
    async function () {
        let order_ids = [];
        let getOrders = await Order.find({ status: 'open' });
        if (getOrders && getOrders.length > 0) {
            for (let i = 0; i < getOrders.length; i++) {
                let element = getOrders[i];
                order_ids.push(element.order_id);
            }

            /** sensibull api call for check open order status */
            let orderstatusObj = { order_ids: order_ids };
            let orderStatus = await checkOrderStatus(orderstatusObj);

            if (orderStatus && orderStatus.length > 0) {

                for (let i = 0; i < orderStatus.length; i++) {
                    let updateDataObj = {};
                    let order = orderStatus[i];
                    updateDataObj.updatedAt = new Date();
                    updateDataObj.status = order.status;
                    updateDataObj.quantity = order.request_quantity;
                    updateDataObj.filled_quantity = order.filled_quantity;

                    await Order.findOneAndUpdate({ order_id: order.order_id }, { $set: updateDataObj }, { new: true });
                }
            }
        }
    }, null, true);

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listing on port ${port}`));