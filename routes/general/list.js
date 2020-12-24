var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const allergen = require("../../models/allergen");
const dietary = require("../../models/dietary");
const lifestyle = require("../../models/lifestyle");
const Dish = require("../../models/dish");
const Review = require("../../models/review");
const common_helper = require('../../helpers/common');
const config = require('../../config');
const LOGGER = config.LOGGER;


router.get('/allergen', async (req, res, next) => {
    var data = await common_helper.find(allergen);
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});
router.get('/dietary', async (req, res, next) => {
    var data = await common_helper.find(dietary);
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});
router.get('/lifeStyle', async (req, res, next) => {
    var data = await common_helper.find(lifestyle);
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});
// router.get('/', async (req, res, next) => {
//     var data = await common_helper.find(allergen);
//     if (data.status === 1 && data.data) {
//         res.status(config.OK_STATUS).json(data);
//     } else {
//         res.status(config.BAD_REQUEST).json(data);
//     }
// });


/*Get single dish info**/
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
        ];

        if (req.body.allergens && req.body.allergens != "") {

            aggregate.push({
                "$match":
                    { "allergenId": { $in: req.body.allergens } }
            });

        }
        await Dish.aggregate(aggregate)
            .then(dishDetails => {
                res.status(config.OK_STATUS).json(dishDetails);
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });

    }
});


/*Get single single restaurant all review**/
router.get('/restaurant/:id', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    restaurantAdminId: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "usersDetail"
                }
            },
            {
                $unwind: "$usersDetail"
            }
        ];
        await Review.aggregate(aggregate)
            .then(reviewDetails => {
                res.status(config.OK_STATUS).json({reviewDetails,message: "get restaurant review listing successfully."});
            }).catch(error => {
                console.log(error)
                res.status(config.BAD_REQUEST).json({ message: "Error into restaurant review listing", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error into restaurant review listing", error: err });

    }
});
module.exports = router;
