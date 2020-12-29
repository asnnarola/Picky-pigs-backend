var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const Menu = require("../../models/menus");
const Category = require("../../models/category");
const Dish = require("../../models/dish");
const Restaurant_adminModel = require("../../models/restaurantAdmin");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');


/**Get category and  subcategory base on the menu*/
router.post('/list', async (req, res, next) => {
    try {
        if (req.body.allergens) {

            req.body.allergens = req.body.allergens.map(element => {
                if (element) {
                    element = new ObjectId(element)
                }
                return element
            })
        }
        let aggregate = [
            {
                $match: {
                    menuId: new ObjectId(req.body.menuId)
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "subcategoriesDetail"
                }
            },
            {
                $unwind: "$subcategoriesDetail"
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "subcategoriesDetail._id",
                    foreignField: "subcategoryId",
                    as: "subcategoriesDetail.dishesDetail"
                }
            }
        ];
        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };
            aggregate.push({
                $match: {
                    "subcategoriesDetail.dishesDetail.name": RE
                }
            });
        }
        aggregate.push({
            $group: {
                _id: "$_id",
                categoryName: { $first: "$name" },
                subcategories: { $push: "$subcategoriesDetail" }
            }
        });
        await Category.aggregate(aggregate)
            .then(categoryDetails => {
                res.status(constants.OK_STATUS).json({ categoryDetails, message: "get category, subcategory and dishes list successfully" });
            }).catch(error => {
                console.log(error)
            });

    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into categories listing", error: err });

    }
});

/**Find dish base on the subcategry id */
router.get('/subcategory_product/:id', async (req, res, next) => {
    try {

        req.body.allergens = req.body.allergens.map(element => {
            if (element) {
                element = new ObjectId(element)
            }
            return element
        })
        req.body.dietaryPreferences = req.body.dietaryPreferences.map(element => {
            if (element) {
                element = new ObjectId(element)
            }
            return element
        })
        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    subcategoryId: new ObjectId(req.params.id)
                }
            }
        ];

        if (req.body.allergens && req.body.allergens != "") {

            aggregate.push({
                "$match":
                    { "allergenId": { $in: req.body.allergens } }
            });

        }
        if (req.body.dietaryPreferences && req.body.dietaryPreferences != "") {

            aggregate.push({
                "$match":
                    { "dietaryId": { $in: req.body.dietaryPreferences } }
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


/**Find category of subcategory list */
router.post('/category_subcategory_list', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    menuId: new ObjectId(req.body.menuId)
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "categoryId",
                    as: "subcategoriesDetail"
                }
            },

        ];

        await Category.aggregate(aggregate)
            .then(categoryDetails => {
                res.status(constants.OK_STATUS).json({ categoryDetails, message: "category and subcategoris get successfully." });
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into categories listing", error: err });

    }
});

/**Find favourite dishes base on the favourite field of the dish */
router.get('/favourite_dishes', async (req, res, next) => {
    try {

        let aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    favorite: true
                }
            }
        ];

        await Dish.aggregate(aggregate)
            .then(favouritedishDetails => {
                res.status(constants.OK_STATUS).json({ favouritedishDetails, message: "get favourite dishes listing successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error into favourite dishes listing", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error into favourite dishes listing", error: err });

    }
});


function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function getDistanceBetweenPoints(lat1, lng1, lat2, lng2) {
    // The radius of the planet earth in meters
    let R = 6378137;
    let dLat = degreesToRadians(lat2 - lat1);
    let dLong = degreesToRadians(lng2 - lng1);
    let a = Math.sin(dLat / 2)
        *
        Math.sin(dLat / 2)
        +
        Math.cos(degreesToRadians(lat1))
        *
        Math.cos(degreesToRadians(lat1))
        *
        Math.sin(dLong / 2)
        *
        Math.sin(dLong / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distance = R * c;

    return distance;
}

/**find nearest details */
router.get('/nearest_location', async (req, res, next) => {
    try {
        // Restaurant_adminModel.aggregate([{
        //     $geoNear: {
        //         near: { type: "Point", coordinates: [23.022868, 72.583692] },
        //         maxDistance: 300000,
        //         distanceField: "dist.calculated",
        //         spherical: true,
        //         distanceMultiplier: 1 / 1000
        //     }
        // }])
        // .then(async list => {
        //     res.status(constants.OK_STATUS).json({ list, message: "nearest restaurant get successfully." });
        // }).catch(err => {
        //     console.log("err", err)
        //     res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });
        // })

        Restaurant_adminModel.find({})
            .then(async list => {
                let tempArray = [];
                for (let singleList of list) {
                    let distance_resp = await getDistanceBetweenPoints(23.022868, 72.583692, singleList.location.coordinates[0], singleList.location.coordinates[1])
                    let temp = Object.assign({}, singleList);
                    let tempAdminInfo = temp._doc;
                    tempAdminInfo.distance = distance_resp;
                    tempArray.push(tempAdminInfo)
                }
                tempArray.sort(function (a, b) { return a.distance - b.distance });
                tempArray.map(element => {
                    console.log(element.distance)
                })
                res.status(constants.OK_STATUS).json({ tempArray, message: "nearest restaurant get successfully." });
            }).catch(err => {
                console.log("err", err)
                res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });
            })
       

    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });
    }
});


module.exports = router;
