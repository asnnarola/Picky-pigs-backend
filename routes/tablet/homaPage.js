var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
var Menu = require("../../models/menus");
const common_helper = require('../../helpers/common');
const config = require('../../config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

router.post('/list', async (req, res, next) => {
    try {

        const aggregate = [
            {
                $match: {
                    _id: new ObjectId(req.body.menuId)
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "menuId",
                    as: "categoriesDetail"
                }
            },
            {
                $unwind: "$categoriesDetail"
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "categoriesDetail._id",
                    foreignField: "categoryId",
                    as: "categoriesDetail.subcategoriesDetail"
                }
            },
            {
                $unwind: "$categoriesDetail.subcategoriesDetail"
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "categoriesDetail.subcategoriesDetail._id",
                    foreignField: "subcategoryId",
                    as: "categoriesDetail.subcategoriesDetail.dishesDetail"
                }
            },
            {
                $group: {
                    _id: "$categoriesDetail._id",
                    categoryName: { $first: "$categoriesDetail.name" },
                    "subcategorisDetail": { "$push": "$categoriesDetail.subcategoriesDetail" }
                }
            },
            // {
            //     $match: {
            //         "subcategorisDetail.categoryId": { $in: [new ObjectId("5fb6137d358d872b7cce1405")] }
            //     }
            // }
        ];

        if (req.body.allergens && req.body.allergens != "") {

            aggregate.push({
                "$match":
                    { "subcategorisDetail.categoryId": { $in: req.body.allergens } }
            });

        }
        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

            aggregate.push({
                "$match":
                    { "name": RE }
            });

        }
        const totalCount = await Menu.aggregate(aggregate)
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
        await Menu.aggregate(aggregate)
            .then(dishDetails => {
                res.status(config.OK_STATUS).json({ dishDetails, totalCount: totalCount.length });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });

    }
});


module.exports = router;
