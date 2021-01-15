var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
const Restaurant = require("../../models/restaurant");
const Users = require("../../models/users");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const passwordValidator = require('password-validator');
const passwordValidatorSchema = new passwordValidator();
const manage_module = require('../../validation/admin/manage_module');
const validation_response = require('../../validation/validation_response');

const saltRounds = 10;




router.post('/create', manage_module.create_restaurant, validation_response, async (req, res, next) => {
    try {
        if (passwordValidatorSchema.validate(req.body.password) == true) {
            const data = await common_helper.findOne(Users, { "email": req.body.email, "isDeleted": 0 })
            if (data.status === 0) {
                res.json({ status: 0, message: "Error while finding email" });
            }

            if (data.status === 1 && data.data) {
                return res.status(constants.BAD_REQUEST).json({ status: 1, message: "Email already exist !" });

            } else {
                req.body.emailVerified = true;
                const register_allUser_resp = await common_helper.insert(Users, req.body);
                req.body.userId = register_allUser_resp.data._id;
                const register_user_resp = await common_helper.insert(Restaurant, req.body);

                if (register_allUser_resp.status === 1 && register_allUser_resp.data) {
                    res.status(constants.OK_STATUS).json(register_allUser_resp);
                } else {
                    res.status(constants.BAD_REQUEST).json(register_allUser_resp);
                }
            }
        }
        else {
            res.status(constants.BAD_REQUEST).json({ "status": 0, "message": "Please Enter password of atleast 8 characters including 1 Uppercase,1 Lowercase,1 digit,1 special character" })
        }
    } catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ status: 0, err: err });
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
                    from: "restaurants",
                    localField: "_id",
                    foreignField: "userId",
                    as: "restaurants"
                }
            },
            {
                $unwind: "$restaurants"
            },
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

            aggregate.push({
                "$match":
                    { "restaurants.name": RE }
            });

        }

        const totalRecord = await Users.aggregate(aggregate);

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

        await Users.aggregate(aggregate)
            .then(restaurantList => {
                res.status(constants.OK_STATUS).json({ restaurantList, totalRecord: totalRecord.length, "message": "Restaurant listing get successfully" });
            }).catch(error => {
                res.status(constants.BAD_REQUEST).json({ message: "Error into restaurant listing", error: error });
            });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error into restaurant listing", error: err });
    }
})


router.put('/update_password/:id', manage_module.update_password, validation_response, async (req, res, next) => {
    try {
        const update_resp = await common_helper.update(Users, { "_id": req.params.id }, { password: bcrypt.hashSync(req.body.password, saltRounds) })
        if (update_resp.status === 0) {
            res.json({ status: 0, message: "Error occured while update password" });
        } else {
            res.status(constants.OK_STATUS).json({ status: 1, message: "Password has been changed", update_resp });
        }
    } catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error into Password has been changed", error: err });
    }
})

router.delete('/:id', async (req, res, next) => {
    try {

        const update_all_users_resp = await common_helper.update(Users, { "_id": req.params.id }, { isDeleted: 1 })
        const update_resp = await common_helper.update(Restaurant, { "userId": req.params.id }, { isDeleted: 1 })
        if (update_resp.status === 0) {
            res.json({ status: 0, message: "Error occured while Restaurant deleted" });
        } else {
            res.status(constants.OK_STATUS).json({ status: 1, message: "Restaurant deleted successfully", update_resp });
        }
    } catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error into Restaurant deleted", error: err });
    }
})

module.exports = router;
