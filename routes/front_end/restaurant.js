var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const common_helper = require("../../helpers/common");
const Category = require("../../models/category");
const Dish = require("../../models/dish");
const Restaurant = require("../../models/restaurant");
const constants = require('../../config/constants');

router.post('/info/:id', async (req, res, next) => {
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
                    foreignField: "restaurantId",
                    as: "restaurant_galleries"
                }
            },
            {
                $unwind: {
                    path: "$restaurant_galleries",
                    preserveNullAndEmptyArrays: true

                }
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
                    from: "restaurant_features",
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
            {
                $lookup: {
                    from: "restaurant_features_options",
                    localField: "restaurantFeatures.restaurantFeaturesOptions",
                    foreignField: "_id",
                    as: "restaurantFeatures.restaurantFeaturesOptionsList"
                }
            },
            {
                $lookup: {
                    from: "cuisine_types",
                    localField: "restaurantFeatures.cuisineType",
                    foreignField: "_id",
                    as: "restaurantFeatures.cuisineTypeList"
                }
            },
        ];


        await Restaurant.aggregate(aggregate)
            .then(async restaurantDetail => {

                restaurantDetail = await common_helper.distanceCalculationAndFiler(req.body, restaurantDetail)

                await Restaurant.findByIdAndUpdate(req.params.id, { $inc: { pageViews: 1 } }, { new: true });
                res.status(constants.OK_STATUS).json({ restaurantDetail, message: "Restaurant details get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant Detail", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant Detail", error: err });

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
                    isDeleted: 0,
                    isActive: true,

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
                    "subcategoriesDetail.isDeleted": 0,
                    "subcategoriesDetail.isActive": true,
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
                $unwind: {
                    path: "$ingredientSection.dish_ingredients",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "allergens",
                    localField: "ingredientSection.dish_ingredients.allergeies",
                    foreignField: "_id",
                    as: "ingredientSection.dish_ingredients.allergeiesList"
                }
            },
            {
                $lookup: {
                    from: "cooking_methods",
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
            {
                $project: {
                    _id: "$_id",
                    rootData: "$$ROOT",
                    allergeiesList: {
                        $map: {
                            input: "$ingredientSection.dish_ingredients.allergeiesList",
                            as: "singledallergeiesList",
                            in: {
                                'name': '$$singledallergeiesList.name',
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    rootData: { $first: "$rootData" },
                    dish_ingredients: {
                        $push: {
                            _id: "$rootData.ingredientSection.dish_ingredients._id",
                            item: "$rootData.ingredientSection.dish_ingredients.item",
                            qty: "$rootData.ingredientSection.dish_ingredients.qty",
                            customisable: "$rootData.ingredientSection.dish_ingredients.customisable",
                            dishId: "$rootData.ingredientSection.dish_ingredients.dishId",
                            allergeiesList: "$allergeiesList"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    new: "$rootData.new",
                    available: "$rootData.available",
                    customisable: "$rootData.customisable",
                    name: "$rootData.name",
                    price: "$rootData.price",
                    description: "$rootData.description",
                    ingredientSection: {
                        total: "$rootData.ingredientSection.total",
                        dish_ingredients: "$dish_ingredients"
                    },
                    image: "$rootData.image",
                    caloriesandmacrosDetail: "$rootData.caloriesandmacrosDetail",
                    cooking_methods: {
                        $map: {
                            input: "$rootData.cooking_methods",
                            as: "singlecooking_methods",
                            in: {
                                '_id': '$$singlecooking_methods._id',
                                'name': '$$singlecooking_methods.name',
                                'image': '$$singlecooking_methods.image',
                                'description': '$$singlecooking_methods.description',
                            }
                        }
                    },
                    allergensDetail: {
                        $map: {
                            input: "$rootData.allergensDetail",
                            as: "singleallergensDetail",
                            in: {
                                '_id': '$$singleallergensDetail._id',
                                'name': '$$singleallergensDetail.name',
                                'image': '$$singleallergensDetail.image',
                                'description': '$$singleallergensDetail.description',
                            }
                        }
                    },
                }
            }

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
        let filterCondition = {}

        if (req.body.allergen && req.body.allergen.length > 0) {
            req.body.allergen = req.body.allergen.map((element) => {
                return new ObjectId(element)
            })
            filterCondition = { "allergenId": { $in: req.body.allergen } }
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            req.body.dietary = req.body.dietary.map((element) => {
                return new ObjectId(element)
            })
            filterCondition = { ...filterCondition, "dietaryId": { $in: req.body.dietary } }
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            req.body.lifestyle = req.body.lifestyle.map((element) => {
                return new ObjectId(element)
            })
            filterCondition = { ...filterCondition, "lifestyleId": { $in: req.body.lifestyle } }
        }
        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            filterCondition = { ...filterCondition, "name": RE }
        }

        console.log("filterCondition : ", filterCondition)
        let aggregate = [
            {
                $match: {
                    restaurantId: new ObjectId(req.body.restaurantId),
                    isDeleted: 0,
                    isActive: true,
                    ...filterCondition
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

        if (req.body.sort && req.body.sort.price && req.body.sort.price == 'l2h') {
            aggregate.push({
                $sort: {
                    'dishDetail.price': 1
                }
            })
        }
        if (req.body.sort && req.body.sort.price && req.body.sort.price == 'h2l') {
            aggregate.push({
                $sort: {
                    'dishDetail.price': -1
                }
            })
        }
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
