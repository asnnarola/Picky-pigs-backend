var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const Restaurant = require('../../models/restaurant');
const RestaurantGallery = require('../../models/restaurant_gallery');
const RestaurantAddress = require('../../models/restaurant_address');
const RestaurantDetails = require('../../models/restaurant_details');
const RestaurantFeatures = require('../../models/restaurant_features');
const validation = require('../../validation/admin/validation');

router.post('/', async (req, res, next) => {
    try {

        const save_response = await common_helper.update(Restaurant, { userId: new ObjectId(req.loginUser.id) }, req.body);
        /**For multiple restaurant to set retaurant id */
        req.body.restaurantId = save_response.data._id;

        if (req.body.galleryImages) {
            const save_response = await common_helper.updatewithupsert(RestaurantGallery, { restaurantId: new ObjectId(req.body.restaurantId) }, req.body.galleryImages);
        }
        if (req.body.address) {
            const save_restaurantaddress_response = await common_helper.updatewithupsert(RestaurantAddress, { restaurantId: new ObjectId(req.body.restaurantId) }, req.body.address);
        }
        if (req.body.restaurantFeatures) {
            const save_restaurantfeature_response = await common_helper.updatewithupsert(RestaurantFeatures, { restaurantId: new ObjectId(req.body.restaurantId) }, req.body.restaurantFeatures);
            console.log(save_restaurantfeature_response)
        }
        if (req.body.openingTimings !== undefined || req.body.website !== undefined || req.body.bookings !== undefined || req.body.socialMedia !== undefined) {
            const save_restaurantdetail_response = await common_helper.updatewithupsert(RestaurantDetails, { restaurantId: new ObjectId(req.body.restaurantId) }, req.body);
        }
        if (save_response.status === 1 && save_response.data) {
            res.status(constants.OK_STATUS).json(save_response);
        } else {
            res.status(constants.BAD_REQUEST).json(save_response);
        }
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ ...save_response, error: error.messag, message: "Error occured while inserting data" });
    }
});


router.get('/:id', async (req, res, next) => {
    try {

        let aggregate = [
            {
                $match: {
                    // userId: new ObjectId(req.loginUser.id)
                    _id: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "restaurant_galleries",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "restaurantGalleries"
                }
            },
            {
                $unwind: {
                    path: "$restaurantGalleries",
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
        ];
        await Restaurant.aggregate(aggregate)
            .then(restaurantDetail => {
                res.status(constants.OK_STATUS).json({ restaurantDetail, message: "Restaurant details get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });
            });
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while finding data" });
    }
});


router.get('/restaurantlist', async (req, res, next) => {
    try {

        let aggregate = [
            {
                $match: {
                    userId: new ObjectId(req.params.id)
                }
            }
        ];
        await Restaurant.aggregate(aggregate)
            .then(restaurantList => {
                res.status(constants.OK_STATUS).json({ restaurantList, message: "Restaurant details get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: error });
            });
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while finding data" });
    }
});


module.exports = router;
