var express = require('express');
const ObjectId = require('mongodb').ObjectID;
var router = express.Router();
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const Dish = require('../../models/dish');
const validation_response = require('../../validation/validation_response');
const validation = require('../../validation/admin/validation');

router.post('/', validation.dish, validation_response, async (req, res, next) => {
    req.body.restaurantAdminId = req.loginUser.id;
    var duplicate_insert_resp = {};
    if (req.body.createNewVersion) {
        duplicate_insert_resp = await common_helper.insert(Dish, req.body);
    }
    const insert_resp = await common_helper.insert(Dish, req.body);

    if (insert_resp.status === 1 && insert_resp.data) {
        res.status(constants.OK_STATUS).json({ insert_resp, duplicate_insert_resp });
    } else {
        res.status(constants.BAD_REQUEST).json(insert_resp);
    }
})

router.get('/:id', async (req, res) => {
    try {

        const aggregate = [
            {
                $match: {
                    _id: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "menus",
                    localField: "menuId",
                    foreignField: "_id",
                    as: "menuDetail"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryDetail"
                }
            },
            {
                $lookup: {
                    from: "allergens",
                    localField: "allergenId",
                    foreignField: "_id",
                    as: "allergensDetail"
                }
            },
            {
                $lookup: {
                    from: "dietaries",
                    localField: "dietaryId",
                    foreignField: "_id",
                    as: "dietariesDetail"
                }
            },
            {
                $lookup: {
                    from: "lifestyles",
                    localField: "lifestyleId",
                    foreignField: "_id",
                    as: "lifestylesDetail"
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subcategoryId",
                    foreignField: "_id",
                    as: "subcategoriesDetail"
                }
            },
        ];
        await Dish.aggregate(aggregate)
            .then(dishDetails => {
                res.status(constants.OK_STATUS).json(dishDetails);
            }).catch(error => {

            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "something want wrong", error: err });

    }
})

router.post('/list', async (req, res, next) => {
    try {

        const aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    restaurantAdminId: new ObjectId(req.loginUser.id)
                }
            },
            {
                $lookup: {
                    from: "menus",
                    localField: "menuId",
                    foreignField: "_id",
                    as: "menuDetail"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryDetail"
                }
            },
            {
                $lookup: {
                    from: "allergens",
                    localField: "allergenId",
                    foreignField: "_id",
                    as: "allergensDetail"
                }
            },
            {
                $lookup: {
                    from: "dietaries",
                    localField: "dietaryId",
                    foreignField: "_id",
                    as: "dietariesDetail"
                }
            },
            {
                $lookup: {
                    from: "lifestyles",
                    localField: "lifestyleId",
                    foreignField: "_id",
                    as: "lifestylesDetail"
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subcategoryId",
                    foreignField: "_id",
                    as: "subcategoriesDetail"
                }
            },
        ];

        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

            aggregate.push({
                "$match":
                    { "name": RE }
            });

        }
        if (req.body.category && req.body.category != "") {
            aggregate.push({
                "$match":
                    { "categoryId": new ObjectId(req.body.category) }
            });

        }
        if (req.body.menu && req.body.menu != "") {
            aggregate.push({
                "$match":
                    { "menuId": new ObjectId(req.body.menu) }
            });

        }
        const totalDish = await Dish.aggregate(aggregate)
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
        await Dish.aggregate(aggregate)
            .then(dishDetails => {
                res.status(constants.OK_STATUS).json({ dishDetails, totalDish: totalDish.length });
            }).catch(error => {

            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });

    }
});

router.put('/:id', validation.dish, validation_response, async (req, res) => {
    try {
        const update_resp = await common_helper.update(Category, { "_id": req.params.id }, req.body);
        if (update_resp.status === 1) {
            res.status(constants.OK_STATUS).json(insert_resp);
        } else {
            res.status(constants.BAD_REQUEST).json(insert_resp);
        }

    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: error });

    }
})

router.delete('/:id', async (req, res, next) => {
    const data = await common_helper.softDelete(Dish, { "_id": req.params.id })

    if (data.status === 0) {
        res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(constants.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

module.exports = router;