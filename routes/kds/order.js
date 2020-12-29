var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const Menu = require("../../models/menus");
const Category = require("../../models/category");
const Dish = require("../../models/dish");
const Cart = require("../../models/cart");
const Order = require("../../models/order");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

/**Current order list */
router.post('/list', async (req, res, next) => {
    try {
        const totalCurrentOrders = await Order.countDocuments({ "status": "pending", orderTakenTime: { $gt: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }) } })
        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    "status": "pending",
                }
            },
            {
                $sort: {
                    orderTakenTime: 1
                }
            }
        ];
        const totalCount = await Order.aggregate(aggregate)

        if (req.body.startDate && req.body.endDate) {

            aggregate.push({
                $match:
                    { 'orderTakenTime': { $gt: new Date(req.body.startDate), $lt: new Date(req.body.endDate) } }
            });

        }

        if (req.body.start) {

            aggregate.push({
                "$skip": req.body.start
            });

        }

        if (req.body.length) {
            aggregate.push({
                "$limit": req.body.length
            });
        }

        await Order.aggregate(aggregate)
            .then(orderList => {
                res.status(config.OK_STATUS).json({ orderList, totalCount: totalCount.length, totalCurrentOrders: totalCurrentOrders, message: "Order list get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/history_list', async (req, res, next) => {
    try {

        // const totalCurrentOrders = await Order.countDocuments({ "status": "completed", orderTakenTime: { $gt: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }) } })

        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                }
            },
            {
                $sort: {
                    orderTakenTime: 1
                }
            }
        ];

        const totalCount = await Order.aggregate(aggregate)

        if (req.body.startDate && req.body.endDate) {

            aggregate.push({
                $match:
                    { 'orderTakenTime': { $gt: new Date(req.body.startDate), $lt: new Date(req.body.endDate) } }
            });

        }

        if (req.body.start) {

            aggregate.push({
                "$skip": req.body.start
            });

        }

        if (req.body.length) {
            aggregate.push({
                "$limit": req.body.length
            });
        }

        await Order.aggregate(aggregate)
            .then(orderList => {
                res.status(config.OK_STATUS).json({ orderList, totalCount: totalCount.length, message: "Order history list get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/complete_order', async (req, res, next) => {
    try {
        const update_order = await common_helper.update(Order, { "_id": req.body.orderId }, { status: "completed", orderCompletedTime: new Date() })

        if (update_order.status === 0) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(config.OK_STATUS).json({ update_order, message: "Complete order successfully." });
        } else if (update_order.data === null) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/cancel_order', async (req, res, next) => {
    try {
        const update_order = await common_helper.update(Order, { "_id": req.body.orderId }, { status: "cancel" })

        if (update_order.status === 0) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(config.OK_STATUS).json({ update_order, message: "cancel order successfully." });
        } else if (update_order.data === null) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/complete_order_dish', async (req, res, next) => {
    try {
        const obj = {
            "dishes.$.status": "completed"
        }
        const update_order = await common_helper.update(Order, { "_id": req.body.orderId, 'dishes._id': new ObjectId(req.body.dishItemId) }, { $set: obj })

        if (update_order.status === 0) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(config.OK_STATUS).json({ update_order, message: "Complete order successfully." });
        } else if (update_order.data === null) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        res.status(config.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/delete_order_dish', async (req, res, next) => {
    try {
        const obj = {
            "dishes.$.status": "delete"
        }
        const update_order = await common_helper.update(Order, { "_id": req.body.orderId, 'dishes._id': new ObjectId(req.body.dishItemId) }, { $set: obj })

        if (update_order.status === 0) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(config.OK_STATUS).json({ update_order, message: "Complete order successfully." });
        } else if (update_order.data === null) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        res.status(config.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/unavailable_order_dish', async (req, res, next) => {
    try {
        const obj = {
            "dishes.$.status": "unavailable"
        }
        const update_order = await common_helper.update(Order, { "_id": req.body.orderId, 'dishes._id': new ObjectId(req.body.dishItemId) }, { $set: obj })

        if (update_order.status === 0) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(config.OK_STATUS).json({ update_order, message: "Complete order successfully." });
        } else if (update_order.data === null) {
            res.status(config.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        res.status(config.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});



module.exports = router;
