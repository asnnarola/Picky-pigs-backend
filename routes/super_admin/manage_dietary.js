var express = require('express');
var router = express.Router();
const Dietary = require("../../models/dietary");
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

router.post('/', ingredient_management.dietary, validation_response, async (req, res, next) => {
    try {
        req.body.superAdminId = req.loginUser.id;
        const data = await common_helper.insert(Dietary, req.body);

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
                    name: "$name",
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

        const totalDietary = await Dietary.aggregate(aggregate);
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

        await Dietary.aggregate(aggregate)
            .then(dietaryList => {
                res.status(constants.OK_STATUS).json({ dietaryList, totalCount: totalDietary.length, message: "Dietary get successfully" });
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
        const data = await common_helper.findOne(Dietary, { "_id": req.params.id })

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

router.put('/:id', ingredient_management.dietary, validation_response, async (req, res, next) => {
    try {
        const data = await common_helper.update(Dietary, { "_id": req.params.id }, req.body)
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
        const data = await common_helper.softDelete(Dietary, { "_id": req.params.id })

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
