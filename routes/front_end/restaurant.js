var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const common_helper = require("../../helpers/common");
const Category = require("../../models/category");
const Menu = require("../../models/menus");
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
            {
                $project: {
                    _id: 1,
                    name: 1,
                    about: 1,
                    info: 1,
                    restaurantCoverPhoto: 1,
                    restaurantProfilePhoto: 1,
                    restaurant_galleries: {
                        food: 1,
                        ambience: 1,
                        videos: 1
                    },
                    address: {
                        street: 1,
                        locality: 1,
                        pincode: 1,
                        zipcode: 1,
                        addLocationMap: 1,
                        shareLocationOption: 1,
                        getDirectionOption: 1,
                        googleAddress: 1,
                        map: 1,
                    },
                    restaurantDetails: {
                        bookings: 1,
                        openingTimings: 1,
                        socialMedia: 1,
                        website: 1

                    },
                    restaurantFeatures: {
                        averageCostOfTwoPerson: 1,
                        cardAccept: 1,
                        cashAccept: 1,
                        createdAt: 1,
                        inclusiveTaxesAndCharges: 1,
                        appliesOfRestaurant: 1,
                        restaurantFeaturesOptionsList: {
                            $map: {
                                input: "$restaurantFeatures.restaurantFeaturesOptionsList",
                                as: "singlerestaurantFeaturesOptionsList",
                                in: {
                                    'name': '$$singlerestaurantFeaturesOptionsList.name',
                                    'image': '$$singlerestaurantFeaturesOptionsList.image'

                                }
                            }
                        },
                        cuisineTypeList: {
                            $map: {
                                input: "$restaurantFeatures.cuisineTypeList",
                                as: "singlecuisineTypeList",
                                in: {
                                    'name': '$$singlecuisineTypeList.name',
                                    'image': '$$singlecuisineTypeList.image'

                                }
                            }
                        },
                    },
                    distance: 1
                }
            }
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
                    isDeleted: 0,
                    isActive: true,
                    restaurantId: new ObjectId(req.body.restaurantId),
                    type: "menu"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "menuId",
                    as: "categoriesDetail"
                }
            },
            {
                $unwind: "$categoriesDetail"
            },
            {
                $match: {
                    "categoriesDetail.isDeleted": 0,
                    "categoriesDetail.isActive": true,
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "categoriesDetail._id",
                    foreignField: "categoryId",
                    as: "categoriesDetail.subcategoriesDetail"
                }
            },
            {
                $unwind: "$categoriesDetail.subcategoriesDetail"
            },
            {
                $match: {
                    "categoriesDetail.subcategoriesDetail.isDeleted": 0,
                    "categoriesDetail.subcategoriesDetail.isActive": true,
                }
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "categoriesDetail.subcategoriesDetail._id",
                    foreignField: "subcategoryId",
                    as: "categoriesDetail.subcategoriesDetail.dishesDetail"
                }
            },
            {
                $unwind: "$categoriesDetail.subcategoriesDetail.dishesDetail"
            },
            {
                $match: {
                    "categoriesDetail.subcategoriesDetail.dishesDetail.isDeleted": 0,
                    "categoriesDetail.subcategoriesDetail.dishesDetail.isActive": true
                }
            },
            {
                $lookup: {
                    from: 'allergens',
                    localField: 'categoriesDetail.subcategoriesDetail.dishesDetail.allergenId',
                    foreignField: '_id',
                    as: 'categoriesDetail.subcategoriesDetail.dishesDetail.allergenList'
                }
            },
            {
                $lookup: {
                    from: 'dietaries',
                    localField: 'categoriesDetail.subcategoriesDetail.dishesDetail.dietaryId',
                    foreignField: '_id',
                    as: 'categoriesDetail.subcategoriesDetail.dishesDetail.dietaryList'
                }
            }
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                $match: {
                    "categoriesDetail.subcategoriesDetail.dishesDetail.name": RE
                }
            });
        }


        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "categoriesDetail.subcategoriesDetail.dishesDetail.allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "categoriesDetail.subcategoriesDetail.dishesDetail.dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "categoriesDetail.subcategoriesDetail.dishesDetail.lifestyleId": { $in: req.body.lifestyle } }
            });
        }

        if (req.body.sort && req.body.sort === "priceh2l") {
            aggregate.push({
                "$sort":
                    { "categoriesDetail.subcategoriesDetail.dishesDetail.price": -1 }
            });
        }
        if (req.body.sort && req.body.sort === "pricel2h") {
            aggregate.push({
                "$sort":
                    { "categoriesDetail.subcategoriesDetail.dishesDetail.price": 1 }
            });
        }

        aggregate.push({
            $group: {
                _id: "$categoriesDetail.subcategoriesDetail._id",
                subcategories: { $first: "$categoriesDetail.subcategoriesDetail" },
                categoryId: { $first: "$categoriesDetail._id" },
                categoryisDeleted: { $first: "$categoriesDetail.isDeleted" },
                categoryname: { $first: "$categoriesDetail.name" },
                categorymenuId: { $first: "$categoriesDetail.menuId" },
                categoryrestaurantId: { $first: "$categoriesDetail.restaurantId" },
                menuId: { $first: "$_id" },
                menuName: { $first: "$name" },
                dishes: { $push: "$categoriesDetail.subcategoriesDetail.dishesDetail" },
                count: { $sum: 1 }
            }
        });


        aggregate.push({
            $project: {
                _id: "$_id",
                subcategories: {
                    "_id": "$_id",
                    "name": "$subcategories.name",
                    "dishes": {
                        $map: {
                            input: "$dishes",
                            as: "singledishes",
                            in: {
                                '_id': '$$singledishes._id',
                                'name': '$$singledishes.name',
                                'new': '$$singledishes.new',
                                'image': '$$singledishes.image',
                                'description': '$$singledishes.description',
                                'price': '$$singledishes.price',
                                'priceUnit': '$$singledishes.priceUnit',
                                'customisable': '$$singledishes.customisable',
                                'dietaryList': {
                                    $map: {
                                        input: "$$singledishes.dietaryList",
                                        as: 'singleDietaryList',
                                        in: {
                                            "name": "$$singleDietaryList.name"
                                        }
                                    }
                                },
                                'allergenList': {
                                    $map: {
                                        input: "$$singledishes.allergenList",
                                        as: "singleAllergenList",
                                        in: {
                                            "name": "$$singleAllergenList.name",
                                            "image": "$$singleAllergenList.image",
                                        }
                                    }
                                },

                            }
                        }
                    },
                    countDishes: "$count",
                    maxDishPriceOfSingleSubcategory: { "$max": "$dishes.price" },
                    miniDishPriceOfSingleSubcategory: { "$min": "$dishes.price" }
                },
                categoryId: "$categoryId",
                categoryname: "$categoryname",
                menuId: "$menuId",
                menuName: "$menuName"
            }
        });

        if (req.body.sort && req.body.sort === "priceh2l") {
            aggregate.push({
                "$sort":
                    { "subcategories.maxDishPriceOfSingleSubcategory": -1 }
            });
        }
        if (req.body.sort && req.body.sort === "pricel2h") {
            aggregate.push({
                "$sort":
                    { "subcategories.miniDishPriceOfSingleSubcategory": 1 }
            });
        }
        /**Add Sorting code  */

        aggregate.push({
            $group: {
                _id: "$categoryId",
                categoryName: { $first: "$categoryname" },
                subcategories: { $push: "$subcategories" },
                menuId: { $first: "$menuId" },
                menuName: { $first: "$menuName" },
                countDishes: { $sum: "$subcategories.countDishes" },
                maxDishPriceOfSubCategory: { "$max": "$subcategories.maxDishPriceOfSingleSubcategory" },
                miniDishPriceOfSubCategory: { "$min": "$subcategories.miniDishPriceOfSingleSubcategory" }
            }
        });


        aggregate.push({
            $project: {
                _id: "$_id",
                categories: {
                    "_id": "$_id",
                    "name": "$categoryName",
                    "subcategories": "$subcategories",
                    countDishes: "$countDishes",
                    maxDishPriceOfSubcategory: { "$max": "$maxDishPriceOfSubCategory" },
                    miniDishPriceOfSubcategory: { "$min": "$miniDishPriceOfSubCategory" }
                },
                menuId: "$menuId",
                menuName: "$menuName"
            }
        });

        if (req.body.sort && req.body.sort === "priceh2l") {
            aggregate.push({
                "$sort":
                    { "categories.maxDishPriceOfSubcategory": -1 }
            });
        }
        if (req.body.sort && req.body.sort === "pricel2h") {
            aggregate.push({
                "$sort":
                    { "categories.miniDishPriceOfSubcategory": 1 }
            });
        }

        aggregate.push({
            $group: {
                _id: "$menuId",
                menuName: { $first: "$menuName" },
                categories: { $push: "$categories" },
                countDishes: { $sum: "$categories.countDishes" },
                maxDishPriceOfCategory: { "$max": "$categories.maxDishPriceOfSubcategory" },
                miniDishPriceOfCategory: { "$min": "$categories.miniDishPriceOfSubcategory" }
            }
        });

        if (req.body.sort && req.body.sort === "priceh2l") {
            aggregate.push({
                "$sort":
                    { "maxDishPriceOfCategory": -1 }
            });
        }
        if (req.body.sort && req.body.sort === "pricel2h") {
            aggregate.push({
                "$sort":
                    { "miniDishPriceOfCategory": 1 }
            });
        }

        await Menu.aggregate(aggregate)
            .then(menuList => {
                res.status(constants.OK_STATUS).json({ menuList, totalCount: menuList.length, message: "get category, subcategory and dishes list successfully" });
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
                    from: "restaurants",
                    localField: "restaurantId",
                    foreignField: "_id",
                    as: "restaurantsDetail"
                }
            },
            {
                $unwind: {
                    path: "$restaurantsDetail",
                    preserveNullAndEmptyArrays: true

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
                    from: "dish_features_options",
                    localField: "dish_features_optionId",
                    foreignField: "_id",
                    as: "dish_features_optionList"
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
                    restaurantName: "$rootData.restaurantsDetail.name",
                    restaurantId: "$rootData.restaurantsDetail._id",
                    available: "$rootData.available",
                    customisable: "$rootData.customisable",
                    name: "$rootData.name",
                    new: "$rootData.new",
                    price: "$rootData.price",
                    priceUnit: "$rootData.priceUnit",
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
                    dish_features_optionList: {
                        $map: {
                            input: "$rootData.dish_features_optionList",
                            as: "singledish_features_optionList",
                            in: {
                                "name": "$$singledish_features_optionList.name",
                                "image": "$$singledish_features_optionList.image"
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
                let dish_ingredientsArray = [];
                if (dishDetails.length > 0) {
                    if (dishDetails[0].ingredientSection !== undefined && dishDetails[0].ingredientSection.dish_ingredients.length > 0) {
                        for (let singleIngredient of dishDetails[0].ingredientSection.dish_ingredients) {
                            if (singleIngredient._id) {
                                dish_ingredientsArray.push(singleIngredient)
                            }
                        }
                        dishDetails[0].ingredientSection.dish_ingredients = dish_ingredientsArray
                    }
                }
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
                    favorite: true,
                    ...filterCondition
                }
            },
            {
                $lookup: {
                    from: "menus",
                    localField: "menuId",
                    foreignField: "_id",
                    as: "menuDetail"
                }
            },
            {
                $unwind: "$menuDetail"
            },
            {
                $match: {
                    "menuDetail.isDeleted": 0,
                    "menuDetail.isActive": true,
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryDetail"
                }
            },
            {
                $unwind: "$categoryDetail"
            },
            {
                $match: {
                    "categoryDetail.isDeleted": 0,
                    "categoryDetail.isActive": true,
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subcategoryId",
                    foreignField: "_id",
                    as: "subcategoryDetail"
                }
            },
            {
                $unwind: "$subcategoryDetail"
            },
            {
                $match: {
                    "subcategoryDetail.isDeleted": 0,
                    "subcategoryDetail.isActive": true,
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    favorite: { $first: "$favorite" },
                    new: { $first: "$new" },
                    price: { $first: "$price" },
                    priceUnit: { $first: "$priceUnit" },
                    image: { $first: "$image" },
                    description: { $first: "$description" }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$name",
                    favorite: "$favorite",
                    new: "$new",
                    price: "$price",
                    priceUnit: "$priceUnit",
                    image: "$image",
                    description: "$description",
                    customisable: "$customisable"
                }
            }
        ];

        if (req.body.sort && req.body.sort === "pricel2h") {
            aggregate.push({
                $sort: {
                    'price': 1
                }
            })
        }
        if (req.body.sort && req.body.sort === "priceh2l") {
            aggregate.push({
                $sort: {
                    'price': -1
                }
            })
        }
        await Dish.aggregate(aggregate)
            .then(dishList => {
                res.status(constants.OK_STATUS).json({ totalRecord: dishList.length, dishList, message: "Dish list get successfully" });
            }).catch(error => {
                res.status(constants.BAD_REQUEST).json({ message: "Error while Dish list get", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while Dish list get", error: err });

    }
});


/**Find base on menu category to subcategory to dishes details */
router.post('/test_category_subcategory_dishes', async (req, res, next) => {
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
                    isDeleted: 0,
                    isActive: true,
                    restaurantId: new ObjectId(req.body.restaurantId),
                    type: "menu"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "menuId",
                    as: "categoriesDetail"
                }
            },
            {
                $unwind: "$categoriesDetail"
            },
            {
                $match: {
                    "categoriesDetail.isDeleted": 0,
                    "categoriesDetail.isActive": true,
                }
            },

            {
                $lookup: {
                    from: "dishes",
                    localField: "categoriesDetail._id",
                    foreignField: "categoryId",
                    as: "categoriesDetail.dishesDetail"
                }
            },
            {
                $unwind: "$categoriesDetail.dishesDetail"
            },
            {
                $match: {
                    "categoriesDetail.dishesDetail.isDeleted": 0,
                    "categoriesDetail.dishesDetail.isActive": true
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "categoriesDetail.dishesDetail.subcategoryId",
                    foreignField: "_id",
                    as: "categoriesDetail.dishesDetail.subcategoriesDetail"
                }
            },
            {
                $unwind: {
                    path: "$categoriesDetail.dishesDetail.subcategoriesDetail",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $match: {
                    $or: [
                        {
                            $and: [
                                { "categoriesDetail.dishesDetail.subcategoriesDetail.isDeleted": 0 },
                                { "categoriesDetail.dishesDetail.subcategoriesDetail.isActive": true }
                            ]
                        },
                        { "categoriesDetail.dishesDetail.subcategoriesDetail.isDeleted": undefined },

                    ]
                }
            },
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                $match: {
                    "categoriesDetail.dishesDetail.name": RE
                }
            });
        }

        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "categoriesDetail.dishesDetail.allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "categoriesDetail.dishesDetail.dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "categoriesDetail.dishesDetail.lifestyleId": { $in: req.body.lifestyle } }
            });
        }

        if (req.body.sort && req.body.sort === "priceh2l") {
            aggregate.push({
                "$sort":
                    { "categoriesDetail.dishesDetail.price": -1 }
            });
        }
        if (req.body.sort && req.body.sort === "pricel2h") {
            aggregate.push({
                "$sort":
                    { "categoriesDetail.dishesDetail.price": 1 }
            });
        }

        aggregate.push(
            {
                $group: {
                    _id: "$categoriesDetail.dishesDetail.subcategoriesDetail._id",
                    subcategories: { $first: "$categoriesDetail.dishesDetail.subcategoriesDetail" },
                    categoryId: { $first: "$categoriesDetail._id" },
                    categoryisDeleted: { $first: "$categoriesDetail.isDeleted" },
                    categoryname: { $first: "$categoriesDetail.name" },
                    categorymenuId: { $first: "$categoriesDetail.menuId" },
                    menuId: { $first: "$_id" },
                    menuName: { $first: "$name" },
                    dishes: {
                        $push: "$categoriesDetail.dishesDetail"
                    },
                    count: { $sum: 1 }
                }
            }
        )

        aggregate.push(
            {
                $project: {
                    _id: "$_id",
                    subcategories: {
                        "_id": "$_id",
                        "name": "$subcategories.name",
                        "dishes": "$dishes",
                        countDishes: "$count",
                        maxDishPriceOfSingleSubcategory: { "$max": "$dishes.price" },
                        miniDishPriceOfSingleSubcategory: { "$min": "$dishes.price" }
                    },
                    categoryId: "$categoryId",
                    categoryname: "$categoryname",
                    menuId: "$menuId",
                    menuName: "$menuName"
                }
            }
        )

        if (req.body.sort && req.body.sort === "priceh2l") {
            aggregate.push({
                "$sort":
                    { "subcategories.maxDishPriceOfSingleSubcategory": -1 }
            });
        }
        if (req.body.sort && req.body.sort === "pricel2h") {
            aggregate.push({
                "$sort":
                    { "subcategories.miniDishPriceOfSingleSubcategory": 1 }
            });
        }

        aggregate.push({
            $group: {
                _id: "$categoryId",
                categoryName: { $first: "$categoryname" },
                subcategories: { $push: "$subcategories" },
                menuId: { $first: "$menuId" },
                menuName: { $first: "$menuName" },
                countDishes: { $sum: "$subcategories.countDishes" },
                maxDishPriceOfSubCategory: { "$max": "$subcategories.maxDishPriceOfSingleSubcategory" },
                miniDishPriceOfSubCategory: { "$min": "$subcategories.miniDishPriceOfSingleSubcategory" }
            }
        });

        aggregate.push({
            $project: {
                _id: "$_id",
                categories: {
                    "_id": "$_id",
                    "name": "$categoryName",
                    "subcategories": "$subcategories",
                    countDishes: "$countDishes",
                    maxDishPriceOfSubcategory: { "$max": "$maxDishPriceOfSubCategory" },
                    miniDishPriceOfSubcategory: { "$min": "$miniDishPriceOfSubCategory" }
                },
                menuId: "$menuId",
                menuName: "$menuName"
            }
        });

        if (req.body.sort && req.body.sort === "priceh2l") {
            aggregate.push({
                "$sort":
                    { "categories.maxDishPriceOfSubcategory": -1 }
            });
        }
        if (req.body.sort && req.body.sort === "pricel2h") {
            aggregate.push({
                "$sort":
                    { "categories.miniDishPriceOfSubcategory": 1 }
            });
        }

        aggregate.push({
            $group: {
                _id: "$menuId",
                menuName: { $first: "$menuName" },
                categories: { $push: "$categories" },
                countDishes: { $sum: "$categories.countDishes" },
                maxDishPriceOfCategory: { "$max": "$categories.maxDishPriceOfSubcategory" },
                miniDishPriceOfCategory: { "$min": "$categories.miniDishPriceOfSubcategory" }
            }
        });

        await Menu.aggregate(aggregate)
            .then(menuList => {
                res.status(constants.OK_STATUS).json({ menuList, totalCount: menuList.length, message: "get category, subcategory and dishes list successfully" });
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
module.exports = router;
