var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const Dish = require("../../models/dish");
const Restaurant = require("../../models/restaurant");
const constants = require('../../config/constants');
const common_helper = require('../../helpers/common')



const distanceCalculationAndFiler = async (body, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let tempArray = [];
            const userCoordinates = body.userCoordinates || [21.193455, 72.802080]
            for (let singleList of data) {
                let singleclone = JSON.parse(JSON.stringify(singleList));
                console.log("singleList.address : ", singleList.address)
                if (singleList.address !== null && singleList.address !== undefined && singleList.address.map !== undefined && singleList.address.map.coordinates.length == 2) {
                    const coordinates = singleList.address.map.coordinates;
                    let distance_resp = await common_helper.getDistance(coordinates[0], coordinates[1], userCoordinates[0], userCoordinates[1]);
                    singleclone.distance = distance_resp;
                } else {
                    singleclone.distance = {
                        text: "null",
                        value: null
                    }
                }
                tempArray.push(singleclone)
            }

            if (body.distance && body.distance !== null) {
                tempArray = tempArray.filter(singleElement => {
                    if (singleElement.distance.value < body.distance) {
                        return singleElement;
                    }
                })
            }
            resolve(tempArray)
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
}

/**page no 3 */
/** Distance filter are remaning */
router.post('/restaurantlist', async (req, res, next) => {
    try {

        // if (req.body.allergen && req.body.allergen.length > 0) {
        //     req.body.allergen = req.body.allergen.map((element) => {
        //         return new ObjectId(element)
        //     })
        // }
        // if (req.body.dietary && req.body.dietary.length > 0) {
        //     req.body.dietary = req.body.dietary.map((element) => {
        //         return new ObjectId(element)
        //     })
        // }
        // if (req.body.lifestyle && req.body.lifestyle.length > 0) {
        //     req.body.lifestyle = req.body.lifestyle.map((element) => {
        //         return new ObjectId(element)
        //     })
        // }
        let aggregate = [
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
                    from: "dishes",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "dishesList"
                }
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "dishesDetails"
                }
            },
            {
                $unwind: {
                    path: "$dishesDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "reviewDetail"
                }
            }
        ];

        if (req.body.styleOfmenu && req.body.styleOfmenu != "") {
            aggregate.push(
                {
                    $lookup: {
                        from: "menus",
                        localField: "_id",
                        foreignField: "restaurantId",
                        as: "menusList"
                    }
                },
                {
                    "$match": { "menusList.styleOfmenu": req.body.search, "menusList.isDeleted": 0 },
                }
            )
        }

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                "$match":
                {
                    $or: [
                        { "name": RE },
                        // { "restaurantInfo.restaurantFeatures.cuisineType": RE }
                    ]
                }
            });
        }

        /**If need to filter today day with restaurant open day */
        if (req.body.openingTimings && req.body.openingTimings.length > 0) {
            aggregate.push({
                "$match":
                    { "restaurantDetails.openingTimings.time.day": moment().format("dddd") }
            });
        }

        if (req.body.features && req.body.features.length > 0) {

            aggregate.push({
                "$match":
                    { "restaurantFeatures.restaurantFeaturesOptions": { $in: req.body.features } }
            });

        }


        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "dishesDetails.allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "dishesDetails.dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "dishesDetails.lifestyleId": { $in: req.body.lifestyle } }
            });
        }

        aggregate.push({
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                restaurantProfilePhoto: { $first: "$restaurantProfilePhoto" },
                averageCostOfTwoPerson: { $first: "$restaurantFeatures.averageCostOfTwoPerson" },
                restaurantFeaturesOptions: { $first: "$restaurantFeatures.restaurantFeaturesOptions" },
                address: { $first: "$address" },
                totaldish: { $first: "$dishesList" },
                filterdish: { $push: "$dishesDetails" },
                restaurantRate: { $avg: "$reviewDetail.rate" }
            }
        });

        aggregate.push({
            $project: {
                _id: "$_id",
                name: "$name",
                restaurantProfilePhoto: "$restaurantProfilePhoto",
                averageCostOfTwoPerson: "$averageCostOfTwoPerson",
                restaurantFeaturesOptions: "$restaurantFeaturesOptions",
                address: "$address",
                totaldish: {
                    $filter: {
                        input: "$totaldish",
                        as: "singleTotalDish",
                        cond: {
                            $and: [
                                { $eq: ["$$singleTotalDish.isDeleted", 0] },
                            ]
                        }
                    }
                },
                filterdish: {
                    $filter: {
                        input: "$filterdish",
                        as: "singleFilterDish",
                        cond: {
                            $and: [
                                { $eq: ["$$singleFilterDish.isDeleted", 0] },
                            ]
                        }
                    }
                },
                // restaurantRate: { $avg: "$reviewDetail.rate" }
            }
        });
        aggregate.push({
            $project: {
                _id: "$_id",
                name: "$name",
                restaurantProfilePhoto: "$restaurantProfilePhoto",
                averageCostOfTwoPerson: "$averageCostOfTwoPerson",
                restaurantFeaturesOptions: "$restaurantFeaturesOptions",
                address: "$address",
                totaldish: "$totaldish",
                filterdish: "$filterdish",
                // relevance: { $divide: [{ $size: "$filterdish" }, { $size: "$totaldish" }] },
                relevance: { $cond: [{ $eq: [{ $size: "$totaldish" }, 0] }, 0, { "$divide": [{ $size: "$filterdish" }, { $size: "$totaldish" }] }] },
                restaurantRate: { $avg: "$reviewDetail.rate" }
            }
        });


        if (req.body.sort && req.body.sort.price && req.body.sort.price == "l2h") {

            aggregate.push({
                "$sort":
                    { "averageCostOfTwoPerson": 1 }
            });

        }
        if (req.body.sort && req.body.sort.price && req.body.sort.price == "h2l") {

            aggregate.push({
                "$sort":
                    { "averageCostOfTwoPerson": -1 }
            });

        }
        if (req.body.sort && req.body.sort.popularity && req.body.sort.popularity == "h2l") {

            aggregate.push({
                "$sort":
                    { "restaurantRate": -1 }
            });

        }
        if (req.body.sort && req.body.sort.relevance && req.body.sort.relevance == "h2l") {

            aggregate.push({
                "$sort":
                    { "relevance": -1 }
            });

        }


        await Restaurant.aggregate(aggregate)
            .then(async restaurantList => {

                let tempArray = await distanceCalculationAndFiler(req.body, restaurantList)

                if (req.body.sort && req.body.sort.distance && req.body.sort.distance == "l2h") {
                    tempArray.sort(function (a, b) { return a.distance.value - b.distance.value });
                }

                const pagination_resp = await common_helper.pagination(tempArray, req.body.start, req.body.length)
                res.status(constants.OK_STATUS).json({ ...pagination_resp, message: "Restaurant list get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });

    }
});

/**page no 3 */
/** Distance filter are remaning */
router.post('/disheslist', async (req, res, next) => {
    try {
        // if (req.body.allergen && req.body.allergen.length > 0) {
        //     req.body.allergen = req.body.allergen.map((element) => {
        //         return new ObjectId(element)
        //     })
        // }
        // if (req.body.dietary && req.body.dietary.length > 0) {
        //     req.body.dietary = req.body.dietary.map((element) => {
        //         return new ObjectId(element)
        //     })
        // }
        // if (req.body.lifestyle && req.body.lifestyle.length > 0) {
        //     req.body.lifestyle = req.body.lifestyle.map((element) => {
        //         return new ObjectId(element)
        //     })
        // }
        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                }
            },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurantId",
                    foreignField: "_id",
                    as: "restaurantInfo"
                }
            },
            {
                $unwind: "$restaurantInfo"
            },
            {
                $match: {
                    "restaurantInfo.isDeleted": 0,
                }
            },
            {
                $lookup: {
                    from: "restaurant_addresses",
                    localField: "restaurantId",
                    foreignField: "restaurantId",
                    as: "restaurantInfo.address"
                }
            },
            {
                $unwind: {
                    path: "$restaurantInfo.address",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_features",
                    localField: "restaurantId",
                    foreignField: "restaurantId",
                    as: "restaurantInfo.restaurantFeatures"
                }
            },
            {
                $unwind: {
                    path: "$restaurantInfo.restaurantFeatures",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "restaurantInfo._id",
                    foreignField: "restaurantId",
                    as: "restaurantDishes"
                }
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "restaurantInfo._id",
                    foreignField: "restaurantId",
                    as: "restaurantTotalDishes"
                }
            },
            {
                $unwind: {
                    path: "$restaurantDishes",
                    preserveNullAndEmptyArrays: true
                }
            }
        ];

        if (req.body.styleOfmenu && req.body.styleOfmenu != "") {
            aggregate.push(
                {
                    $lookup: {
                        from: "menus",
                        localField: "restaurantInfo._id",
                        foreignField: "restaurantId",
                        as: "menusList"
                    }
                },
                {
                    "$match": { "menusList.styleOfmenu": req.body.search, "menusList.isDeleted": 0 },
                }
            )
        }


        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                "$match":
                {
                    $or: [
                        { "name": RE, "restaurantDishes.name": RE },
                        // { "itemSection.item.name": RE }
                    ]
                }
            });
        }

        if (req.body.features && req.body.features.length > 0) {

            aggregate.push({
                "$match":
                    { "restaurantInfo.restaurantFeatures.restaurantFeaturesOptions": { $in: req.body.features } }
            });

        }
        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "allergenId": { $in: req.body.allergen }, "restaurantDishes.allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "dietaryId": { $in: req.body.dietary }, "restaurantDishes.dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "lifestyleId": { $in: req.body.lifestyle }, "restaurantDishes.lifestyleId": { $in: req.body.lifestyle } }
            });
        }



        aggregate.push({
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                dishPhoto: { $first: "$image" },
                dishPrice: { $first: "$price" },
                restaurantFeaturesOptions: { $first: "$restaurantInfo.restaurantFeatures.restaurantFeaturesOptions" },
                address: { $first: "$restaurantInfo.address" },
                filterdish: { $push: "$restaurantDishes" },
                totaldish: { $first: "$restaurantTotalDishes" },
            }
        });

        aggregate.push({
            $project: {
                _id: "$_id",
                name: "$name",
                dishPhoto: "$dishPhoto",
                dishPrice: "$dishPrice",
                restaurantFeaturesOptions: "$restaurantFeaturesOptions",
                address: "$address",
                totaldish: {
                    $filter: {
                        input: "$totaldish",
                        as: "singleTotalDish",
                        cond: {
                            $and: [
                                { $eq: ["$$singleTotalDish.isDeleted", 0] },
                            ]
                        }
                    }
                },
                filterdish: {
                    $filter: {
                        input: "$filterdish",
                        as: "singleDish",
                        cond: {
                            $and: [
                                { $eq: ["$$singleDish.isDeleted", 0] },
                            ]
                        }
                    }
                },
                // restaurantRate: { $avg: "$reviewDetail.rate" }
            }
        });

        aggregate.push({
            $project: {
                _id: "$_id",
                name: "$name",
                dishPhoto: "$dishPhoto",
                dishPrice: "$dishPrice",
                restaurantFeaturesOptions: "$restaurantFeaturesOptions",
                address: "$address",
                totaldish: "$totaldish",
                filterdish: "$filterdish",
                relevance: { $cond: [{ $eq: [{ $size: "$totaldish" }, 0] }, 0, { "$divide": [{ $size: "$filterdish" }, { $size: "$totaldish" }] }] },
                // restaurantRate: { $avg: "$reviewDetail.rate" }
            }
        });

        if (req.body.sort && req.body.sort.price && req.body.sort.price == "l2h") {

            aggregate.push({
                "$sort":
                    { "price": 1 }
            });

        }
        if (req.body.sort && req.body.sort.price && req.body.sort.price == "h2l") {

            aggregate.push({
                "$sort":
                    { "price": -1 }
            });

        }

        if (req.body.sort && req.body.sort.relevance && req.body.sort.relevance == "h2l") {

            aggregate.push({
                "$sort":
                    { "relevance": -1 }
            });

        }

        await Dish.aggregate(aggregate)
            .then(async dishesList => {

                let tempArray = await distanceCalculationAndFiler(req.body, dishesList)


                if (req.body.sort && req.body.sort.distance && req.body.sort.distance == "l2h") {
                    tempArray.sort(function (a, b) { return a.distance.value - b.distance.value });
                }
                const pagination_resp = await common_helper.pagination(tempArray, req.body.start, req.body.length)


                res.status(constants.OK_STATUS).json({ ...pagination_resp, message: "Dish list get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Dish list", error: error });
            });
    }
    catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Dish list", error: err });

    }
});

/**page no 1 */
router.post('/page_1_dishes', async (req, res, next) => {
    try {
        const optionCondition = (req.body.option === "new") ? { new: true } : { favorite: true }

        let aggregate = [
            {
                $match: {
                    ...optionCondition,
                    isDeleted: 0,
                }
            },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurantId",
                    foreignField: "_id",
                    as: "restaurantInfo"
                }
            },
            {
                $unwind: "$restaurantInfo"
            },
            {
                $match: {
                    "restaurantInfo.isDeleted": 0,
                }
            },
            {
                $lookup: {
                    from: "restaurant_addresses",
                    localField: "restaurantId",
                    foreignField: "restaurantId",
                    as: "restaurantInfo.address"
                }
            },
            {
                $unwind: {
                    path: "$restaurantInfo.address",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_features",
                    localField: "restaurantId",
                    foreignField: "restaurantId",
                    as: "restaurantInfo.restaurantFeatures"
                }
            },
            {
                $unwind: {
                    path: "$restaurantInfo.restaurantFeatures",
                    preserveNullAndEmptyArrays: true

                }
            }
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                "$match":
                {
                    $or: [
                        { "name": RE }
                    ]
                }
            });
        }

        if (req.body.features && req.body.features.length > 0) {

            aggregate.push({
                "$match":
                    { "restaurantInfo.restaurantFeatures.restaurantFeaturesOptions": { $in: req.body.features } }
            });

        }
        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "allergenId": { $in: req.body.allergen }, "restaurantDishes.allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "dietaryId": { $in: req.body.dietary }, "restaurantDishes.dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "lifestyleId": { $in: req.body.lifestyle }, "restaurantDishes.lifestyleId": { $in: req.body.lifestyle } }
            });
        }


        aggregate.push({
            $project: {
                _id: "$_id",
                name: "$name",
                dishPhoto: "$image",
                dishPrice: "$price",
                favorite: "$favorite",
                new: "$new",
                restaurantId: "$restaurantInfo._id",
                restaurantFeaturesOptions: "$restaurantInfo.restaurantFeatures.restaurantFeaturesOptions",
                address: "$restaurantInfo.address"
            }
        });

        Dish.aggregate(aggregate)
            .then(async dishList => {

                let tempArray = await distanceCalculationAndFiler(req.body, dishList)

                if (req.body.sort && req.body.sort.distance && req.body.sort.distance == "l2h") {
                    tempArray.sort(function (a, b) { return a.distance.value - b.distance.value });
                }
                const pagination_resp = await common_helper.pagination(tempArray, req.body.start, req.body.length)

                res.status(constants.OK_STATUS).json({ ...pagination_resp, message: "Dish list get successfully." });

            })
            .catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Dish list", error: error });
            })
    }
    catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Dish list", error: err });

    }
});


/**page no 1 for restaurants list*/
/**Top pick are remaning */
router.post('/page_1_restaurants', async (req, res, next) => {
    try {
        let aggregate = [
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
                    from: "dishes",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "dishesDetails"
                }
            },
            {
                $unwind: {
                    path: "$dishesDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            // {
            //     $lookup: {
            //         from: "reviews",
            //         localField: "_id",
            //         foreignField: "restaurantId",
            //         as: "reviewDetail"
            //     }
            // }
        ];

        if (req.body.styleOfmenu && req.body.styleOfmenu != "") {
            aggregate.push(
                {
                    $lookup: {
                        from: "menus",
                        localField: "_id",
                        foreignField: "restaurantId",
                        as: "menusList"
                    }
                },
                {
                    "$match": { "menusList.styleOfmenu": req.body.search, "menusList.isDeleted": 0 },
                }
            )
        }

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                "$match":
                {
                    $or: [
                        { "name": RE },
                        // { "restaurantInfo.restaurantFeatures.cuisineType": RE }
                    ]
                }
            });
        }

        /**If need to filter today day with restaurant open day */
        if (req.body.openingTimings && req.body.openingTimings.length > 0) {
            aggregate.push({
                "$match":
                    { "restaurantDetails.openingTimings.time.day": moment().format("dddd") }
            });
        }

        if (req.body.features && req.body.features.length > 0) {

            aggregate.push({
                "$match":
                    { "restaurantFeatures.restaurantFeaturesOptions": { $in: req.body.features } }
            });

        }


        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "dishesDetails.allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "dishesDetails.dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "dishesDetails.lifestyleId": { $in: req.body.lifestyle } }
            });
        }

        aggregate.push({
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                createdAt: { $first: "$createdAt" },
                restaurantProfilePhoto: { $first: "$restaurantProfilePhoto" },
                averageCostOfTwoPerson: { $first: "$averageCostOfTwoPerson" },
                restaurantFeaturesOptions: { $first: "$restaurantFeatures.restaurantFeaturesOptions" },
                address: { $first: "$address" }
            }
        });
        aggregate.push({
            $project: {
                _id: "$_id",
                name: "$name",
                createdAt: "$createdAt",
                restaurantProfilePhoto: "$restaurantProfilePhoto",
                averageCostOfTwoPerson: "$averageCostOfTwoPerson",
                restaurantFeaturesOptions: "$restaurantFeatures.restaurantFeaturesOptions",
                address: "$address"
            }
        });

        if (req.body.option && req.body.option === "new") {
            aggregate.push({
                $sort: { createdAt: -1 }
            })
        }

        await Restaurant.aggregate(aggregate)
            .then(async restaurantList => {

                let tempArray = await distanceCalculationAndFiler(req.body, restaurantList)

                if (req.body.sort && req.body.sort.distance && req.body.sort.distance == "l2h") {
                    tempArray.sort(function (a, b) { return a.distance.value - b.distance.value });
                }

                const pagination_resp = await common_helper.pagination(tempArray, req.body.start, req.body.length)
                res.status(constants.OK_STATUS).json({ ...pagination_resp, message: "Restaurant list get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: error });
            });
    }
    catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Dish list", error: err });

    }
});

/**page no 1 for Green slider restaurants list*/
router.post('/green_slider_restaurants', async (req, res, next) => {
    try {
        let aggregate = [
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
                $sort: { numericSubscriptionLevel: -1 }
            }
        ];


        await Restaurant.aggregate(aggregate)
            .then(async restaurantList => {

                let tempArray = await distanceCalculationAndFiler(req.body, restaurantList)

                if (req.body.sort && req.body.sort.distance && req.body.sort.distance == "l2h") {
                    tempArray.sort(function (a, b) { return a.distance.value - b.distance.value });
                }

                const pagination_resp = await common_helper.pagination(tempArray, req.body.start, req.body.length)
                res.status(constants.OK_STATUS).json({ ...pagination_resp, message: "Restaurant list get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: error });
            });
    }
    catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Dish list", error: err });

    }
});

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function getDistanceBetweenPoints(lat1, lng1, lat2, lng2) {
    // The radius of the planet earth in meters
    let R = 6378137;
    let dLat = degreesToRadians(lat2 - lat1);
    let dLong = degreesToRadians(lng2 - lng1);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat1)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distance = R * c;

    return distance;    //distance in meter
}



/**find nearest details */
router.get('/nearest_location', async (req, res, next) => {
    try {
        // Restaurant_adminModel.aggregate([{
        //     $geoNear: {
        //         near: { type: "Point", coordinates: [23.022868, 72.583692] },
        //         maxDistance: 300000,
        //         distanceField: "dist.calculated",
        //         spherical: true,
        //         distanceMultiplier: 1 / 1000
        //     }
        // }])
        // .then(async list => {
        //     res.status(constants.OK_STATUS).json({ list, message: "nearest restaurant get successfully." });
        // }).catch(err => {
        //     console.log("err", err)
        //     res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });
        // })

        // Restaurant_addressModel.find({})
        //     .then(async list => {
        //         let tempArray = [];
        //         for (let singleList of list) {
        //             let distance_resp = await getDistanceBetweenPoints(21.193455, 72.802080, singleList.map.coordinates[0], singleList.map.coordinates[1])
        //             let temp = Object.assign({}, singleList);
        //             let tempAdminInfo = temp._doc;
        //             tempAdminInfo.distance = distance_resp;
        //             tempArray.push(tempAdminInfo)
        //         }
        //         tempArray.sort(function (a, b) { return a.distance - b.distance });
        //         res.status(constants.OK_STATUS).json({ tempArray, message: "nearest restaurant get successfully." });
        //     }).catch(err => {
        //         console.log("err", err)
        //         res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });
        //     })

    }
    catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });
    }
});

module.exports = router;
