var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const Menu = require("../../models/menus");
const Category = require("../../models/category");
const Dish = require("../../models/dish");
const common_helper = require('../../helpers/common');
const config = require('../../config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

// router.post('/list', async (req, res, next) => {
//     try {
//         console.log("---", req.body.allergens)
//         if(req.body.allergens){

//             req.body.allergens = req.body.allergens.map(element => {
//                 if (element) {
//                     element = new ObjectId(element)
//                 }
//                 return element
//             })
//         }
//         let aggregate = [
//             {
//                 $match: {
//                     _id: new ObjectId(req.body.menuId)
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "menuId",
//                     as: "categoriesDetail"
//                 }
//             },
//             {
//                 $unwind: "$categoriesDetail"
//             },
//             {
//                 $lookup: {
//                     from: "subcategories",
//                     localField: "categoriesDetail._id",
//                     foreignField: "categoryId",
//                     as: "categoriesDetail.subcategoriesDetail"
//                 }
//             },
//             {
//                 $unwind: "$categoriesDetail.subcategoriesDetail"
//             },
//             // {
//             //     $lookup: {
//             //         from: "dishes",
//             //         localField: "categoriesDetail.subcategoriesDetail._id",
//             //         foreignField: "subcategoryId",
//             //         as: "categoriesDetail.subcategoriesDetail.dishesDetail"
//             //     }
//             // },
//             {
//                 $group: {
//                     _id: "$categoriesDetail._id",
//                     categoryName: { $first: "$categoriesDetail.name" },
//                     "subcategorisDetail": { "$push": "$categoriesDetail.subcategoriesDetail" }
//                 }
//             },
//         ];

//         // if (req.body.allergens && req.body.allergens != "") {

//         //     aggregate.push({
//         //         "$match":
//         //             { "subcategorisDetail.dishesDetail.allergenId": { $in: req.body.allergens } }
//         //     });

//         // }

//         if (req.body.search && req.body.search != "") {
//             const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

//             aggregate.push({
//                 "$match":
//                     { "name": RE }
//             });

//         }

//         const totalCount = await Menu.aggregate(aggregate)
//         if (req.body.start) {

//             aggregate.push({
//                 "$skip": req.body.start
//             });

//         }

//         if (req.body.length) {
//             aggregate.push({
//                 "$limit": req.body.length
//             });
//         }
//         await Menu.aggregate(aggregate)
//             .then(dishDetails => {
//                 res.status(config.OK_STATUS).json({ dishDetails, totalCount: totalCount.length });
//             }).catch(error => {
//                 console.log(error)
//             });
//     }
//     catch (err) {
//         console.log("err", err)
//         res.status(config.BAD_REQUEST).json({ message: "Error into dishes listing", error: err });

//     }
// });

router.post('/list', async (req, res, next) => {
    try {
        console.log("---", req.body.allergens)
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
            },
            // {
            //     $unwind: "$subcategoriesDetail.dishesDetail"
            // },
            {
                $match: {
                    "subcategoriesDetail.dishesDetail.name": { $eq: "Dish 1" }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    categoryName: { $first: "$name" },
                    subcategories: { $push: "$subcategoriesDetail" },
                    // dishesDetail: { $push: "$dishesDetail" }
                }
            },
            // {
            //     $group: {
            //         _id: "$_id",
            //         categoryName: { $push: "$name" },
            //         subcategoriesDetail: {$push: { $mergeObjects: [ "$subcategories", "$dishesDetail" ] }}
            //     }
            // }
        ];

        await Category.aggregate(aggregate)
            .then(categoryDetails => {
                res.status(config.OK_STATUS).json(categoryDetails);
            }).catch(error => {
                console.log(error)
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "Error into categories listing", error: err });

    }
});

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







router.post('/dishfilter', async (req, res, next) => {
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
                    isDeleted: 0
                }
            }
        ];
        if (req.body.search && req.body.search != "") {
            const RE = { $regex: new RegExp(`${req.body.search}`, 'gi') };

            aggregate.push({
                "$match":
                    { "name": RE }
            });

        }
        if (req.body.menuId && req.body.menuId !== "") {
            aggregate.push({
                $match: {
                    "menuId": new ObjectId(req.body.menuId)
                }
            })
        }
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
        aggregate.push({
            $group: {
                _id: "$categoryId",
                dishes: { $push: "$$ROOT" }
            }
        })
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
module.exports = router;
