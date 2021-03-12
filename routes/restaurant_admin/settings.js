var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require("bcrypt")
const fs = require('fs')
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const Restaurant = require('../../models/restaurant');
const RestaurantGallery = require('../../models/restaurant_gallery');
const RestaurantAddress = require('../../models/restaurant_address');
const RestaurantDetails = require('../../models/restaurant_details');
const RestaurantFeatures = require('../../models/restaurant_features');
const Users = require('../../models/users');
const validation = require('../../validation/admin/validation');
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


router.post('/', async (req, res, next) => {
    try {

        const save_response = await common_helper.update(Restaurant, { userId: new ObjectId(req.loginUser.id) }, req.body);
        /**For multiple restaurant to set retaurant id */
        req.body.restaurantId = save_response.data._id;

        if (req.body.security && req.body.security.password && req.body.security.password !== "") {
            if (passwordValidatorSchema.validate(req.body.security.password) == true) {
                const update_resp = await common_helper.update(Users, { "_id": save_response.data.userId }, { password: bcrypt.hashSync(req.body.security.password, saltRounds) })
            } else {
                return res.status(constants.BAD_REQUEST).json({ "status": 0, "message": "Please Enter password of atleast 8 characters including 1 Uppercase,1 Lowercase,1 digit,1 special character" })
            }
        }
        if (req.body.galleryImages) {
            const save_response = await common_helper.updatewithupsert(RestaurantGallery, { restaurantId: new ObjectId(req.body.restaurantId) }, req.body.galleryImages);
        }
        if (req.body.address) {
            const save_restaurantaddress_response = await common_helper.updatewithupsert(RestaurantAddress, { restaurantId: new ObjectId(req.body.restaurantId) }, req.body.address);
        }
        if (req.body.restaurantFeatures) {
            const save_restaurantfeature_response = await common_helper.updatewithupsert(RestaurantFeatures, { restaurantId: new ObjectId(req.body.restaurantId) }, req.body.restaurantFeatures);
            // console.log(save_restaurantfeature_response)
        }
        if (req.body.openingTimings !== undefined || req.body.website !== undefined || req.body.bookings !== undefined || req.body.socialMedia !== undefined) {
            const urlexpression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
            const regex = new RegExp(urlexpression);

            if (req.body.bookings) {
                if (req.body.bookings.websiteUrl.length > 0) {
                    for (let singleUrl of req.body.bookings.websiteUrl) {
                        if (!singleUrl.match(regex)) {
                            return res.status(constants.BAD_REQUEST).json({ message: "Please enter proper bookings URL." })
                        }
                    }
                }
                // for (let singleNumber of req.body.bookings.phoneNumber) {
                //     if (isNaN(singleNumber)) {
                //         return res.status(constants.BAD_REQUEST).json({ message: "bookings Please enter proper number." })
                //     }
                // }

            }
            if (req.body.website) {
                if (req.body.website.websiteUrl.length > 0) {
                    for (let singleUrl of req.body.website.websiteUrl) {
                        if (!singleUrl.match(regex)) {
                            return res.status(constants.BAD_REQUEST).json({ message: "Please enter proper website URL." })
                        }
                    }
                }
            }
            if (req.body.socialMedia) {
                if (req.body.socialMedia.facebookUrl.length > 0) {
                    for (let singleUrl of req.body.socialMedia.facebookUrl) {
                        if (!singleUrl.match(regex)) {
                            return res.status(constants.BAD_REQUEST).json({ message: "Please enter proper facebook URL." })
                        }
                    }
                }
                if (req.body.socialMedia.twitterUrl.length > 0) {
                    for (let singleUrl of req.body.socialMedia.twitterUrl) {
                        if (!singleUrl.match(regex)) {
                            return res.status(constants.BAD_REQUEST).json({ message: "Please enter proper twitter URL." })
                        }
                    }
                }
                if (req.body.socialMedia.instagramUrl.length > 0) {
                    for (let singleUrl of req.body.socialMedia.instagramUrl) {
                        if (!singleUrl.match(regex)) {
                            return res.status(constants.BAD_REQUEST).json({ message: "Please enter proper instagram URL." })
                        }
                    }
                }

            }
            if (req.body.openingTimings && req.body.openingTimings.time.length > 0) {
                for (let timeArray of req.body.openingTimings.time) {
                    let counter = 0;
                    for (let singleTime of timeArray.timeList) {
                        if (singleTime.startTime > singleTime.endTime) {
                            return res.status(constants.BAD_REQUEST).json({ message: "Please select proper opening and closing time." });
                        }
                        if (req.body.openingTimings.isMultiTime === true && counter !== 0 && timeArray.timeList[counter - 1].endTime > singleTime.startTime) {
                            return res.status(constants.BAD_REQUEST).json({ message: "Please select proper opening and closing time." });
                        }
                        counter++;
                    }
                }
            }
            const save_restaurantdetail_response = await common_helper.updatewithupsert(RestaurantDetails, { restaurantId: new ObjectId(req.body.restaurantId) }, req.body);
        }
        if (save_response.status === 1 && save_response.data) {
            res.status(constants.OK_STATUS).json(save_response);
        } else {
            res.status(constants.BAD_REQUEST).json(save_response);
        }
    } catch (error) {
        console.log("error : ", error)
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while inserting data" });
    }
});


router.get('/', async (req, res, next) => {
    try {

        /**For multiple restaurant to set retaurant id */
        const find_response = await Restaurant.findOne({ userId: req.loginUser.id })
        req.params.id = find_response._id;
        /**********/

        let aggregate = [
            {
                $match: {
                    // userId: new ObjectId(req.loginUser.id)
                    _id: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: "restaurant_galleries",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "restaurantGalleries"
                }
            },
            {
                $unwind: {
                    path: "$restaurantGalleries",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_addresses",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "address"
                }
            },
            {
                $unwind: {
                    path: "$address",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_details",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "restaurantDetails"
                }
            },
            {
                $unwind: {
                    path: "$restaurantDetails",
                    preserveNullAndEmptyArrays: true

                }
            },
            {
                $lookup: {
                    from: "restaurant_features",
                    localField: "_id",
                    foreignField: "restaurantId",
                    as: "restaurantFeatures"
                }
            },
            {
                $unwind: {
                    path: "$restaurantFeatures",
                    preserveNullAndEmptyArrays: true

                }
            },
        ];
        await Restaurant.aggregate(aggregate)
            .then(restaurantDetail => {
                res.status(constants.OK_STATUS).json({ restaurantDetail, message: "Restaurant details get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: err });
            });
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while finding data" });
    }
});


router.get('/restaurantlist', async (req, res, next) => {
    try {

        let aggregate = [
            {
                $match: {
                    userId: new ObjectId(req.params.id)
                }
            }
        ];
        await Restaurant.aggregate(aggregate)
            .then(restaurantList => {
                res.status(constants.OK_STATUS).json({ restaurantList, message: "Restaurant details get successfully." });
            }).catch(error => {
                console.log(error)
                res.status(constants.BAD_REQUEST).json({ message: "Error while get Restaurant list", error: error });
            });
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while finding data" });
    }
});

router.put('/profile_image', async (req, res) => {
    try {
        if (req.files != null) {
            let imageData = await common_helper.upload(req.files['image'], "uploads");
            if (imageData.data.length > 0) {
                const getRestaurantDetail = await Restaurant.findOne({ userId: req.loginUser.id });
                if (getRestaurantDetail && getRestaurantDetail.restaurantProfilePhoto) {
                    if (await fs.existsSync(`./${getRestaurantDetail.restaurantProfilePhoto}`))
                        await fs.unlinkSync(`./${getRestaurantDetail.restaurantProfilePhoto}`);
                }
                const obj = {
                    restaurantProfilePhoto: imageData.data[0].path
                }
                const update_resp = await common_helper.update(Restaurant, { "userId": req.loginUser.id }, obj)
                if (update_resp.status === 0) {
                    res.json({ status: 0, message: "Error occured while Profile Image upload." });
                } else {
                    res.status(constants.OK_STATUS).json({ status: 1, message: "Profile Image upload successfully.", update_resp });
                }
            } else {
                res.status(constants.BAD_REQUEST).json({ "message": "File not uploaded" });
            }
        } else {
            res.status(constants.BAD_REQUEST).json({ "message": "Please Upload proper file" });
        }
    } catch (error) {
        console.log("error : ", error)
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while uploading the profile image" });
    }
})

router.put('/cover_image', async (req, res) => {
    try {
        if (req.files != null) {
            let imageData = await common_helper.upload(req.files['image'], "uploads");
            if (imageData.data.length > 0) {
                const getRestaurantDetail = await Restaurant.findOne({ userId: req.loginUser.id });
                if (getRestaurantDetail && getRestaurantDetail.restaurantCoverPhoto) {
                    if (await fs.existsSync(`./${getRestaurantDetail.restaurantCoverPhoto}`))
                        await fs.unlinkSync(`./${getRestaurantDetail.restaurantCoverPhoto}`);
                }
                const obj = {
                    restaurantCoverPhoto: imageData.data[0].path
                }
                const update_resp = await common_helper.update(Restaurant, { "userId": req.loginUser.id }, obj)
                if (update_resp.status === 0) {
                    res.json({ status: 0, message: "Error occured while cover image upload." });
                } else {
                    res.status(constants.OK_STATUS).json({ status: 1, message: "Cover image upload successfully.", update_resp });
                }
            } else {
                res.status(constants.BAD_REQUEST).json({ "message": "File not uploaded" });
            }
        } else {
            res.status(constants.BAD_REQUEST).json({ "message": "Please Upload proper file" });
        }
    } catch (error) {
        console.log("error : ", error)
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while uploading the cover image" });
    }
})



router.put('/upload_gallery_image', async (req, res) => {
    try {
        /**For multiple restaurant to set retaurant id */
        const find_restaurant_response = await Restaurant.findOne({ userId: req.loginUser.id })
        /**********/

        if (req.files != null) {
            let imageData = await common_helper.upload(req.files['image'], "uploads");
            if (imageData.data.length > 0) {
                let modifiedImageUrl = imageData.data.filter(singleImage => {
                    return singleImage.url = singleImage.path;
                })

                if (req.body.type === "Ambience") {
                    const getRestaurantDetail = await RestaurantGallery.findOneAndUpdate({ restaurantId: find_restaurant_response._id }, { $push: { 'ambience': modifiedImageUrl } }, { new: true, upsert: true });
                    res.status(constants.OK_STATUS).json({ "message": "File uploaded", getRestaurantDetail });
                } else {
                    const getRestaurantDetail = await RestaurantGallery.findOneAndUpdate({ restaurantId: find_restaurant_response._id }, { $push: { 'food': modifiedImageUrl } }, { new: true, upsert: true });
                    res.status(constants.OK_STATUS).json({ "message": "File uploaded", getRestaurantDetail });
                }
            } else {
                res.status(constants.BAD_REQUEST).json({ "message": "File not uploaded" });
            }
        } else {
            res.status(constants.BAD_REQUEST).json({ "message": "Please Upload proper file" });
        }
    } catch (error) {
        console.log("error : ", error)
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while uploading the cover image" });
    }
})


router.put('/delete_gallery_image', async (req, res) => {
    try {
        /**For multiple restaurant to set retaurant id */
        const find_restaurant_response = await Restaurant.findOne({ userId: req.loginUser.id })
        /**********/
        console.log("req.body.type : ", req.body.type)
        if (req.body.type === "Ambience") {
            await RestaurantGallery.findOneAndUpdate({ restaurantId: find_restaurant_response._id }, { $pull: { 'ambience': { _id: ObjectId(req.body.imageId) } } }, { new: true })
            res.status(constants.OK_STATUS).json({ "message": "File deleted successfully" });

        }
        else if (req.body.type === "Food") {
            await RestaurantGallery.findOneAndUpdate({ restaurantId: find_restaurant_response._id }, { $pull: { 'food': { _id: ObjectId(req.body.imageId) } } }, { new: true })
            res.status(constants.OK_STATUS).json({ "message": "File deleted successfully" });

        }
        else {
            res.status(constants.BAD_REQUEST).json({ "message": "Please enter proper type" });
        }
    } catch (error) {
        console.log("error : ", error)
        res.status(constants.BAD_REQUEST).json({ error: error, message: "Error occured while removving the image" });
    }
})


module.exports = router;
