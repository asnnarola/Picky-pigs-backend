var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const Cart = require("../../models/cart");
const Order = require("../../models/order");
const OrderDish = require("../../models/orderDish");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');


router.post('/cart/add_dish', async (req, res, next) => {
    try {
        //find into the cart table base on the login user/table number
        const cart_resp = await Cart.findOne({ tableNo: req.body.tableNo });
        if (cart_resp) {
            const update_order = await common_helper.update(Cart, { "_id": cart_resp._id }, { itemTotalPrice: req.body.itemTotalPrice, $push: { dishes: req.body.dishes } })
            res.status(constants.OK_STATUS).json(update_order);
        } else {
            const data = await common_helper.insert(Cart, req.body);

            if (data.status === 1 && data.data) {
                res.status(constants.OK_STATUS).json(data);
            } else {
                res.status(constants.BAD_REQUEST).json(data);
            }
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while dish add to cart", error: err });

    }
});


router.post('/cart/change_quantity', async (req, res, next) => {
    try {
        const obj = {
            "dishes.$.orderQuantity": req.body.orderQuantity,
            "dishes.$.dishPrice": req.body.dishPrice,
            'itemTotalPrice': req.body.itemTotalPrice
        }
        const update_order = await common_helper.update(Cart, { "_id": req.body.cartId, 'dishes._id': new ObjectId(req.body.cartItemId) }, { $set: obj })
        if (update_order.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "Invalid request !" });
        }
        else {
            res.status(constants.OK_STATUS).json(update_order);
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while dish add to cart", error: err });

    }
});


router.post('/place_order', async (req, res, next) => {
    try {
        const cart_resp = await Cart.findOne({ tableNo: req.body.tableNo });
        if (cart_resp) {

            /** insert/remove order related field with cart object */
            let temp = Object.assign({}, cart_resp);
            let cartCloneDetail = temp._doc
            delete cartCloneDetail._id
            cartCloneDetail.orderTakenTime = new Date();
            cartCloneDetail.comment = req.body.comment;
            cartCloneDetail.fullName = req.body.fullName;
            const data = await common_helper.insert(Order, cartCloneDetail);

            /** insert/remove dishes array field was orderID and _id */
            let modifiedOrderDishes = []
            cartCloneDetail.dishes.filter(element => {
                let tempElement = Object.assign({}, element);
                let dishCloneDetail = tempElement._doc
                dishCloneDetail.orderId = data.data._id
                dishCloneDetail.restaurantAdminId = data.data.restaurantAdminId
                delete dishCloneDetail._id;
                modifiedOrderDishes.push(dishCloneDetail);
            })
            const insert_resp = await common_helper.insertMany(OrderDish, modifiedOrderDishes);

            if (data.status === 1 && data.data) {
                /**After place the order clear the cart records */
                // await Cart.remove({ tableNo: req.body.tableNo });
                res.status(constants.OK_STATUS).json({ data: data, message: "Place order successfully" });
            } else {
                res.status(constants.BAD_REQUEST).json(data);
            }
        } else {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "Your Cart was not found !" });
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while Place order", error: err });

    }
});


module.exports = router;
