var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const Dish = require("../../models/dish");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;


router.get('/:id', async (req, res, next) => {
    try {
        let aggregate = [
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
                    from: "dish_caloriesandmacros",
                    localField: "_id",
                    foreignField: "dishId",
                    as: "caloriesandmacrosDetail"
                }
            },
            {
                $unwind: "$caloriesandmacrosDetail"
            }
        ];

        if (req.body.allergens && req.body.allergens != "") {

            aggregate.push({
                "$match":
                    { "allergenId": { $in: req.body.allergens } }
            });

        }
        await Dish.aggregate(aggregate)
            .then(dishDetails => {
                res.status(constants.OK_STATUS).json(dishDetails);
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });

    }
});
module.exports = router;
