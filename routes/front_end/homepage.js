var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const Dish = require("../../models/dish");
const Restaurant = require("../../models/restaurant");
const constants = require('../../config/constants');
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
                $unwind: {
                    path: "$restaurantDetails.openingTimings.time.timeList",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "restaurantDetails.openingTimings.time.day": moment().format("dddd"),

                    /**Start time validation */
                    'restaurantDetails.openingTimings.time.timeList.startTime': { $lt: moment().format("HH:mm") },
                    // 'restaurantDetails.openingTimings.time.timeList.startTimeUnit': moment().format("a"),

                    /**End time validation */
                    'restaurantDetails.openingTimings.time.timeList.endTime': { $gt: moment().format("HH:mm") },
                    // 'restaurantDetails.openingTimings.time.timeList.endTimeUnit': moment().format("a")
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    numericSubscriptionLevel: { $first: "$numericSubscriptionLevel" },
                    restaurantProfilePhoto: { $first: "$restaurantProfilePhoto" },
                    averageCostOfTwoPerson: { $first: "$restaurantFeatures.averageCostOfTwoPerson" },
                    restaurantFeaturesOptionsList: { $first: "$restaurantFeatures.restaurantFeaturesOptionsList" },
                    address: { $first: "$address" }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$name",
                    restaurantProfilePhoto: "$restaurantProfilePhoto",
                    averageCostOfTwoPerson: "$averageCostOfTwoPerson",
                    numericSubscriptionLevel: "$numericSubscriptionLevel",
                    restaurantFeaturesOptionsList: {
                        $map: {
                            input: "$restaurantFeaturesOptionsList",
                            as: "singlerestaurantFeaturesOptionsList",
                            in: {
                                'name': '$$singlerestaurantFeaturesOptionsList.name',
                                'image': '$$singlerestaurantFeaturesOptionsList.image'

                            }
                        }
                    },
                    address: "$address",
                }
            },
            {
                $sort: {
                    numericSubscriptionLevel: -1
                }
            }
        ];

        await Restaurant.aggregate(aggregate)
            .then(async restaurantList => {

                let tempArray = await common_helper.distanceCalculationAndFiler(req.body, restaurantList)

                tempArray.sort(function (a, b) { return a.distance.value - b.distance.value });
                const pagination_resp = await common_helper.pagination(tempArray, req.body.start, req.body.length)

                res.status(constants.OK_STATUS).json({ ...pagination_resp, message: "Restaurant list get successfully." });
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
                    isActive: true
                    // menuId: new ObjectId(req.body.menuId)
                }
            },
            {
                $lookup: {
                    from: "cooking_methods",
                    localField: "cookingMethodId",
                    foreignField: "_id",
                    as: "cookingMethods"
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
            // {
            //     $match: {
            //         "menusDetail.availability": moment().format("dddd"),

            //         /**Start time validation */
            //         'menusDetail.timeFrom': { $lt: moment().format("HH:mm") },

            //         // /**End time validation */
            //         'menusDetail.timeTo': { $gt: moment().format("HH:mm") },
            //     }
            // },
            {
                $sample: {
                    size: 8
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    description: { $first: "$description" },
                    price: { $first: "$price" },
                    image: { $first: "$image" },
                    cookingMethods: { $first: "$cookingMethods" },
                    menuList: {
                        $push: {
                            _id: "$menuDetail._id",
                            name: "$menuDetail.name"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: "$_id",
                    name: "$name",
                    description: "$description",
                    price: "$price",
                    image: "$image",
                    cookingMethods: {
                        $map: {
                            input: "$cookingMethods",
                            as: "singlecookingMethods",
                            in: {
                                'name': '$$singlecookingMethods.name',
                                'image': '$$singlecookingMethods.image'

                            }
                        }
                    },
                    menusDetail: "$menuList"
                }
            }
        ];
        // const totalCount = await Dish.aggregate(aggregate)
        // if (req.body.start) {
        //     aggregate.push({
        //         "$skip": req.body.start
        //     });
        // }
        // if (req.body.length) {
        //     aggregate.push({
        //         "$limit": req.body.length
        //     });
        // }

        await Dish.aggregate(aggregate)
            .then(dishesList => {
                // res.status(constants.OK_STATUS).json({ dishesList, totalCount: totalCount.length, message: "Dishes list get successfully." });
                res.status(constants.OK_STATUS).json({ dishesList, message: "Dishes list get successfully." });
            }).catch(error => {
                res.status(constants.BAD_REQUEST).json({ message: "Error while get dishes list", error: error });
            });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while get Dishes list", error: err });

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
        const toAdminEmailContent = {
            // to: "drl@narola.email",
            to: "sasha@pickypigs.com",
            subject: 'From join us Picky pigs',
            obj: obj,
            filePath: "./views/frontend/to_admin_join_us.ejs"
        }
        const toAdminEmailResp = await sendMail(toAdminEmailContent);

        const toUserEmailContent = {
            // to: "drl@narola.email",
            to: req.body.email,
            obj: obj,
            subject: 'Thanks to Join us Picky pigs',
            filePath: "./views/frontend/to_user_join_us.ejs"
        }
        const toUserEmailResp = await sendMail(toUserEmailContent);
        res.status(constants.OK_STATUS).json({ message: "join us request sent successfully" });
    }
    catch (err) {
        console.log("err: ", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while join us", error: err });

    }
})


module.exports = router;
