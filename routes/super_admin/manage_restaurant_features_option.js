var express = require('express');
var router = express.Router();
const Restaurant_features_option = require("../../models/restaurant_features_option");
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

router.post('/', ingredient_management.allergen, validation_response, async (req, res, next) => {
    try {
        req.body.superAdminId = req.loginUser.id;
        const data = await common_helper.insert(Restaurant_features_option, req.body);

        if (data.status === 1 && data.data) {
            res.status(constants.OK_STATUS).json(data);
        } else {
            res.status(constants.BAD_REQUEST).json(data);
        }
    } catch (error) {
        console.log(error)
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
});


router.post('/list', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    isDeleted: 0
                }
            },
            {
                $project: {
                    _id: "$_id",
                    image: "$image",
                    name: "$name",
                    description: "$description"
                }
            }
        ]


        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                "$match":
                    { "name": RE }
            });
        }
        
        const totalRestaurant_features = await Restaurant_features_option.aggregate(aggregate);
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

        await Restaurant_features_option.aggregate(aggregate)
            .then(restaurantFeatureList => {
                res.status(constants.OK_STATUS).json({ restaurantFeatureList, totalCount: totalRestaurant_features.length, message: "Restaurant Features get successfully" });
            })
            .catch(error => {
                res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
            })
    } catch (error) {
        console.log(error)
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const data = await common_helper.findOne(Restaurant_features_option, { "_id": req.params.id })

        if (data.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
        }

        if (data.status === 1 && data.data) {
            res.status(constants.OK_STATUS).json(data);
        } else if (data.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
        }
    } catch (error) {
        console.log(error)
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
});

router.put('/:id', ingredient_management.allergen, validation_response, async (req, res, next) => {
    try {
        const data = await common_helper.update(Restaurant_features_option, { "_id": req.params.id }, req.body)
        if (data.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
        }
        if (data.status === 1 && data.data) {
            res.status(constants.OK_STATUS).json(data);
        } else if (data.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
        }
    } catch (error) {
        console.log(error)
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const data = await common_helper.softDelete(Restaurant_features_option, { "_id": req.params.id })

        if (data.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
        }
        if (data.status === 1 && data.data) {
            res.status(constants.OK_STATUS).json(data);
        } else if (data.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
        }
    } catch (error) {
        console.log(error)
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
});
module.exports = router;
