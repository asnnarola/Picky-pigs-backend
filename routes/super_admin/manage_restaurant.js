var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
const RestaurantAdmin = require("../../models/restaurantAdmin");
const All_Users = require("../../models/all_users");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const manage_module = require('../../validation/admin/manage_module');
const validation_response = require('../../validation/validation_response');

const saltRounds = 10;




router.post('/create', manage_module.create_restaurant, validation_response, async (req, res, next) => {

    const register_allUser_resp = await common_helper.insert(All_Users, req.body);
    req.body.userId = register_allUser_resp.data._id;
    const register_user_resp = await common_helper.insert(RestaurantAdmin, req.body);

    if (register_allUser_resp.status === 1 && register_allUser_resp.data) {
        res.status(constants.OK_STATUS).json(register_allUser_resp);
    } else {
        res.status(constants.BAD_REQUEST).json(register_allUser_resp);
    }
})

router.post('/list', async (req, res, next) => {

    try {

        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                }
            },
            {
                $lookup: {
                    from: "restaurant_admins",
                    localField: "_id",
                    foreignField: "userId",
                    as: "restaurant_admins"
                }
            },
            {
                $unwind: "$restaurant_admins"
            },
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

            aggregate.push({
                "$match":
                    { "restaurant_admins.name": RE }
            });

        }

        const totalRecord = await All_Users.aggregate(aggregate);

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

        await All_Users.aggregate(aggregate)
            .then(restaurantAdminList => {
                res.status(constants.OK_STATUS).json({ restaurantAdminList, totalRecord: totalRecord.length, "message": "Restaurant listing get successfully" });
            }).catch(error => {
                res.status(constants.BAD_REQUEST).json({ message: "Error into restaurant listing", error: error });
            });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error into restaurant listing", error: err });
    }
})


router.put('/update_password/:id', manage_module.update_password, validation_response, async (req, res, next) => {

    const update_resp = await common_helper.update(All_Users, { "_id": req.params.id }, { password: bcrypt.hashSync(req.body.password, saltRounds) })
    if (update_resp.status === 0) {
        res.json({ status: 0, message: "Error occured while update password" });
    } else {
        res.status(constants.OK_STATUS).json({ status: 1, message: "Password has been changed", update_resp });
    }
})

router.delete('/:id', async (req, res, next) => {

    const update_resp = await common_helper.update(RestaurantAdmin, { "userId": req.params.id }, { isDeleted: 1 })
    const update_all_users_resp = await common_helper.update(All_Users, { "_id": req.params.id }, { isDeleted: 1 })
    if (update_resp.status === 0) {
        res.json({ status: 0, message: "Error occured while Restaurant deleted" });
    } else {
        res.status(constants.OK_STATUS).json({ status: 1, message: "Restaurant deleted successfully", update_resp });
    }
})

module.exports = router;
