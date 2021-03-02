var express = require('express');
var router = express.Router();
const Allergen = require("../../models/allergen");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

router.post('/', async (req, res, next) => {
    try {
        req.body.superAdminId = req.loginUser.id;
        if (req.files && req.files['image']) {
            const imageRes = await common_helper.upload(req.files['image'], "uploads/allergen");
            req.body.image = imageRes.data[0].path
        }
        const data = await common_helper.insert(Allergen, req.body);

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

router.get('/:id', async (req, res, next) => {
    try {
        const data = await common_helper.findOne(Allergen, { "_id": req.params.id })

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
                    description: "$description",
                    createdAt: "$createdAt"
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
        const totalAllregen = await Allergen.aggregate(aggregate);
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

        await Allergen.aggregate(aggregate)
            .then(allergenList => {
                res.status(constants.OK_STATUS).json({ allergenList, totalCount: totalAllregen.length, message: "Allergen get successfully" });
            })
            .catch(error => {
                res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
            })
    } catch (error) {
        console.log(error)
        res.status(constants.BAD_REQUEST).json({ status: 0, error: error });
    }
});

router.put('/:id', ingredient_management.allergen, validation_response, async (req, res, next) => {
    try {

        if (req.files && req.files['image']) {
            const imageRes = await common_helper.upload(req.files['image'], "uploads/allergen");
            req.body.image = imageRes.data[0].path
        }
        const data = await common_helper.update(Allergen, { "_id": req.params.id }, req.body)
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
        const data = await common_helper.softDelete(Allergen, { "_id": req.params.id })

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
