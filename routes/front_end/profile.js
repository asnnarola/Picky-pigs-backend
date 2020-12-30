var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const User = require("../../models/users");
const Favourite = require("../../models/favourite");
const Review = require("../../models/review");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const bcrypt = require("bcrypt")
const saltRounds = 10;


router.get('/:id', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    _id: new ObjectId(req.loginUser.id)
                }
            }
        ];


        await User.aggregate(aggregate)
            .then(userDetail => {
                res.status(constants.OK_STATUS).json({ userDetail, message: "User details get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get User details", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get User details", error: err });

    }
});


router.put('/', async (req, res, next) => {
    try {
        if (req.body.password && req.body.password !== "") {
            req.body.password = bcrypt.hashSync(req.body.password, saltRounds)
        }
        const update_resp = await common_helper.update(User, { "_id": req.loginUser.id }, req.body)
        if (update_resp.status === 0) {
            res.json({ status: 0, message: "Error occured while Details Update successfully." });
        } else {
            res.status(constants.OK_STATUS).json({ status: 1, message: "Details Update successfully.", update_resp });
        }
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while Details Update successfully.", error: err });

    }
});

router.post('/add_favourite', async (req, res, next) => {
    try {
        const favouriteDetail = await Favourite.findOne({ userId: req.loginUser.id });
        if (favouriteDetail) {
            if (req.body.restaurantAdminId) {
                var obj = { $push: { restaurantAdminId: req.body.restaurantAdminId } };
            }
            if (req.body.dishesId) {
                var obj = { $push: { dishesId: req.body.dishesId } };
            }
            var update_resp = await common_helper.update(Favourite, { userId: req.loginUser.id }, obj)
            if (update_resp.status === 0) {
                res.json({ status: 0, message: "Error occured while add to favourite successfully." });
            } else {
                res.status(constants.OK_STATUS).json({ status: 1, message: "Add to favourite successfully.", update_resp });
            }
        } else {
            req.body.userId = req.loginUser.id;
            const insert_resp = await common_helper.insert(Favourite, req.body);

            if (insert_resp.status === 1 && insert_resp.data) {
                res.status(constants.OK_STATUS).json(insert_resp);
            } else {
                res.status(constants.BAD_REQUEST).json(insert_resp);
            }

        }


    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while Details Update successfully.", error: err });

    }
});


router.post('/remove_favourite', async (req, res, next) => {
    try {
        if (req.body.restaurantAdminId) {
            var obj = { $pull: { restaurantAdminId: req.body.restaurantAdminId } };
        }
        if (req.body.dishesId) {
            var obj = { $pull: { dishesId: req.body.dishesId } };
        }
        const update_resp = await common_helper.update(Favourite, { userId: req.loginUser.id }, obj)
        if (update_resp.status === 0) {
            res.json({ status: 0, message: "Error occured while remove favourite successfully." });
        } else {
            res.status(constants.OK_STATUS).json({ status: 1, message: "Remove favourite successfully.", update_resp });
        }
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while Remove favourite successfully.", error: err });
    }
});


/**Favourite restaurant list */
router.post('/favourite_restaurant_list', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    userId: new ObjectId(req.loginUser.id)
                }
            },
            {
                $lookup: {
                    from: "restaurant_admins",
                    localField: "restaurantAdminId",
                    foreignField: "_id",
                    as: "restaurant_adminDetail"
                }
            },
        ];

        await Favourite.aggregate(aggregate)
            .then(favouriteRestaurantDetail => {
                res.status(constants.OK_STATUS).json({ favouriteRestaurantDetail, message: "get favourite Restaurant list successfully" });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get favourite Restaurant list.", error: error });
            });
    }
    catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error while get favourite Restaurant list.", error: err });
    }
});

/**Add review */
router.post('/add_review', async (req, res, next) => {
    try {
        const reviewDetail = await Review.findOne({ userId: req.loginUser.id, restaurantAdminId: req.body.restaurantAdminId });
        if (reviewDetail) {

            res.status(constants.BAD_REQUEST).json({ message: "You have already added review" });
        } else {
            req.body.userId = req.loginUser.id;
            const insert_resp = await common_helper.insert(Review, req.body);

            if (insert_resp.status === 1 && insert_resp.data) {
                res.status(constants.OK_STATUS).json(insert_resp);
            } else {
                res.status(constants.BAD_REQUEST).json(insert_resp);
            }

        }
    }
    catch (err) {
        res.status(constants.BAD_REQUEST).json({ message: "Error while add review.", error: err });
    }
});

module.exports = router;
