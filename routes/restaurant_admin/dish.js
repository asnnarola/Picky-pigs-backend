var express = require('express');
const ObjectId = require('mongodb').ObjectID;
var router = express.Router();
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const Dish = require('../../models/dish');
const Allergen = require('../../models/allergen');
const DishIngredient = require('../../models/dish_ingredient');
const DishCaloriesAndMacros = require('../../models/dish_caloriesAndMacros');
const Restaurant = require('../../models/restaurant');
const validation_response = require('../../validation/validation_response');
const validation = require('../../validation/admin/validation');

router.post('/', validation.dish, validation_response, async (req, res, next) => {
    /**For multiple restaurant to set retaurant id */
    const find_response = await Restaurant.findOne({ userId: req.loginUser.id })
    req.body.restaurantId = find_response._id;
    /**********/


    req.body.menuId = JSON.parse(req.body.menuId),
        req.body.allergenId = JSON.parse(req.body.allergenId);
    req.body.dietaryId = JSON.parse(req.body.dietaryId);
    req.body.lifestyleId = JSON.parse(req.body.lifestyleId);
    req.body.cookingMethodId = JSON.parse(req.body.cookingMethodId);
    req.body.ingredientSection = JSON.parse(req.body.ingredientSection);
    req.body.caloriesAndMacros = JSON.parse(req.body.caloriesAndMacros);
    // req.body.dish_features_optionId = JSON.parse(req.body.dish_features_optionId);

    var duplicate_insert_resp = {};
    // if (req.body.createNewVersion) {
    //     duplicate_insert_resp = await common_helper.insert(Dish, req.body);
    //     req.body.caloriesAndMacros.dishId = duplicate_insert_resp.data._id;
    //     req.body.caloriesAndMacros.restaurantId = req.body.restaurantId;
    //     await common_helper.insert(DishCaloriesAndMacros, req.body.caloriesAndMacros);

    //     req.body.ingredientSection.ingredient = req.body.ingredientSection.ingredient.map(singleElement => {
    //         singleElement.dishId = duplicate_insert_resp.data._id;
    //         singleElement.restaurantId = req.body.restaurantId;
    //         return singleElement;
    //     })
    //     const insert_DishIngredient_resp = await common_helper.insertMany(DishIngredient, req.body.ingredientSection.ingredient);
    // }
    if (req.files && req.files['image']) {
        const imageRes = await common_helper.upload(req.files['image'], "uploads");
        req.body.image = imageRes.data[0].path
    }
    const insert_resp = await common_helper.insert(Dish, req.body);
    req.body.caloriesAndMacros.dishId = insert_resp.data._id;
    req.body.caloriesAndMacros.restaurantId = req.body.restaurantId;
    const insert_resp_caloriesAndMacros = await common_helper.insert(DishCaloriesAndMacros, req.body.caloriesAndMacros);
    req.body.ingredientSection.ingredient = req.body.ingredientSection.ingredient.map(singleElement => {
        singleElement.dishId = insert_resp.data._id;
        singleElement.restaurantId = req.body.restaurantId;
        return singleElement;
    })
    const insert_DishIngredient_resp = await common_helper.insertMany(DishIngredient, req.body.ingredientSection.ingredient);


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
            },
            {
                $lookup: {
                    from: "dish_ingredients",
                    localField: "_id",
                    foreignField: "dishId",
                    as: "ingredientSection.dish_ingredients"
                }
            },
            {
                $unwind: {
                    path: "$ingredientSection.dish_ingredients",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "allergens",
                    localField: "ingredientSection.dish_ingredients.allergeies",
                    foreignField: "_id",
                    as: "ingredientSection.dish_ingredients.allergenlist"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    "favorite": { $first: "$favorite" },
                    "prepItem": { $first: "$prepItem" },
                    "new": { $first: "$new" },
                    "image": { $first: "$image" },
                    "available": { $first: "$available" },
                    "menuId": { $first: "$menuId" },
                    "allergenId": { $first: "$allergenId" },
                    "dietaryId": { $first: "$dietaryId" },
                    "lifestyleId": { $first: "$lifestyleId" },
                    "cookingMethodId": { $first: "$cookingMethodId" },
                    "customisable": { $first: "$customisable" },
                    "createNewVersion": { $first: "$createNewVersion" },
                    "isDeleted": { $first: "$isDeleted" },
                    "isActive": { $first: "$isActive" },
                    "name": { $first: "$name" },
                    "makes": { $first: "$makes" },
                    "price": { $first: "$price" },
                    "priceUnit": { $first: "$priceUnit" },
                    "grossProfit": { $first: "$grossProfit" },
                    "categoryId": { $first: "$categoryId" },
                    "restaurantId": { $first: "$restaurantId" },
                    "subcategoryId": { $first: "$subcategoryId" },
                    "description": { $first: "$description" },
                    "instructions": { $first: "$instructions" },
                    "updatedAt": { $first: "$updatedAt" },
                    "dish_ingredientPrice": { $first: "$ingredientSection.total" },
                    "dish_ingredientsMerge": {
                        $push: "$ingredientSection.dish_ingredients"
                    },
                    "caloriesandmacrosDetail": { $first: "$caloriesandmacrosDetail" },
                }
            },
            {
                $project: {
                    "_id": "$_id",
                    "favorite": "$favorite",
                    "prepItem": "$prepItem",
                    "new": "$new",
                    "image": "$image",
                    "available": "$available",
                    "menuId": "$menuId",
                    "allergenId": "$allergenId",
                    "dietaryId": "$dietaryId",
                    "lifestyleId": "$lifestyleId",
                    "cookingMethodId": "$cookingMethodId",
                    "customisable": "$customisable",
                    "createNewVersion": "$createNewVersion",
                    "isDeleted": "$isDeleted",
                    "isActive": "$isActive",
                    "name": "$name",
                    "makes": "$makes",
                    "price": "$price",
                    "priceUnit": "$priceUnit",
                    "grossProfit": "$grossProfit",
                    "categoryId": "$categoryId",
                    "restaurantId": "$restaurantId",
                    "subcategoryId": "$subcategoryId",
                    "description": "$description",
                    "instructions": "$instructions",
                    "updatedAt": "$updatedAt",
                    "ingredientSection": {
                        total: "$dish_ingredientPrice",
                        dish_ingredients: "$dish_ingredientsMerge"
                    },
                    "caloriesAndMacros": "$caloriesandmacrosDetail"
                }
            }
        ];
        await Dish.aggregate(aggregate)
            .then(dishDetails => {
                res.status(constants.OK_STATUS).json(dishDetails);
            }).catch(error => {
                console.log("error", error)
                res.status(constants.BAD_REQUEST).json({ message: "get sigle dish detail", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "something want wrong", error: err });

    }
})

router.post('/list', async (req, res, next) => {
    try {
        /**For multiple restaurant to set retaurant id */
        const find_response = await Restaurant.findOne({ userId: req.loginUser.id })
        req.body.restaurantId = find_response._id;
        /**********/

        const aggregate = [
            {
                $match: {
                    isDeleted: 0,
                    restaurantId: new ObjectId(req.body.restaurantId)
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
        /**For multiple restaurant to set retaurant id */
        const find_response = await Restaurant.findOne({ userId: req.loginUser.id })
        req.body.restaurantId = find_response._id;
        /**********/


        if (req.files && req.files['image']) {
            const imageRes = await common_helper.upload(req.files['image'], "uploads");
            req.body.image = imageRes.data[0].path
        }

        req.body.menuId = JSON.parse(req.body.menuId);
        req.body.allergenId = JSON.parse(req.body.allergenId);
        req.body.dietaryId = JSON.parse(req.body.dietaryId);
        req.body.lifestyleId = JSON.parse(req.body.lifestyleId);
        req.body.cookingMethodId = JSON.parse(req.body.cookingMethodId);
        req.body.ingredientSection = JSON.parse(req.body.ingredientSection);
        req.body.caloriesAndMacros = JSON.parse(req.body.caloriesAndMacros);
        // req.body.dish_features_optionId = JSON.parse(req.body.dish_features_optionId);

        const update_resp = await common_helper.update(Dish, { "_id": req.params.id }, req.body);
        const update_DishCaloriesAndMacros_resp = await common_helper.update(DishCaloriesAndMacros, { "_id": req.body.caloriesAndMacros._id }, req.body.caloriesAndMacros);

        if (req.body.ingredientSection.ingredient.length > 0) {
            for (let singleIngredient of req.body.ingredientSection.ingredient) {
                if (singleIngredient._id === undefined) {
                    singleIngredient.dishId = req.params.id;
                    singleIngredient.restaurantId = req.body.restaurantId;
                }
                const ingredient_resp = await common_helper.addOrUpdate(DishIngredient, { _id: singleIngredient._id }, singleIngredient)
            }
        }

        if (req.body.ingredientSection.deleteIngredients.length > 0) {
            await DishIngredient.deleteMany({ _id: { $in: req.body.ingredientSection.deleteIngredients } });
        }

        if (update_resp.status === 1) {
            res.status(constants.OK_STATUS).json(update_resp);
        } else {
            res.status(constants.BAD_REQUEST).json(update_resp);
        }

    } catch (error) {
        console.log("error; ", error)
        res.status(constants.BAD_REQUEST).json({ message: "Error into dishes listing", error: error });

    }
})

router.post('/add_update_ingredient', async (req, res) => {
    try {
        const ingredient_resp = await common_helper.addOrUpdate(DishIngredient, { _id: req.body._id }, req.body)
        if (ingredient_resp.status === 1) {
            res.status(constants.OK_STATUS).json(ingredient_resp);
        } else {
            res.status(constants.BAD_REQUEST).json(ingredient_resp);
        }
    } catch (error) {
        // console.log("error: ", error)
        res.status(constants.BAD_REQUEST).json({ message: "Error into insert ingredient", error: error });
    }
})

router.post('/delete_ingredient', async (req, res) => {
    try {
        const ingredient_delete_resp = await common_helper.delete(DishIngredient, { _id: req.body.ingredientId })
        if (ingredient_delete_resp.status === 1) {
            res.status(constants.OK_STATUS).json(ingredient_delete_resp);
        } else {
            res.status(constants.BAD_REQUEST).json(ingredient_delete_resp);
        }
    } catch (error) {
        // console.log("error: ", error)
        res.status(constants.BAD_REQUEST).json({ message: "Error into insert ingredient", error: error });
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