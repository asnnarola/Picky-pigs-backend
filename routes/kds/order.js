var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const OrderDish = require("../../models/orderDish");
const Order = require("../../models/order");
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');

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
                $lookup: {
                    from: "order_dishes",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "order_dishesDetail"
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
                res.status(constants.OK_STATUS).json({ orderList, totalCount: totalCount.length, totalCurrentOrders: totalCurrentOrders, message: "Order list get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get order list", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get order list", error: err });

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
                $lookup: {
                    from: "order_dishes",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "order_dishesDetail"
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
                res.status(constants.OK_STATUS).json({ orderList, totalCount: totalCount.length, message: "Order history list get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/complete_order', async (req, res, next) => {
    try {
        const update_order = await common_helper.update(Order, { "_id": req.body.orderId }, { status: "completed", orderCompletedTime: new Date() })

        if (update_order.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(constants.OK_STATUS).json({ update_order, message: "Complete order successfully." });
        } else if (update_order.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/cancel_order', async (req, res, next) => {
    try {
        const update_order = await common_helper.update(Order, { "_id": req.body.orderId }, { status: "cancel" })

        if (update_order.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(constants.OK_STATUS).json({ update_order, message: "cancel order successfully." });
        } else if (update_order.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/complete_order_dish', async (req, res, next) => {
    try {
        const obj = {
            "dishes.$.status": "completed"
        }
        // const update_order = await common_helper.update(Order, { "_id": req.body.orderId, 'dishes._id': new ObjectId(req.body.dishItemId) }, { $set: obj })
        const update_order = await common_helper.update(OrderDish, { "_id": req.body.orderDishId }, { status: "completed" })

        if (update_order.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(constants.OK_STATUS).json({ update_order, message: "Complete order successfully." });
        } else if (update_order.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/delete_order_dish', async (req, res, next) => {
    try {
        const obj = {
            "dishes.$.status": "delete"
        }
        // const update_order = await common_helper.update(Order, { "_id": req.body.orderId, 'dishes._id': new ObjectId(req.body.dishItemId) }, { $set: obj })
        const update_order = await common_helper.update(OrderDish, { "_id": req.body.orderDishId }, { status: "delete" })

        if (update_order.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(constants.OK_STATUS).json({ update_order, message: "Complete order successfully." });
        } else if (update_order.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});

router.post('/unavailable_order_dish', async (req, res, next) => {
    try {
        const obj = {
            "dishes.$.status": "unavailable"
        }
        // const update_order = await common_helper.update(Order, { "_id": req.body.orderId, 'dishes._id': new ObjectId(req.body.dishItemId) }, { $set: obj })
        const update_order = await common_helper.update(OrderDish, { "_id": req.body.orderDishId }, { status: "unavailable" })

        if (update_order.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }

        if (update_order.status === 1 && update_order.data) {
            res.status(constants.OK_STATUS).json({ update_order, message: "Complete order successfully." });
        } else if (update_order.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "No data found" });
        }
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while get order list", error: err });

    }
});



module.exports = router;
