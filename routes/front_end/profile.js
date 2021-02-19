var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const fs = require('fs')
const Users = require("../../models/users");
const UserPreference = require("../../models/user_preference");
const Favourite = require("../../models/favourite");
const Review = require("../../models/review");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const bcrypt = require("bcrypt")
const saltRounds = 10;
const passwordValidator = require('password-validator');
const passwordValidatorSchema = new passwordValidator();
passwordValidatorSchema
    .is().min(8)
    .symbols()	                                 // Minimum length 8
    .is().max(100)
    .letters()                                // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().not().spaces()                       // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123'])

router.get('/', async (req, res, next) => {
    try {
        let aggregate = [
            {
                $match: {
                    _id: new ObjectId(req.loginUser.id)
                }
            },
            {
                $lookup: {
                    from: "user_preferences",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userDetail"
                }
            },
            {
                $unwind: "$userDetail"
            }
        ];


        await Users.aggregate(aggregate)
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
            if (passwordValidatorSchema.validate(req.body.password) == true) {
                req.body.password = bcrypt.hashSync(req.body.password, saltRounds)
                const update_resp = await common_helper.update(Users, { "_id": req.loginUser.id }, req.body)
            } else {
                return res.status(constants.BAD_REQUEST).json({ "status": 0, "message": "Please Enter password of atleast 8 characters including 1 Uppercase,1 Lowercase,1 digit,1 special character" })
            }
        }
        const update_resp = await common_helper.update(UserPreference, { "userId": req.loginUser.id }, req.body)
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

router.put('/upload_profile_image', async function (req, res, next) {
    try {
        if (req.files != null) {
            let imageData = await common_helper.upload(req.files['image'], "uploads");
            if (imageData.data.length > 0) {
                const getUserPreference = await UserPreference.findOne({ userId: req.loginUser.id });
                if (getUserPreference && getUserPreference.profileImage) {
                    if (await fs.existsSync(`./${getUserPreference.profileImage}`))
                        await fs.unlinkSync(`./${getUserPreference.profileImage}`);
                }
                const obj = {
                    profileImage: imageData.data[0].path
                }
                const update_resp = await common_helper.update(UserPreference, { "userId": req.loginUser.id }, obj)
                if (update_resp.status === 0) {
                    res.json({ status: 0, message: "Error occured while Profile Update." });
                } else {
                    res.status(constants.OK_STATUS).json({ status: 1, message: "Profile Update successfully.", update_resp });
                }
            } else {
                res.status(constants.BAD_REQUEST).json({ "message": "File not uploaded" });
            }
        } else {
            res.status(constants.BAD_REQUEST).json({ "message": "Please Upload proper file" });
        }
    } catch (err) {
        console.log("err", err)
        res.status(constants.BAD_REQUEST).json({ message: "Error occured while Profile image Update.", error: err });

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
                    foreignField: "userId",
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
