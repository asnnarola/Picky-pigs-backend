var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const Dish = require("../../models/dish");
const RestaurantAdmin = require("../../models/restaurantAdmin");
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const homepageValidation = require('../../validation/homepage');
const validation_response = require('../../validation/validation_response');
var sendMail = require("../../mails/sendMail");


/**Home page restaurant based on subscription and then time of day */
router.post('/homepage_restaurant', async (req, res, next) => {
    try {

        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                }
            },
            {
                $lookup: {
                    from: "restaurant_details",
                    localField: "userId",
                    foreignField: "userId",
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
                $unwind: "$restaurantDetails.openingTimings.time"
            },
            {
                $match: {
                    "restaurantDetails.openingTimings.time.day": moment().format("dddd"),

                    /**Start time validation */
                    'restaurantDetails.openingTimings.time.timeList.startTime': { $lt: moment().format("hh:mm") },
                    'restaurantDetails.openingTimings.time.timeList.startTimeUnit': moment().format("a"),

                    /**End time validation */
                    'restaurantDetails.openingTimings.time.timeList.endTime': { $gt: moment().format("hh:mm") },
                    'restaurantDetails.openingTimings.time.timeList.endTimeUnit': moment().format("a")
                }
            }
        ];
        const totalCount = await RestaurantAdmin.aggregate(aggregate)
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

        await RestaurantAdmin.aggregate(aggregate)
            .then(restaurantList => {
                res.status(constants.OK_STATUS).json({ restaurantList, totalCount: totalCount.length, message: "Restaurant list get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });

    }
});

/**Home page restaurant based on subscription and then time of day */
router.post('/homepage_dishes', async (req, res, next) => {
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
                    from: "menus",
                    localField: "menuId",
                    foreignField: "_id",
                    as: "menusDetail"
                }
            },
            {
                $match: {
                    "menusDetail.availability.day": moment().format("dddd"),

                    /**Start time validation */
                    'menusDetail.timeFrom': { $lt: moment().format("HH:mm") },

                    // /**End time validation */
                    'menusDetail.timeTo': { $gt: moment().format("HH:mm") },
                }
            }
        ];
        const totalCount = await Dish.aggregate(aggregate)
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

        await Dish.aggregate(aggregate)
            .then(dishesList => {
                res.status(constants.OK_STATUS).json({ dishesList, totalCount: totalCount.length, message: "Dishes list get successfully." });
            }).catch(error => {
                res.status(constants.BAD_REQUEST).json({ message: "Error while get dishes list", error: err });
            });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Dishes list", error: err });

    }
});

/**page no 3 */
router.post('/restaurantlist', async (req, res, next) => {
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
            // {
            //     $match: {
            //         isDeleted: 0,
            //     }
            // },
            {
                $lookup: {
                    from: "restaurant_admins",
                    localField: "restaurantAdminId",
                    foreignField: "userId",
                    as: "restaurant_adminDetail"
                }
            },
            {
                $unwind: {
                    path: "$restaurant_adminDetail",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_freatures",
                    localField: "restaurantAdminId",
                    foreignField: "userId",
                    as: "restaurant_adminDetail.restaurantFeatures"
                }
            },
            {
                $unwind: {
                    path: "$restaurant_adminDetail.restaurantFeatures",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_details",
                    localField: "restaurantAdminId",
                    foreignField: "userId",
                    as: "restaurant_adminDetail.restaurantDetails"
                }
            },
            {
                $unwind: {
                    path: "$restaurant_adminDetail.restaurantDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "restaurantAdminId",
                    foreignField: "userId",
                    as: "restaurant_adminDetail.reviewDetail"
                }
            }
        ];
        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

            aggregate.push({
                "$match":
                {
                    $or: [
                        { "restaurant_adminDetail.name": RE },
                        { "restaurant_adminDetail.restaurantFeatures.cuisineType": RE }
                    ]
                }
            });

        }
        /**If need to filter today day with restaurant open day */
        if (req.body.openingTimings && req.body.openingTimings.length > 0) {
            aggregate.push({
                "$match":
                    { "restaurant_adminDetail.restaurantDetails.openingTimings.time.day": moment().format("dddd") }
            });
        }
        if (req.body.features && req.body.features.length > 0) {

            aggregate.push({
                "$match":
                    { "restaurant_adminDetail.restaurantFeatures.restaurantFeaturesOptions": { $in: req.body.features } }
            });

        }
        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "lifestyleId": { $in: req.body.lifestyle } }
            });
        }

        aggregate.push({
            $group: {
                _id: "$restaurant_adminDetail._id",
                restaurantDetail: { $first: "$restaurant_adminDetail" }
            }
        });
        aggregate.push({
            $project: {
                _id: "$_id",
                restaurantDetail: "$restaurantDetail",
                restaurantRate: { $avg: "$restaurantDetail.reviewDetail.rate" }
            }
        });
        if (req.body.sort && req.body.sort.price && req.body.sort.price == "l2h") {

            aggregate.push({
                "$sort":
                    { "restaurantDetail.restaurantFeatures.averageCostOfTwoPerson": 1 }
            });

        }
        if (req.body.sort && req.body.sort.price && req.body.sort.price == "h2l") {

            aggregate.push({
                "$sort":
                    { "restaurantDetail.restaurantFeatures.averageCostOfTwoPerson": -1 }
            });

        }
        if (req.body.sort && req.body.sort.popularity && req.body.sort.popularity == "h2l") {

            aggregate.push({
                "$sort":
                    { "restaurantRate": -1 }
            });

        }
        const totalCount = await Dish.aggregate(aggregate)
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
        await Dish.aggregate(aggregate)
            .then(restaurantList => {
                res.status(constants.OK_STATUS).json({ restaurantList, totalCount: totalCount.length, message: "Restaurant list get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });

    }
});

/**page no 3 */
router.post('/disheslist', async (req, res, next) => {
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
                }
            },
            {
                $lookup: {
                    from: "restaurant_admins",
                    localField: "restaurantAdminId",
                    foreignField: "userId",
                    as: "restaurant_adminDetail"
                }
            },
            {
                $unwind: "$restaurant_adminDetail"
            },
            {
                $lookup: {
                    from: "restaurant_addresses",
                    localField: "restaurantAdminId",
                    foreignField: "userId",
                    as: "restaurant_adminDetail.address"
                }
            },
            {
                $unwind: {
                    path: "$restaurant_adminDetail.address",
                    preserveNullAndEmptyArrays: true

                }
            },
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                "$match":
                {
                    $or: [
                        { "name": RE },
                        { "itemSection.item.name": RE }
                    ]
                }
            });
        }

        if (req.body.features && req.body.features.length > 0) {

            aggregate.push({
                "$match":
                    { "restaurant_adminDetail.address.restaurantFeaturesOptions": { $in: req.body.features } }
            });

        }
        if (req.body.allergen && req.body.allergen.length > 0) {
            aggregate.push({
                "$match":
                    { "allergenId": { $in: req.body.allergen } }
            });
        }
        if (req.body.dietary && req.body.dietary.length > 0) {
            aggregate.push({
                "$match":
                    { "dietaryId": { $in: req.body.dietary } }
            });
        }
        if (req.body.lifestyle && req.body.lifestyle.length > 0) {
            aggregate.push({
                "$match":
                    { "lifestyleId": { $in: req.body.lifestyle } }
            });
        }

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

        const totalCount = await Dish.aggregate(aggregate)

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

        await Dish.aggregate(aggregate)
            .then(restaurantList => {
                res.status(constants.OK_STATUS).json({ restaurantList, totalCount: totalCount.length, message: "Restaurant list get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });

    }
});

router.post('/join_us', homepageValidation.join_us, validation_response, async (req, res, next) => {
    try {
        const obj = {
            name: req.body.name,
            message: req.body.message,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            comapny: req.body.comapny
        }
        const emailContent = {
            to: "drl@narola.email",
            subject: 'Join us to Picky pigs',
            obj: obj,
            filePath: "./views/frontend/join_us.ejs"
        }

        const emailResp = await sendMail(emailContent);
        res.status(constants.OK_STATUS).json({ message: "join us successfully", data: emailResp });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while join us", error: err });

    }
})
module.exports = router;
