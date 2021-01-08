var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const Cart = require("../../models/cart");
const CartDish = require("../../models/cartDish");
const Order = require("../../models/order");
const OrderDish = require("../../models/orderDish");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');


router.post('/cart/add_dish', async (req, res, next) => {
    try {
        //find into the cart table base on the login user/table number with restaurant id
        // const cart_resp = await Cart.findOne({ tableNo: req.body.tableNo });
        // if (cart_resp) {
        //     const update_order = await common_helper.update(Cart, { "_id": cart_resp._id }, { itemTotalPrice: req.body.itemTotalPrice, $push: { dishes: req.body.dishes } })
        //     res.status(constants.OK_STATUS).json(update_order);
        // } else {
        //     const data = await common_helper.insert(Cart, req.body);

        //     if (data.status === 1 && data.data) {
        //         res.status(constants.OK_STATUS).json(data);
        //     } else {
        //         res.status(constants.BAD_REQUEST).json(data);
        //     }
        // }




        const cart_resp = await Cart.findOne({ tableNo: req.body.tableNo });
        if (cart_resp) {
            const cart_dish_resp = await CartDish.findOne({ dishId: req.body.dishes.dishId, cartId: cart_resp._id });
            if (cart_dish_resp) {

                res.status(constants.BAD_REQUEST).json({ message: "This dish already added into cart." });
            } else {
                const update_order = await common_helper.update(Cart, { "_id": cart_resp._id }, { itemTotalPrice: req.body.itemTotalPrice })

                req.body.dishes.cartId = cart_resp._id;
                req.body.dishes.restaurantAdminId = cart_resp.restaurantAdminId;
                const insert_cart_dish = await common_helper.insert(CartDish, req.body.dishes);
                res.status(constants.OK_STATUS).json(update_order);

            }
        } else {
            const data = await common_helper.insert(Cart, req.body);
            req.body.dishes.cartId = data.data._id;
            req.body.dishes.restaurantAdminId = data.data.restaurantAdminId;
            const insert_cart_dish = await common_helper.insert(CartDish, req.body.dishes);
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

/**Remove dish from cart */
router.post('/cart/remove_dish', async (req, res, next) => {
    try {
        //find into the cart table base on the login user/table number with restaurant id
        const cart_resp = await Cart.findOne({ tableNo: req.body.tableNo });
        if (cart_resp) {
            const update_order = await common_helper.update(Cart, { "_id": cart_resp._id }, { itemTotalPrice: req.body.itemTotalPrice, $pull: { dishes: { _id: req.body.dishId } } })
            res.status(constants.OK_STATUS).json(update_order);
        } else {
            res.status(constants.BAD_REQUEST).json({ message: "cart not found" });
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
        //find into the cart table base on the login user/table number with restaurant id
        const cart_resp = await Cart.findOne({ tableNo: req.body.tableNo, restaurantAdminId: req.body.restaurantAdminId });
        if (cart_resp) {

            /** insert/remove order related field with cart object */
            // let temp = Object.assign({}, cart_resp);
            // let cartCloneDetail = temp._doc
            // delete cartCloneDetail._id
            // cartCloneDetail.orderTakenTime = new Date();
            // cartCloneDetail.comment = req.body.comment;
            // cartCloneDetail.customerName = req.body.customerName;
            // cartCloneDetail.agreeToContent = req.body.agreeToContent;
            // const data = await common_helper.insert(Order, cartCloneDetail);

            // /** insert/remove dishes array field was orderID and _id */
            // let modifiedOrderDishes = []
            // cartCloneDetail.dishes.filter(element => {
            //     let tempElement = Object.assign({}, element);
            //     let dishCloneDetail = tempElement._doc
            //     dishCloneDetail.orderId = data.data._id
            //     dishCloneDetail.restaurantAdminId = data.data.restaurantAdminId
            //     delete dishCloneDetail._id;
            //     modifiedOrderDishes.push(dishCloneDetail);
            // })
            // const insert_resp = await common_helper.insertMany(OrderDish, modifiedOrderDishes);

            // if (data.status === 1 && data.data) {
            //     /**After place the order clear the cart records */
            //     await Cart.remove({ tableNo: req.body.tableNo });
            //     res.status(constants.OK_STATUS).json({ data: data, message: "Place order successfully" });
            // } else {
            //     res.status(constants.BAD_REQUEST).json(data);
            // }





            /**Serprate cart and cartdish schema */

            /** insert/remove order related field with cart object */
            let cartCloneDetail = JSON.parse(JSON.stringify(cart_resp));
            
            delete cartCloneDetail._id
            cartCloneDetail.orderTakenTime = new Date();
            cartCloneDetail.comment = req.body.comment;
            cartCloneDetail.customerName = req.body.customerName;
            cartCloneDetail.agreeToContent = req.body.agreeToContent;
            const order_resp = await common_helper.insert(Order, cartCloneDetail);

            /** insert/remove dishes array field was orderID and _id */
            let modifiedOrderDishes = []
            const cart_dish_resp = await CartDish.find({ cartId: cart_resp._id });
            for (let singleResponse of cart_dish_resp) {

                let dishCloneDetail = JSON.parse(JSON.stringify(singleResponse));

                dishCloneDetail.orderId = order_resp.data._id
                dishCloneDetail.restaurantAdminId = order_resp.data.restaurantAdminId
                delete dishCloneDetail._id;
                modifiedOrderDishes.push(dishCloneDetail);
            }
            const insert_resp = await common_helper.insertMany(OrderDish, modifiedOrderDishes);

            if (order_resp.status === 1 && order_resp.data) {
                /**After place the order clear the cart records */
                // await Cart.remove({ tableNo: req.body.tableNo });
                // await CartDish.deleteMany({ cartId: cart_resp._id });
                res.status(constants.OK_STATUS).json({ order_resp, message: "Place order successfully" });
            } else {
                res.status(constants.BAD_REQUEST).json(order_resp);
            }

        } else {
            res.status(constants.BAD_REQUEST).json({ ...update_order, message: "Your Cart not found !" });
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while Place order", error: err });

    }
});

router.post('/cart_detail', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    tableNo: req.body.tableNo,
                    restaurantAdminId: ObjectId(req.body.restaurantAdminId)
                }
            },
            {
                $lookup: {
                    from: "cart_dishes",
                    localField: "_id",
                    foreignField: "cartId",
                    as: "cartDishesDetail"
                }
            },
        ];

        await Cart.aggregate(aggregate)
            .then(cartDetail => {
                res.status(constants.OK_STATUS).json({ cartDetail, message: "Cart details get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get cart details", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get cart details", error: err });

    }
});
module.exports = router;
