var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const Category = require("../../models/category");
const Dish = require("../../models/dish");
const Restaurant_adminModel = require("../../models/restaurantAdmin");
const Restaurant_addressModel = require("../../models/restaurant_address");
const config = require('../../config/config');
const constants = require('../../config/constants');


/**Get category and  subcategory base on the menu*/
router.post('/list', async (req, res, next) => {
    try {
        if (req.body.allergens) {

            req.body.allergens = req.body.allergens.map(element => {
                if (element) {
                    element = new ObjectId(element)
                }
                return element
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
                res.status(constants.OK_STATUS).json({ categoryDetails, message: "get category, subcategory and dishes list successfully" });
            }).catch(error => {
                console.log(error)
            });

    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into categories listing", error: err });

    }
});

/**Find dish base on the subcategry id */
router.get('/subcategory_product/:id', async (req, res, next) => {
    try {

        req.body.allergens = req.body.allergens.map(element => {
            if (element) {
                element = new ObjectId(element)
            }
            return element
        })
        req.body.dietaryPreferences = req.body.dietaryPreferences.map(element => {
            if (element) {
                element = new ObjectId(element)
            }
            return element
        })
        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    subcategoryId: new ObjectId(req.params.id)
                }
            }
        ];

        if (req.body.allergens && req.body.allergens != "") {

            aggregate.push({
                "$match":
                    { "allergenId": { $in: req.body.allergens } }
            });

        }
        if (req.body.dietaryPreferences && req.body.dietaryPreferences != "") {

            aggregate.push({
                "$match":
                    { "dietaryId": { $in: req.body.dietaryPreferences } }
            });

        }
        await Dish.aggregate(aggregate)
            .then(dishDetails => {
                res.status(constants.OK_STATUS).json(dishDetails);
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });

    }
});


/**Find category of subcategory list */
router.post('/category_subcategory_list', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
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

        ];

        await Category.aggregate(aggregate)
            .then(categoryDetails => {
                res.status(constants.OK_STATUS).json({ categoryDetails, message: "category and subcategoris get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into categories listing", error: err });

    }
});

/**Find favourite dishes base on the favourite field of the dish */
router.get('/favourite_dishes', async (req, res, next) => {
    try {

        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    favorite: true
                }
            }
        ];

        await Dish.aggregate(aggregate)
            .then(favouritedishDetails => {
                res.status(constants.OK_STATUS).json({ favouritedishDetails, message: "get favourite dishes listing successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error into favourite dishes listing", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into favourite dishes listing", error: err });

    }
});


module.exports = router;
