var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const Allergen = require("../../models/allergen");
const Dietary = require("../../models/dietary");
const Lifestyle = require("../../models/lifestyle");
const Cooking_method = require("../../models/cooking_method");
const Cuisine_type = require("../../models/cuisine_type");
const Restaurant_features_option = require("../../models/restaurant_features_option");
const Menu = require("../../models/menus");
const Dish = require("../../models/dish");
const Review = require("../../models/review");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;


router.get('/allergen', async (req, res, next) => {
    try {
        const data = await common_helper.find(Allergen, { isDeleted: 0, isActive: true }, 'name image description');
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

router.get('/dietary', async (req, res, next) => {
    try {
        const data = await common_helper.find(Dietary, { isDeleted: 0, isActive: true }, 'name');
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

router.get('/lifeStyle', async (req, res, next) => {
    try {
        const data = await common_helper.find(Lifestyle, { isDeleted: 0, isActive: true }, 'name');
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

router.get('/cooking_method', async (req, res, next) => {
    try {
        const data = await common_helper.find(Cooking_method, { isDeleted: 0, isActive: true }, 'name image');
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

router.get('/restaurant_features_option', async (req, res, next) => {
    try {
        const data = await common_helper.find(Restaurant_features_option, { isDeleted: 0, isActive: true }, 'name image');
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

router.get('/cuisine_type', async (req, res, next) => {
    try {
        const data = await common_helper.find(Cuisine_type, { isDeleted: 0, isActive: true }, 'name');
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

function average(array) {
    if (array.length === 1) {
        return array[0].rate;
    } else {
        return array.reduce((acc, next) => acc.rate + next.rate) / array.length;
    }
}

/*Get single restaurant all review**/
router.get('/restaurant_review/:id', async (req, res, next) => {
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
            .then(async reviewDetails => {
                if (reviewDetails.length > 0) {
                    var avgRating = await average(reviewDetails);
                }
                res.status(constants.OK_STATUS).json({ avgRating, reviewDetails, message: "get restaurant review listing successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error into restaurant review listing", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into restaurant review listing", error: err });

    }
});

/*Get single restaurant all menus**/
router.get('/restaurant_menus/:id', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    restaurantId: new ObjectId(req.params.id)
                }
            }
        ];
        await Menu.aggregate(aggregate)
            .then(menuList => {
                // let modifiedMenuArray = []
                // for (let singleMenu of menuList) {
                //     if (singleMenu.isSeasonBase === true) {
                //         if (moment(singleMenu.createdAt).format('DD-MM-YYYY') < moment().format('DD-MM-YYYY')) {
                //             console.log("----")
                //             modifiedMenuArray.push(singleMenu)
                //         }
                //     } else {
                //         modifiedMenuArray.push(singleMenu)
                //     }
                // }
                res.status(constants.OK_STATUS).json({ menuList, message: "get restaurant menu listing successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error into restaurant menu listing", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into restaurant menu listing", error: err });
    }
});

module.exports = router;
