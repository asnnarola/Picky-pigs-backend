var express = require('express');
const ObjectId = require('mongodb').ObjectID;
var router = express.Router();
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const Order = require('../../models/order');
const Dish = require('../../models/dish');
const validation_response = require('../../validation/validation_response');
const validation = require('../../validation/admin/validation');


router.post('/order_list', async (req, res, next) => {
    try {

        const aggregate = [
            {
                $match: {
                    isDeleted: 0
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
                    orderTakenTime: -1
                }
            },
            {
                $limit: 10
            }
        ];

        const totalOrder = await Order.aggregate(aggregate)

        await Order.aggregate(aggregate)
            .then(orderDetails => {
                res.status(constants.OK_STATUS).json({ orderDetails, totalOrder: totalOrder.length });
            }).catch(error => {
                res.status(constants.BAD_REQUEST).json({ message: "Error into order listing", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into order listing", error: err });

    }
});

router.get('/count_list', async (req, res, next) => {
    try {

        const totalOrder = await Order.countDocuments({ isDeleted: 0 });
        const totalDish = await Dish.countDocuments({ isDeleted: 0 });
        res.status(constants.OK_STATUS).json({ totalDish, totalOrder })
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into ", error: err });

    }
});


module.exports = router;