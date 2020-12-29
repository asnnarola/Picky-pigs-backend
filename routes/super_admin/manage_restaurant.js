var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
const RestaurantAdmin = require("../../models/restaurantAdmin");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const LOGGER = config.LOGGER;
const manage_module = require('../../validation/admin/manage_module');
const validation_response = require('../../validation/validation_response');
const forgotPasswordMail = require('../../mails/forgotPasswordMail');
const sendMail = require('../../mails/sendMail');
const adminAuth = require('../../validation/admin/adminAuth');

const saltRounds = 10;




router.post('/create', manage_module.create_restaurant, validation_response, async (req, res, next) => {

    const insert_resp = await common_helper.insert(RestaurantAdmin, req.body);

    if (insert_resp.status === 1 && insert_resp.data) {
        res.status(config.OK_STATUS).json(insert_resp);
    } else {
        res.status(config.BAD_REQUEST).json(insert_resp);
    }
})

router.post('/list', async (req, res, next) => {

    try {

        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                }
            }
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

            aggregate.push({
                "$match":
                    { "name": RE }
            });

        }

        const totalRecord = await RestaurantAdmin.aggregate(aggregate);

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
            .then(restaurantAdminList => {
                res.status(config.OK_STATUS).json({ restaurantAdminList, totalRecord: totalRecord.length, "message": "Restaurant listing get successfully" });
            }).catch(error => {
                res.status(config.BAD_REQUEST).json({ message: "Error into restaurant listing", error: error });
            });
    }
    catch (err) {
        res.status(config.BAD_REQUEST).json({ message: "Error into restaurant listing", error: err });
    }
})


router.put('/update_password/:id', manage_module.update_password, validation_response, async (req, res, next) => {

    const update_resp = await common_helper.update(RestaurantAdmin, { "_id": req.params.id }, { password: bcrypt.hashSync(req.body.password, saltRounds) })
    if (update_resp.status === 0) {
        res.json({ status: 0, message: "Error occured while update password" });
    } else {
        res.status(config.OK_STATUS).json({ status: 1, message: "Password has been changed", update_resp });
    }
})

router.delete('/:id', async (req, res, next) => {

    const update_resp = await common_helper.update(RestaurantAdmin, { "_id": req.params.id }, { isDeleted: 1 })
    if (update_resp.status === 0) {
        res.json({ status: 0, message: "Error occured while update password" });
    } else {
        res.status(config.OK_STATUS).json({ status: 1, message: "Restaurant deleted successfully", update_resp });
    }
})

module.exports = router;
