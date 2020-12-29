var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
const SuperAdmin = require("../../models/superAdmin");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const forgotPasswordMail = require('../../mails/forgotPasswordMail');
const sendMail = require('../../mails/sendMail');
const adminAuth = require('../../validation/admin/adminAuth');

const saltRounds = 10;



router.post('/login', auth.login, validation_response, async (req, res, next) => {
    const admin_data = await common_helper.findOne(SuperAdmin, { "email": req.body.email })

    if (admin_data.status === 1 && admin_data.data) {

        const comparePassword = await (bcrypt.compare(req.body.password, admin_data.data.password))
        if (comparePassword === true) {
            const token_data = {
                id: admin_data.data._id,
                email: admin_data.data.email,
                role: "super_admin"
            }
            const token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })
            LOGGER.trace("Login successfully = ", admin_data);
            return res.status(constants.OK_STATUS).json({ token, message: "Logged in successfully", error: false });
        } else {
            LOGGER.error("invalid password request = ", admin_data);
            return res.status(constants.UNAUTHORIZED).json({ message: "Invalid Password!", error: true })
        }
    } else {
        LOGGER.error("User is not found with this email  = ", req.body);
        return res.status(constants.BAD_REQUEST).json({ message: "Email is not found.", error: true });
    }
});

router.post('/forgot_password', adminAuth.forgotPassword, validation_response, async (req, res, next) => {
    const data = await common_helper.findOne(SuperAdmin, { "email": req.body.email })
    if (data.status === 0) {
        res.json({ status: 0, message: "Error while finding email" });
    }

    if (data.status === 1 && data.data) {
        const obj = {
            id: data.data._id,
            email: data.data.email,
        };

        const token = jwt.sign(obj, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        await common_helper.update(SuperAdmin, { "_id": data.data._id }, { forgotPasswordToken: token })

        const emailContent = {
            to: req.body.email,
            subject: 'Reset password for Picky pigs',
            token: `${config.CLIENT_ORIGIN}/reset_password/${token}`,
            filePath: "./views/resturant_admin/auth/forgotpassword.ejs"
        }
        await sendMail(emailContent)
            .then(emailResp => {
                res.status(constants.OK_STATUS).json({ token, message: "Reset link was sent to your email address" });
            }).catch(error => {
                return res.status(constants.BAD_REQUEST).json({ message: "Error occurred while sent email.", error: error });
            });

    } else {
        return res.status(constants.OK_STATUS).json({ status: 1, message: "Email is not found !", error: true });
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
                    const data = await common_helper.findOne(SuperAdmin, { "_id": config.OBJECT_ID(decoded.id), forgotPasswordToken: req.body.token })

                    if (data.data && data.status === 1) {
                        if (decoded.id) {
                            const update_resp = await common_helper.update(SuperAdmin, { "_id": data.data._id }, { password: bcrypt.hashSync(req.body.newPassword, saltRounds), $unset: { forgotPasswordToken: "" }  })

                            if (update_resp.status === 0) {
                                res.json({ status: 0, message: "Error occured while update password" });
                            } else {
                                res.status(constants.OK_STATUS).json({ status: 1, message: "Password has been changed" });
                            }
                        }
                    } else {
                        res .status(config.BAD_REQUEST).json({ status: 0, message: "Link has expired" });
                    }
                }
            })

    } else {
        res.status(constants.BAD_REQUEST).json({ message: "Token not provided", error: true });
    }
});



router.post('/create', async (req, res, next) => {

    const insert_resp = await common_helper.insert(SuperAdmin, req.body);

    if (insert_resp.status === 1 && insert_resp.data) {
        res.status(constants.OK_STATUS).json(insert_resp);
    } else {
        res.status(constants.BAD_REQUEST).json(insert_resp);
    }
})
module.exports = router;
