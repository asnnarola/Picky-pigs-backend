var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const RestaurantAdmin = require('../../models/restaurantAdmin');
const RestaurantGallery = require('../../models/restaurant_gallery');
const RestaurantAddress = require('../../models/restaurant_address');
const RestaurantDetails = require('../../models/restaurant_details');
const RestaurantFeatures = require('../../models/restaurant_features');
const validation = require('../../validation/admin/validation');

router.post('/', async (req, res, next) => {
    try {
        const save_response = await common_helper.update(RestaurantAdmin, { userId: new ObjectId(req.loginUser.id) }, req.body);
        if (req.body.galleryImages) {
            const save_response = await common_helper.updatewithupsert(RestaurantGallery, { userId: new ObjectId(req.loginUser.id) }, req.body.galleryImages);
        }
        if (req.body.address) {
            const save_restaurantaddress_response = await common_helper.updatewithupsert(RestaurantAddress, { userId: new ObjectId(req.loginUser.id) }, req.body.address);
        }
        if (req.body.restaurantFeatures) {
            const save_restaurantfeature_response = await common_helper.updatewithupsert(RestaurantFeatures, { userId: new ObjectId(req.loginUser.id) }, req.body.restaurantFeatures);
        }
        if (req.body.openingTimings !== undefined || req.body.website !== undefined || req.body.bookings !== undefined || req.body.socialMedia !== undefined) {
            const save_restaurantdetail_response = await common_helper.updatewithupsert(RestaurantDetails, { userId: new ObjectId(req.loginUser.id) }, req.body);
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


router.get('/', async (req, res, next) => {
    try {

        let aggregate = [
            {
                $match: {
                    userId: new ObjectId(req.loginUser.id)
                }
            },
            {
                $lookup: {
                    from: "restaurant_galleries",
                    localField: "userId",
                    foreignField: "restaurantAdminId",
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
                    localField: "userId",
                    foreignField: "restaurantAdminId",
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
                    localField: "userId",
                    foreignField: "restaurantAdminId",
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
                    localField: "userId",
                    foreignField: "restaurantAdminId",
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
        await RestaurantAdmin.aggregate(aggregate)
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


module.exports = router;
