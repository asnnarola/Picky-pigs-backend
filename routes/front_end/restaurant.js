var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const Menu = require("../../models/menus");
const Category = require("../../models/category");
const Dish = require("../../models/dish");
const Order = require("../../models/order");
const Cart = require("../../models/cart");
const RestaurantAdmin = require("../../models/restaurantAdmin");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

router.get('/info/:id', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    _id: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "restaurant_galleries",
                    localField: "_id",
                    foreignField: "restaurantAdminId",
                    as: "restaurant_galleries"
                }
            },
            {
                $unwind: "$restaurant_galleries"
            },
        ];


        await RestaurantAdmin.aggregate(aggregate)
            .then(restaurantDetail => {
                res.status(constants.OK_STATUS).json({ restaurantDetail, message: "Restaurant details get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });

    }
});


/**Find base on menu category to subcategory to dishes details */
/**Dishes filter and sort from frontend side */
router.post('/category_subcategory_dishes', async (req, res, next) => {
    try {
        if (req.body.allergen && req.body.allergen.length > 0) {
            req.body.allergen = req.body.allergen.map((element) => {
                return new ObjectId(element)
            })
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            req.body.dietary = req.body.dietary.map((element) => {
                return new ObjectId(element)
            })
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            req.body.lifestyle = req.body.lifestyle.map((element) => {
                return new ObjectId(element)
            })
        }
        let aggregate = [
            {
                $match: {
                    menuId: new ObjectId(req.body.menuId)
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "subcategoriesDetail"
                }
            },
            {
                $unwind: "$subcategoriesDetail"
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "subcategoriesDetail._id",
                    foreignField: "subcategoryId",
                    as: "subcategoriesDetail.dishesDetail"
                }
            },
            {
                $unwind: "$subcategoriesDetail.dishesDetail"
            }
        ];
        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                $match: {
                    "subcategoriesDetail.dishesDetail.name": RE
                }
            });
        }
        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "subcategoriesDetail.dishesDetail.allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "subcategoriesDetail.dishesDetail.dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "subcategoriesDetail.dishesDetail.lifestyleId": { $in: req.body.lifestyle } }
            });
        }



        aggregate.push({
            $group: {
                _id: "$_id",
                categoryName: { $first: "$name" },
                subcategories: { $push: "$subcategoriesDetail" }
            }
        });


        const totalCount = await Category.aggregate(aggregate)
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

        await Category.aggregate(aggregate)
            .then(categoryDetails => {
                res.status(constants.OK_STATUS).json({ categoryDetails, totalCount: totalCount.length, message: "get category, subcategory and dishes list successfully" });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get category, subcategory and dishes list", error: err });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get category, subcategory and dishes list", error: err });

    }
});


router.get('/dish_info/:id', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    _id: new ObjectId(req.params.id)
                }
            },
        ];
        await Dish.aggregate(aggregate)
            .then(dishDetails => {
                res.status(constants.OK_STATUS).json({ dishDetails, message: "Dish details get successfully" });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while Dish details get", error: err });

            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while Dish details get", error: err });

    }
});

/**Top pick dishes list into restaurant menu page */
router.post('/restaurant_top_pick_dishes', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    restaurantAdminId: new ObjectId(req.body.restaurantAdminId)
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "dishes.dishId",
                    as: "ordersDetail"
                }
            },
            {
                $project: {
                    dishDetail: "$$ROOT",
                    orderDetail: { $size: "$ordersDetail" }
                }
            },
            {
                $sort: {
                    orderDetail: -1
                }
            }
        ];
        await Dish.aggregate(aggregate)
            .then(dishList => {
                res.status(constants.OK_STATUS).json({ dishList, message: "Dish list get successfully" });
            }).catch(error => {
                res.status(constants.BAD_REQUEST).json({ message: "Error while Dish list get", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while Dish list get", error: err });

    }
});

module.exports = router;
