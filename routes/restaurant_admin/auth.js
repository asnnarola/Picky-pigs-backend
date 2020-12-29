var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
var RestaurantAdmin = require("../../models/restaurantAdmin");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const forgotPasswordMail = require('../../mails/forgotPasswordMail');
const sendMail = require('../../mails/sendMail');
const adminAuth = require('../../validation/admin/adminAuth');

const saltRounds = 10;


//Admin login
router.post('/login', auth.login, validation_response, async (req, res, next) => {
    var admin_data = await common_helper.findOne(RestaurantAdmin, { "email": req.body.email })

    if (admin_data.status === 1 && admin_data.data) {

        const comparePassword = await (bcrypt.compare(req.body.password, admin_data.data.password))
        if (comparePassword === true) {
            let token_data = {
                id: admin_data.data._id,
                email: admin_data.data.email,
                role: "restaurant_admin"
            }
            var token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })
            LOGGER.trace("Login successfully = ", admin_data);
            return res.status(config.OK_STATUS).json({ token, message: "Logged in successfully", error: false });
        } else {
            LOGGER.error("invalid password request = ", admin_data);
            return res.status(config.UNAUTHORIZED).json({ message: "Invalid Password!", error: true })
        }
    } else {
        LOGGER.error("User is not found with this email  = ", req.body);
        return res.status(config.BAD_REQUEST).json({ message: "Email is not found.", error: true });
    }
});

router.post('/forgot_password', adminAuth.forgotPassword, validation_response, async (req, res, next) => {
    var data = await common_helper.findOne(RestaurantAdmin, { "email": req.body.email })
    if (data.status === 0) {
        res.json({ status: 0, message: "Error while finding email" });
    }

    if (data.status === 1 && data.data) {
        var obj = {
            id: data.data._id,
            email: data.data.email,
        };

        var token = jwt.sign(obj, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })
        // var token = common_helper.sign({ id: register_resp.data._id })


        await common_helper.update(RestaurantAdmin, { "_id": data.data._id }, { forgotPasswordToken: token })

        const emailContent = {
            to: req.body.email,
            subject: 'Reset password for Picky pigs',
            token: `${config.CLIENT_ORIGIN}/reset_password/${token}`,
            filePath: "./views/resturant_admin/auth/forgotpassword.ejs"
        }
        await sendMail(emailContent)
            .then(emailResp => {
                res.status(config.OK_STATUS).json({ token, message: "Reset link was sent to your email address" });
            }).catch(error => {
                return res.status(config.BAD_REQUEST).json({ message: "Error occurred while sent email.", error: error });
            });

    } else {
        return res.status(config.OK_STATUS).json({ status: 1, message: "Email is not found !", error: true });
    }
})

router.post('/reset_password', adminAuth.resetPassword, validation_response, async (req, res, next) => {
    if (req.body.token) {
        jwt.verify(req.body.token, config.SECRET_KEY,
            async (err, decoded) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        res.json({ status: 0, message: "Link has been expired" });
                    } else {
                        res.json({ status: 0, message: "Invalid token sent" });
                    }
                } else {
                    var data = await common_helper.findOne(RestaurantAdmin, { "_id": config.OBJECT_ID(decoded.id), forgotPasswordToken: req.body.token })

                    if (data.data && data.status === 1) {
                        if (decoded.id) {
                            var update_resp = await common_helper.update(RestaurantAdmin, { "_id": data.data._id }, { password: bcrypt.hashSync(req.body.newPassword, saltRounds), $unset: { forgotPasswordToken: "" } })

                            if (update_resp.status === 0) {
                                res.json({
                                    status: 0,
                                    message: "Error occured while update password"
                                });
                            } else {
                                res
                                    .status(config.OK_STATUS)
                                    .json({ status: 1, message: "Password has been changed" });
                            }
                        }
                    } else {
                        res
                            .status(config.BAD_REQUEST)
                            .json({ status: 0, message: "Link has expired" });
                    }
                }
            })

    } else {
        res.status(config.BAD_REQUEST).json({ message: "Token not provided", error: true });
    }
});



router.post('/create', async (req, res, next) => {

    const insert_resp = await common_helper.insert(RestaurantAdmin, req.body);

    if (insert_resp.status === 1 && insert_resp.data) {
        res.status(config.OK_STATUS).json(insert_resp);
    } else {
        res.status(config.BAD_REQUEST).json(insert_resp);
    }
})
module.exports = router;
