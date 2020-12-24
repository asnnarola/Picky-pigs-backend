var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const common_helper = require('../../helpers/common');
const config = require('../../config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const Subcategory = require('../../models/subcategory');
const validation_response = require('../../validation/validation_response');
const validation = require('../../validation/admin/validation');

//add subcategory
router.post('/', validation.subcategory, validation_response, async (req, res, next) => {

    const data = await common_helper.insert(Subcategory, { name: req.body.name, categoryId: req.body.categoryId, restaurantAdminId: req.loginUser.id, menuId: req.body.menuId });

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});


/**Single category to all subcategory finds */
router.get('/categoryOfSubcategory/:id', async (req, res, next) => {
    const data = await common_helper.find(Subcategory, { "categoryId": req.params.id, restaurantAdminId: new ObjectId(req.loginUser.id) });

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});


router.get('/:id', async (req, res, next) => {
    var data = await common_helper.findOne(Subcategory, { "_id": new ObjectId(req.params.id) })
    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

router.put('/:id', async (req, res, next) => {
    const data = await common_helper.update(Subcategory, { "_id": req.params.id }, req.body)
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

router.post("/list", async (req, res) => {
    try {
        let aggregate = [
            {
                $match: {
                    "isDeleted": 0,
                    // restaurantAdminId: new ObjectId(req.loginUser.id)
                }
            },
            {
                $lookup: {
                    from: "dishes",
                    localField: "_id",
                    foreignField: "subcategoryId",
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
        const totalSubcategory = await Subcategory.aggregate(aggregate)
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

        await Subcategory.aggregate(aggregate)
            .then(menuDetails => {
                res.status(config.OK_STATUS).json({ menuDetails, totalSubcategory: totalSubcategory.length, message: "Subcategory list get successfully" });
            }).catch(error => {
                res.status(config.BAD_REQUEST).json(error);
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(config.BAD_REQUEST).json({ message: "something want wrong", error: err });

    }
});

router.delete('/:id', async (req, res, next) => {
    const data = await common_helper.softDelete(Subcategory, { "_id": req.params.id })


    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});
module.exports = router;