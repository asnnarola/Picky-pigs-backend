var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
var user = require("../../models/users");
var sendMail = require("../../mails/sendMail");
var template = require("../../mails/template");
const common_helper = require('../../helpers/common');
const config = require('../../config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');


//signup
router.post('/signup', auth.signup, validation_response, async (req, res, next) => {
    var data = await common_helper.findOne(user, { "email": req.body.email })
    if (data.status === 1 && data.data) {
        res.status(config.BAD_REQUEST).json({ status: 0, message: "Email is already registered" });
    } else {
        var obj = {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password
        };
        var register_resp = await common_helper.insert(user, obj);
        //token generate with user data then send it
        var token = jwt.sign({ id: register_resp.data._id }, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })
        const emailContent = {
            to: req.body.email,
            subject: 'Reset password for Picky pigs',
            token: `${config.CLIENT_ORIGIN}/reset_password/${token}`,
            filePath: "./views/resturant_admin/auth/forgotpassword.ejs"
        }
        const emailResp = await sendMail(emailContent);

        register_resp.data = {
            email: register_resp.data.email,
            fullName: register_resp.data.fullName,
            phone: register_resp.data.phone,
            accountType: register_resp.data.accountType,
            isVerified: register_resp.data.isVerified,
        }
        res.status(config.OK_STATUS).json({ ...register_resp, message: "You are registered successfully and verification link is send to your email id" });
    }
});

// verify email
router.post('/verification', async (req, res, next) => {
    let token = req.body.token;
    let decodeToken = jwt.verify(token, config.SECRET_KEY)
    var data = await common_helper.findOne(user, { "_id": config.OBJECT_ID(decodeToken.id) })

    if (data.status === 1 && data.data) {
        if (data.data.isVerified) {
            data.data = {
                email: data.data.email,
                accountType: data.data.fullName,
                isVerified: data.data.isVerified,
            }
            return res.status(config.OK_STATUS).json({ ...data, status: 1, message: "Email is already verified !" })
        } else {
            var user_data = await common_helper.update(user, { "_id": decodeToken.id }, { isVerified: true })
            user_data.data = {
                email: user_data.data.email,
                accountType: user_data.data.fullName,
                isVerified: user_data.data.isVerified,
            }
            return res.status(config.OK_STATUS).json({ ...user_data.data, message: "Email has been verified !", error: false })
        }
    } else {
        return res.status(config.OK_STATUS).json({ status: 1, message: "Email is not found !", error: true });
    }
})

//signin with email
router.post('/login', auth.login, validation_response, async (req, res, next) => {
    var user_data = await common_helper.findOne(user, { "email": req.body.email, "accountType": "email" })
    if (user_data.status === 1 && user_data.data) {
        if (req.body.password === user_data.data.password) {
            if (user_data.data.isVerified) {
                let token_data = {
                    id: user_data.data._id, email: user_data.data.email,
                    fullName: user_data.data.fullName,
                    accountType: user_data.data.accountType,
                    isVerified: user_data.data.isVerified
                }
                var token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

                LOGGER.trace("Login successfully = ", user_data);
                return res.status(config.OK_STATUS).json({ token, message: "Logged in successfully", error: false });
            } else {
                LOGGER.error("Error occured while checking login/verification = ", user_data);
                return res.status(config.UNAUTHORIZED).json({ message: "Email is not verified.", error: true });
            }
        } else {
            LOGGER.error("invalid password request = ", user_data);
            return res.status(config.UNAUTHORIZED).json({ message: "Invalid Password!", error: true })
        }
    } else {
        LOGGER.error("User is not found with this email  = ", req.body);
        return res.status(config.BAD_REQUEST).json({ message: "Email is not found.", error: true });
    }
});

//signin with google
router.post('/google', async (req, res, next) => {
    var user_data = await common_helper.findOne(user, { "email": req.body.googleId })

    if (user_data.status === 1 && user_data.data) {
        //update
        var obj = {
            fullName: req.body.name,
            email: req.body.email,
            accountType: "google"
        };
        var user_resp = await common_helper.update(user, { "googleId": user_data.data.googleId }, obj)
        let token_data = {
            id: user_resp.data.googleId,
            email: user_resp.data.email,
            fullName: user_resp.data.fullName,
            accountType: user_resp.data.accountType,
            isVerified: user_resp.data.isVerified
        }
        var token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        return res.status(config.OK_STATUS).json({ token, message: "Loggied in succesfully and update!" })
    } else {
        //insert
        var obj = {
            fullName: req.body.name,
            email: req.body.email,
            googleId: req.body.googleId,
            accountType: "google"
        };
        var user_resp = await common_helper.insert(user, obj);
        let token_data = {
            id: user_resp.data.googleId,
            email: user_resp.data.email,
            fullName: user_resp.data.fullName,
            accountType: user_resp.data.accountType,
            isVerified: user_resp.data.isVerified
        }
        var token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        return res.status(config.OK_STATUS).json({ token, message: "Loggeed in successfully insert !" });
    }
});

router.post('/facebook', async (req, res, next) => {
    var user_data = await common_helper.findOne(user, { "email": req.body.id })
    if (user_data.status === 1 && user_data.data) {
        //update
        var obj = {
            fullName: req.body.name,
            email: req.body.email,
            accountType: req.body.graphDomain
        };
        var user_resp = await common_helper.update(user, { "facebookId": user_data.data.facebookId }, obj)
        let token_data = {
            id: user_resp.data.facebookId,
            email: user_resp.data.email,
            fullName: user_resp.data.fullName,
            accountType: user_resp.data.accountType,
            isVerified: user_resp.data.isVerified
        }
        var token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        return res.status(config.OK_STATUS).json({ token, message: "Loggied in succesfully and update!" })
    } else {
        //insert
        var obj = {
            fullName: req.body.name,
            email: req.body.email,
            facebookId: req.body.id,
            accountType: req.body.graphDomain
        };
        var user_resp = await common_helper.insert(user, obj);
        //token generate with user data then send it
        let token_data = {
            id: user_resp.data.facebookId,
            email: user_resp.data.email,
            fullName: user_resp.data.fullName,
            accountType: user_resp.data.accountType,
            isVerified: user_resp.data.isVerified
        }
        var token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        return res.status(config.OK_STATUS).json({ token, message: "Loggeed in successfully insert !" });
    }
});
module.exports = router;
