const { BASE_URL, PRIVATE_KEY } = process.env;
const axios = require("axios");
// var headers = { Authorization: "Basic " + Buffer.from(PRIVATE_KEY).toString("base64"), "Content-Type": "application/json", };
var headers = { 'X-AUTH-TOKEN': PRIVATE_KEY, "Content-Type": "application/json", };

/**
 * sensibull api call for place new order
 */
exports.placeOrder = (obj) =>
    new Promise(async (resolve, reject) => {
        try {
            let resData = await axios.post(BASE_URL + "place", obj, { headers: headers });
            let data = resData.data.payload;
            resolve(data);
        } catch (err) {
            let errBody = { error: err.response ? err.response.data ? err.response.data : err.response.data.error.message : err.message, code: err.response.status };
            return reject(errBody);
        }
    });

/**
 * sensibull api call for modify order
 */
exports.modifyOrder = (obj) =>
    new Promise(async (resolve, reject) => {
        try {
            let resData = await axios.put(BASE_URL + obj.identifier, { quantity: obj.quantity }, { headers: headers });
            let data = resData.data.payload;
            resolve(data);
        } catch (err) {
            let errBody = { error: err.response ? err.response.data ? err.response.data : err.response.data.error.message : err.message, code: err.response.status };
            return reject(errBody);
        }
    });

/**
 * sensibull api call for cancel order
 */
exports.cancelOrder = (obj) =>
    new Promise(async (resolve, reject) => {
        try {
            let resData = await axios.delete(BASE_URL + obj.identifier, { headers: headers });
            let data = resData.data.payload;
            resolve(data);
        } catch (err) {
            let errBody = { error: err.response ? err.response.data ? err.response.data : err.response.data.error.message : err.message, code: err.response.status };
            return reject(errBody);
        }
    });

/**
 * sensibull api call for cancel order
 */
exports.checkOrderStatus = (obj) =>
    new Promise(async (resolve, reject) => {
        try {
            let resData = await axios.post(BASE_URL + "status-for-ids", obj, { headers: headers });
            let data = resData.data.payload;
            resolve(data);
        } catch (err) {
            let errBody = { error: err.response ? err.response.data ? err.response.data : err.response.data.error.message : err.message, code: err.response.status };
            return reject(errBody);
        }
    });