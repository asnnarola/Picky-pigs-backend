var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const Category = require("../../models/category");
const Dish = require("../../models/dish");
const Restaurant = require("../../models/restaurant");
const constants = require('../../config/constants');

router.get('/info/:id', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    userId: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "restaurant_galleries",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "restaurant_galleries"
                }
            },
            {
                $unwind: "$restaurant_galleries"
            },
            {
                $lookup: {
                    from: "restaurant_addresses",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "address"
                }
            },
            {
                $unwind: {
                    path: "$address",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_details",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "restaurantDetails"
                }
            },
            {
                $unwind: {
                    path: "$restaurantDetails",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_freatures",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "restaurantFeatures"
                }
            },
            {
                $unwind: {
                    path: "$restaurantFeatures",
                    preserveNullAndEmptyArrays: true

                }
            },
        ];


        await Restaurant.aggregate(aggregate)
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
                    menuId: new ObjectId(req.body.menuId),
                    isDeleted: 0
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
                $match: {
                    "subcategoriesDetail.isDeleted": 0
                }
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
            },
            {
                $match: {
                    "subcategoriesDetail.dishesDetail.isDeleted": 0
                }
            },
        ];

        if (req.body.sort && req.body.sort.price && req.body.sort.price == "l2h") {

            aggregate.push({
                "$sort":
                    { "subcategoriesDetail.dishesDetail.price": 1 }
            });

        }
        if (req.body.sort && req.body.sort.price && req.body.sort.price == "h2l") {

            aggregate.push({
                "$sort":
                    { "subcategoriesDetail.dishesDetail.price": -1 }
            });

        }

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
                _id: "$subcategoriesDetail._id",
                subcategories: { $first: "$subcategoriesDetail" },
                categoryId: { $first: "$_id" },
                categoryisDeleted: { $first: "$isDeleted" },
                categoryname: { $first: "$name" },
                categorymenuId: { $first: "$menuId" },
                categoryrestaurantId: { $first: "$restaurantId" },
                dishes: { $push: "$subcategoriesDetail.dishesDetail" }
                // dishes: {
                //     $push: {
                //         "name": "$subcategoriesDetail.dishesDetail.name",
                //         "price": "$subcategoriesDetail.dishesDetail.price"
                //     }
                // }
            }
        });

        aggregate.push({
            $project: {
                _id: "$_id",
                subcategories: {
                    "_id": "$_id",
                    "isDeleted": "$subcategories.isDeleted",
                    "name": "$subcategories.name",
                    "categoryId": "$subcategories.categoryId",
                    "restaurantId": "$subcategories.restaurantId",
                    "menuId": "$subcategories.menuId",
                    "createdAt": "$subcategories.createdAt",
                    "updatedAt": "$subcategories.updatedAt",
                    "dishes": "$dishes"
                },
                categoryId: "$categoryId",
                categoryisDeleted: "$categoryisDeleted",
                categoryname: "$categoryname",
                categorymenuId: "$categorymenuId",
                categoryrestaurantId: "$categoryrestaurantId",
            }
        });

        aggregate.push({
            $group: {
                _id: "$categoryId",
                categoryName: { $first: "$categoryname" },
                subcategories: { $push: "$subcategories" }
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
            {
                $lookup: {
                    from: "dish_caloriesandmacros",
                    localField: "_id",
                    foreignField: "dishId",
                    as: "caloriesandmacrosDetail"
                }
            },
            {
                $unwind: "$caloriesandmacrosDetail"
            },
            {
                $lookup: {
                    from: "dish_ingredients",
                    localField: "_id",
                    foreignField: "dishId",
                    as: "ingredientSection.dish_ingredients"
                }
            },
            {
                $lookup: {
                    from: "cooking_method",
                    localField: "cookingMethodId",
                    foreignField: "_id",
                    as: "cooking_methods"
                }
            },
            {
                $lookup: {
                    from: "allergens",
                    localField: "allergenId",
                    foreignField: "_id",
                    as: "allergensDetail"
                }
            },
        ];
        await Dish.aggregate(aggregate)
            .then(dishDetails => {
                res.status(constants.OK_STATUS).json({ dishDetails, message: "Dish details get successfully" });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while Dish details get", error: error });

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
                    restaurantId: new ObjectId(req.body.restaurantId)
                }
            },
            {
                $lookup: {
                    from: "order_dishes",
                    localField: "_id",
                    foreignField: "dishId",
                    as: "ordersDishDetail"
                }
            },
            {
                $project: {
                    dishDetail: "$$ROOT",
                    ordersDishDetail: { $size: "$ordersDishDetail" }
                }
            },
            {
                $sort: {
                    ordersDishDetail: -1
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
