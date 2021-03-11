var express = require('express');
var router = express.Router();
const Dish_features_option = require("../../models/dish_features_option");
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

router.post('/', ingredient_management.dish_feature_option, validation_response, async (req, res, next) => {
    try {
        if (req.files && req.files['image']) {
            const imageRes = await common_helper.upload(req.files['image'], "uploads");
            req.body.image = imageRes.data[0].path
        }
        req.body.superAdminId = req.loginUser.id;
        const data = await common_helper.insert(Dish_features_option, req.body);

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

router.put('/:id', ingredient_management.dish_feature_option, async (req, res) => {
    try {
        if (req.files && req.files['image']) {
            const imageRes = await common_helper.upload(req.files['image'], "uploads");
            req.body.image = imageRes.data[0].path;
        }
        const update_resp = await common_helper.update(Dish_features_option, { _id: req.params.id }, req.body)
        if (update_resp.status === 0) {
            res.status(constants.BAD_REQUEST).json(update_resp);
        } else {
            res.status(constants.OK_STATUS).json(update_resp);
        }
    } catch (error) {
        console.log("error: ", error)
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
})


router.get('/:id', async (req, res) => {
    try {
        const dish_feature_resp = await common_helper.findOne(Dish_features_option, { _id: req.params.id })

        if (dish_feature_resp.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...dish_feature_resp, message: "Invalid request !" });
        }

        if (dish_feature_resp.status === 1 && dish_feature_resp.data) {
            res.status(constants.OK_STATUS).json(dish_feature_resp);
        } else if (dish_feature_resp.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...dish_feature_resp, message: "No data found" });
        }
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        // const delete_resp = await common_helper.softDelete(Dish_features_option, { "_id": req.params.id })
        const delete_resp = await common_helper.delete(Dish_features_option, { "_id": req.params.id })

        if (delete_resp.status === 0) {
            res.status(constants.BAD_REQUEST).json({ ...delete_resp, message: "Invalid request !" });
        }
        if (delete_resp.status === 1 && delete_resp.data) {
            res.status(constants.OK_STATUS).json(delete_resp);
        } else if (delete_resp.data === null) {
            res.status(constants.BAD_REQUEST).json({ ...delete_resp, message: "No data found" });
        }
    } catch (error) {
        console.log("error: ", error)
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
})


router.post('/list', async (req, res) => {
    try {
        let aggregate = [
            {
                $match: {
                    isDeleted: 0
                }
            },
            {
                $sort: {
                    createdAt: -1
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
        const total_dish_features = await Dish_features_option.aggregate(aggregate);

        if (req.body.start) {
            aggregate.push({
                $skip: req.body.start
            })
        }
        if (req.body.length) {
            aggregate.push({
                $limit: req.body.length
            })
        }
        Dish_features_option.aggregate(aggregate)
            .then(dishList => {
                res.status(constants.OK_STATUS).json({ message: "Get dish feaure option list successfully.", totalCount: total_dish_features.length, data: dishList })
            })
            .catch(error => {
                res.status(constants.BAD_REQUEST).json({ status: 0, message: "Error occured while listing data", error: error })
            })
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ status: 0, message: "Error occured while listing data", error: error })
    }
})

module.exports = router;
