var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const Category = require('../../models/category');
const validation_response = require('../../validation/validation_response');
const validation = require('../../validation/admin/validation');

//add category
router.post('/', validation.category, validation_response, async (req, res, next) => {

    var data = await common_helper.insert(Category, { name: req.body.name, menuId: req.body.menuId, restaurantAdminId: req.loginUser.id });

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});

router.get('/:id', async (req, res, next) => {
    var data = await common_helper.findOne(Category, { "_id": req.params.id })
    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

router.post('/menu_categories', async (req, res, next) => {
    var data = await common_helper.find(Category, { "menuId": {$in: req.body.menuId} })
    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});


router.post('/list', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    "isDeleted": 0,
                    restaurantAdminId: new ObjectId(req.loginUser.id)
                }
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "dishesDetail"
                }
            },
            {
                $sort: {
                    createdAt: 1
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
        const totalCategory = await Category.aggregate(aggregate)
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

        await Category.aggregate(aggregate)
            .then(menuDetails => {
                res.status(config.OK_STATUS).json({ menuDetails, totalCategory: totalCategory.length, message: "category list get successfully" });
            }).catch(error => {
                return res.status(config.BAD_REQUEST).json(error);
            });

    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "something want wrong", error: err });

    }
});

router.put('/:id', async (req, res, next) => {
    var data = await common_helper.update(Category, { "_id": req.params.id }, req.body)
    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

router.delete('/:id', async (req, res, next) => {
    var data = await common_helper.softDelete(Category, { "_id": req.params.id })
    // var data = await common_helper.delete(Category, { "_id": req.params.id })

    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

module.exports = router;
