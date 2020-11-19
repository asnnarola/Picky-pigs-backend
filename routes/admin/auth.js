var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
var adminUser = require("../../models/adminUser");
const common_helper = require('../../helpers/common');
const config = require('../../config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const forgotPasswordMail = require('../../mails/forgotPasswordMail');
const sendMail = require('../../mails/sendMail');
const adminAuth = require('../../validation/admin/adminAuth');



//Admin login
router.post('/login', auth.login, validation_response, async (req, res, next) => {
    var admin_data = await common_helper.findOne(adminUser, { "email": req.body.email })

    if (admin_data.status === 1 && admin_data.data) {
        if (req.body.password === admin_data.data.password) {
                let token_data = {
                    id: admin_data.data._id,
                    email: admin_data.data.email
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
    var data = await common_helper.findOne(adminUser, { "email": req.body.email })
    if (data.status === 0) {
        res.json({ status: 0, message: "Error while finding email" });
    }

    if (data.status === 1 && data.data) {
        var obj = {
            id: data.data._id,
            email: data.data.email,
        };

        var token = jwt.sign(obj , config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })
        // var token = common_helper.sign({ id: register_resp.data._id })

        sendMail(req.body.email, forgotPasswordMail.confirm(token))

        res.status(config.OK_STATUS).json({token, message: "Reset link was sent to your email address" });
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
                    var data = await common_helper.findOne(adminUser, { "_id": config.OBJECT_ID(decoded.id) })

                    if (data.data && data.status === 1) {
                        if (decoded.id) {
                            var update_resp = await common_helper.update(adminUser, { "_id": data.data._id }, { password: req.body.newPassword })

                            if (update_resp.status === 0) {
                                res.json({
                                    status: 0,
                                    message: "Error occured while verifying user's email"
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

module.exports = router;
