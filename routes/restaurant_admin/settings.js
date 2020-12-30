var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const RestaurantAdmin = require('../../models/restaurantAdmin');
const RestaurantGallery = require('../../models/restaurant_gallery');
const validation = require('../../validation/admin/validation');

router.post('/', async (req, res, next) => {
    try {
        const save_response = await common_helper.update(RestaurantAdmin, { _id: new ObjectId(req.loginUser.id) }, req.body);
        if (req.body.galleryImages) {
            const save_response = await common_helper.updatewithupsert(RestaurantGallery, { restaurantAdminId: new ObjectId(req.loginUser.id) }, req.body.galleryImages);
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
                    _id: new ObjectId(req.loginUser.id)
                }
            },
            {
                $lookup: {
                    from: "restaurant_galleries",
                    localField: "_id",
                    foreignField: "restaurantAdminId",
                    as: "restaurant_galleries"
                }
            },
            {
                $unwind: "$restaurant_galleries"
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
