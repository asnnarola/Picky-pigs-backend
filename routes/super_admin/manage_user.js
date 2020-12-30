const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const fs = require('fs');
const { Parser } = require('json2csv');

const User = require("../../models/users");
const All_Users = require("../../models/all_users");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const manage_module = require('../../validation/admin/manage_module');
const validation_response = require('../../validation/validation_response');

const saltRounds = 10;






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
                    from: "users",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userDetail"
                }
            },
            {
                $unwind: "$userDetail"
            },
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

            aggregate.push({
                "$match":
                    { "userDetail.name": RE }
            });

        }

        const totalRecord = await User.aggregate(aggregate);

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
            .then(userList => {
                res.status(constants.OK_STATUS).json({ userList, totalRecord: totalRecord.length, "message": "user listing get successfully" });
            }).catch(error => {
                res.status(constants.BAD_REQUEST).json({ message: "Error into user listing", error: error });
            });
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error into user listing", error: err });
    }
})


router.put('/update_password/:id', manage_module.update_password, validation_response, async (req, res, next) => {

    const update_resp = await common_helper.update(All_Users, { "_id": req.params.id }, { password: bcrypt.hashSync(req.body.password, saltRounds) })
    if (update_resp.status === 0) {
        res.status(constants.BAD_REQUEST).json({ status: 0, message: "Error occured while update password" });
    } else {
        res.status(constants.OK_STATUS).json({ status: 1, message: "Password has been changed", update_resp });
    }
})

router.post('/export_user', async (req, res) => {
    try {
        const user_resp = await All_Users.find({ role: "user" }).select("email");
        if (user_resp) {
            let userArray = [];
            let count = 1;
            for (let singleUser of user_resp) {
                userArray.push({ no: count, email: singleUser.email })
                count++;
            }
            const fields = [{ value: 'no', label: 'No.' }, { value: 'email', label: 'Email' }];

            const dir = "csv";
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            const name = `${dir}/users.csv`;

            const parser = new Parser({ fields });
            const csv = parser.parse(userArray);
            fs.writeFile(name, csv, function (err) {
                if (err) throw err;
            });

            // res.status(constants.OK_STATUS).json({ status: 1, message: "User exported successfully" });

            res.header('Content-Type', 'text/csv');
            res.attachment(name);
            res.status(constants.OK_STATUS).json({ status: 1, message: "User exported successfully" });

        } else {
            res.status(constants.BAD_REQUEST).json({ status: 0, message: "No user founds" });
        }
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ status: 0, message: "Error occured while export user", error: error });

    }
})
module.exports = router;
