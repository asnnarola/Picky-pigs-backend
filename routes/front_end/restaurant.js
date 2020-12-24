var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const Menu = require("../../models/menus");
const Category = require("../../models/category");
const Dish = require("../../models/dish");
const Cart = require("../../models/cart");
const RestaurantAdmin = require("../../models/restaurantAdmin");
const common_helper = require('../../helpers/common');
const config = require('../../config');
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
            }
        ];


        await RestaurantAdmin.aggregate(aggregate)
            .then(restaurantDetail => {
                res.status(config.OK_STATUS).json({ restaurantDetail, message: "Restaurant details get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });

    }
});


/**Find base on menu category to subcategory to dishes details */
router.post('/category_subcategory_dishes', async (req, res, next) => {
    try {
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
        aggregate.push({
            $group: {
                _id: "$_id",
                categoryName: { $first: "$name" },
                subcategories: { $push: "$subcategoriesDetail" }
            }
        });
        await Category.aggregate(aggregate)
            .then(categoryDetails => {
                res.status(config.OK_STATUS).json({ categoryDetails, message: "get category, subcategory and dishes list successfully" });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error while get category, subcategory and dishes list", error: err });

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
                res.status(config.OK_STATUS).json({ dishDetails, message: "Dish details get successfully" });
            }).catch(error => {
                console.log(error)
                res.status(config.BAD_REQUEST).json({ message: "Error while Dish details get", error: err });

            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error while Dish details get", error: err });

    }
});

module.exports = router;
