var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const Dish = require("../../models/dish");
// const RestaurantAdmin = require("../../models/restaurantAdmin");
const Restaurant = require("../../models/restaurant");
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const homepageValidation = require('../../validation/homepage');
const validation_response = require('../../validation/validation_response');
var sendMail = require("../../mails/sendMail");
const Restaurant_addressModel = require("../../models/restaurant_address");
const common_helper = require('../../helpers/common')


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
                $unwind: {
                    path: "$restaurantDetails.openingTimings.time",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "restaurantDetails.openingTimings.time.day": moment().format("dddd"),

                    /**Start time validation */
                    'restaurantDetails.openingTimings.time.timeList.startTime': { $lt: moment().format("HH:mm") },
                    'restaurantDetails.openingTimings.time.timeList.startTimeUnit': moment().format("a"),

                    /**End time validation */
                    'restaurantDetails.openingTimings.time.timeList.endTime': { $gt: moment().format("HH:mm") },
                    'restaurantDetails.openingTimings.time.timeList.endTimeUnit': moment().format("a")
                }
            }
        ];
        const totalCount = await Restaurant.aggregate(aggregate)
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

        await Restaurant.aggregate(aggregate)
            .then(restaurantList => {
                res.status(constants.OK_STATUS).json({ restaurantList, totalCount: totalCount.length, message: "Restaurant list get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: error });
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
                    "menusDetail.availability": moment().format("dddd"),

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
                res.status(constants.BAD_REQUEST).json({ message: "Error while get dishes list", error: error });
            });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Dishes list", error: err });

    }
});

/**page no 3 */
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

        const totalCount = await Restaurant.aggregate(aggregate)
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
        await Restaurant.aggregate(aggregate)
            .then(restaurantList => {
                res.status(constants.OK_STATUS).json({ restaurantList, totalCount: totalCount.length, message: "Restaurant list get successfully." });
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
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                "$match":
                {
                    $or: [
                        { "name": RE },
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
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: error });
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
            company: req.body.company
        }
        const emailContent = {
            // to: "ksd@narola.email",
            to: req.body.email,
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


        // const distance_resp = await common_helper.getDistance();
        // res.status(constants.OK_STATUS).json({ distance_resp, message: "nearest restaurant get successfully." });

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


        Restaurant_addressModel.find({})
            .then(async list => {
                let tempArray = [];
                const userCoordinates = [ 21.193455, 72.802080 ]
                for (let singleList of list) {
                    console.log("------------------------------",singleList.map)
                    if(singleList.map !== undefined && singleList.map.coordinates.length == 2){
                        
                    }
                    const coordinates = singleList.map.coordinates;
                    let distance_resp = await common_helper.getDistance(coordinates[0], coordinates[1], userCoordinates[0], userCoordinates[1]);
                    let singleclone = JSON.parse(JSON.stringify(singleList));
                    singleclone.distance = distance_resp;
                    tempArray.push(singleclone)
                }
                tempArray.sort(function (a, b) { return a.distance.value - b.distance.value });
                res.status(constants.OK_STATUS).json({ tempArray, message: "nearest restaurant get successfully." });
            }).catch(err => {
                console.log("err", err)
                res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });
            })

    }
    catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });
    }
});

module.exports = router;
