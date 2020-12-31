var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const user = require("../../models/users");
const All_Users = require("../../models/all_users");
const RestaurantAdmin = require("../../models/restaurantAdmin");
const sendMail = require("../../mails/sendMail");
const template = require("../../mails/template");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const adminAuth = require('../../validation/admin/adminAuth');
const manage_module = require('../../validation/admin/manage_module');
const validation_response = require('../../validation/validation_response');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const passwordValidatorSchema = new passwordValidator();
const saltRounds = 10;

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

//signup
router.post('/user_signup', auth.signup, validation_response, async (req, res, next) => {
    try {
        const data = await common_helper.findOne(All_Users, { "email": req.body.email })
        if (data.status === 1 && data.data) {
            res.status(constants.BAD_REQUEST).json({ status: 0, message: "Email is already registered" });
        } else {
            if (passwordValidatorSchema.validate(req.body.password) == true) {
                let obj = {
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    password: req.body.password,
                    role: req.body.role
                };
                const register_allUser_resp = await common_helper.insert(All_Users, obj);
                obj.userId = register_allUser_resp.data._id;
                const register_user_resp = await common_helper.insert(user, obj);
                const token = jwt.sign({ id: register_allUser_resp.data._id }, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })
                const emailContent = {
                    to: req.body.email,
                    subject: 'Reset password for Picky pigs',
                    token: `${config.CLIENT_ORIGIN}/reset_password/${token}`,
                    filePath: "./views/resturant_admin/auth/forgotpassword.ejs"
                }

                const emailResp = await sendMail(emailContent);

                register_allUser_resp.data = {
                    email: register_allUser_resp.data.email,
                    name: register_user_resp.data.name,
                    phone: register_user_resp.data.phone,
                    accountType: register_allUser_resp.data.accountType,
                    emailVerified: register_allUser_resp.data.emailVerified,
                }
                res.status(constants.OK_STATUS).json({ ...register_allUser_resp, message: "You are registered successfully and verification link is send to your email id" });
            }
            else {
                res.status(constants.BAD_REQUEST).json({ "status": 0, "message": "Please Enter password of atleast 8 characters including 1 Uppercase,1 Lowercase,1 digit,1 special character" })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ status: 0, err: err });
    }
});

// verify email
router.post('/verification', async (req, res, next) => {
    try {
        let token = req.body.token;
        let decodeToken = jwt.verify(token, config.SECRET_KEY)
        const data = await common_helper.findOne(All_Users, { "_id": config.OBJECT_ID(decodeToken.id) })

        if (data.status === 1 && data.data) {
            if (data.data.emailVerified) {
                data.data = {
                    email: data.data.email,
                    accountType: data.data.accountType,
                    emailVerified: data.data.emailVerified,
                }
                return res.status(constants.OK_STATUS).json({ ...data, status: 1, message: "Email is already verified !" })
            } else {
                const user_data = await common_helper.update(user, { "_id": decodeToken.id }, { emailVerified: true })
                user_data.data = {
                    email: user_data.data.email,
                    accountType: user_data.data.accountType,
                    emailVerified: user_data.data.emailVerified,
                }
                return res.status(constants.OK_STATUS).json({ ...user_data.data, message: "Email has been verified !", error: false })
            }
        } else {
            return res.status(constants.NOT_FOUND).json({ status: 1, message: "Invalid token entered !", error: true });
        }
    } catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ status: 0, err: err });
    }
})

//signin with email
router.post('/login', auth.login, validation_response, async (req, res, next) => {
    try {
        const user_data = await common_helper.findOne(All_Users, { "email": req.body.email })
        if (user_data.status === 1 && user_data.data) {

            const comparePassword = await (bcrypt.compare(req.body.password, user_data.data.password))
            if (comparePassword === true) {
                if (user_data.data.emailVerified) {
                    let token_data = {
                        id: user_data.data._id, email: user_data.data.email,
                        // fullName: user_data.data.fullName,
                        accountType: user_data.data.accountType,
                        emailVerified: user_data.data.emailVerified,
                        role: user_data.data.role
                    }
                    const token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

                    LOGGER.trace("Login successfully = ", user_data);
                    return res.status(constants.OK_STATUS).json({ token, message: "Logged in successfully", error: false });
                } else {
                    LOGGER.error("Error occured while checking login/verification = ", user_data);
                    return res.status(constants.UNAUTHORIZED).json({ message: "Email is not verified.", error: true });
                }

            } else {
                LOGGER.error("invalid password request = ", user_data);
                return res.status(constants.UNAUTHORIZED).json({ message: "Invalid Password!", error: true })
            }
        } else {
            LOGGER.error("User is not found with this email  = ", req.body);
            return res.status(constants.BAD_REQUEST).json({ message: "Email not found.", error: true });
        }
    } catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ status: 0, err: err });
    }
});

//signin with google
router.post('/google', async (req, res, next) => {
    const user_data = await common_helper.findOne(All_Users, { "googleId": req.body.googleId })

    if (user_data.status === 1 && user_data.data) {
        //update
        const obj = {
            name: req.body.name,
            email: req.body.email,
            accountType: "google"
        };
        const register_allUser_resp = await common_helper.update(All_Users, { "googleId": user_data.data.googleId }, obj)
        const register_user_resp = await common_helper.update(user, { "_id": register_allUser_resp.data._id }, obj)
        let token_data = {
            id: register_allUser_resp.data._id,
            sociaId: register_allUser_resp.data.googleId,
            email: register_allUser_resp.data.email,
            name: register_user_resp.data.name,
            accountType: register_allUser_resp.data.accountType,
            emailVerified: register_allUser_resp.data.emailVerified
        }
        const token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        return res.status(constants.OK_STATUS).json({ token, message: "Loggied in succesfully and update!" })
    } else {
        //insert
        let obj = {
            name: req.body.name,
            email: req.body.email,
            googleId: req.body.googleId,
            accountType: "google",
            role: req.body.role
        };
        const register_allUser_resp = await common_helper.insert(All_Users, obj);
        obj.userId = register_allUser_resp.data._id;
        const register_user_resp = await common_helper.insert(user, obj);
        let token_data = {
            id: register_allUser_resp.data._id,
            sociaId: register_allUser_resp.data.googleId,
            email: register_allUser_resp.data.email,
            register_user_resp: register_user_resp.data.name,
            accountType: register_allUser_resp.data.accountType,
            emailVerified: register_allUser_resp.data.emailVerified
        }
        const token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        return res.status(constants.OK_STATUS).json({ token, message: "Loggeed in successfully insert !" });
    }
});

router.post('/facebook', async (req, res, next) => {
    var user_data = await common_helper.findOne(All_Users, { "facebookId": user_data.data.facebookId })
    if (user_data.status === 1 && user_data.data) {
        //update
        const obj = {
            name: req.body.name,
            email: req.body.email,
            accountType: req.body.graphDomain
        };
        const register_allUser_resp = await common_helper.update(All_Users, { "facebookId": user_data.data.facebookId }, obj)
        const register_user_resp = await common_helper.update(user, { "_id": register_allUser_resp.data._id }, obj)
        let token_data = {
            id: register_allUser_resp.data._id,
            sociaId: register_allUser_resp.data.facebookId,
            email: register_allUser_resp.data.email,
            name: register_user_resp.data.name,
            accountType: register_allUser_resp.data.accountType,
            emailVerified: register_allUser_resp.data.emailVerified
        }
        const token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        return res.status(constants.OK_STATUS).json({ token, message: "Loggied in succesfully and update!" })
    } else {
        //insert
        let obj = {
            name: req.body.name,
            email: req.body.email,
            facebookId: req.body.id,
            accountType: req.body.graphDomain
        };

        const register_allUser_resp = await common_helper.insert(All_Users, obj);
        obj.userId = register_allUser_resp.data._id;
        const register_user_resp = await common_helper.insert(user, obj);

        //token generate with user data then send it
        let token_data = {
            id: register_allUser_resp.data._id,
            sociaId: register_allUser_resp.data.facebookId,
            email: register_allUser_resp.data.email,
            fullName: register_user_resp.data.fullName,
            accountType: register_allUser_resp.data.accountType,
            emailVerified: register_allUser_resp.data.emailVerified
        }
        const token = jwt.sign(token_data, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })

        return res.status(constants.OK_STATUS).json({ token, message: "Loggeed in successfully insert !" });
    }
});

router.post('/restaurant_signup', manage_module.create_restaurant, validation_response, async (req, res, next) => {
    try {
        const register_allUser_resp = await common_helper.insert(All_Users, req.body);
        req.body.userId = register_allUser_resp.data._id;
        const register_user_resp = await common_helper.insert(RestaurantAdmin, req.body);

        if (register_allUser_resp.status === 1 && register_allUser_resp.data) {
            res.status(constants.OK_STATUS).json(register_allUser_resp);
        } else {
            res.status(constants.BAD_REQUEST).json(register_allUser_resp);
        }
    } catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ status: 0, err: err });
    }
})


router.post('/forgot_password', adminAuth.forgotPassword, validation_response, async (req, res, next) => {
    try {
        const data = await common_helper.findOne(All_Users, { "email": req.body.email })
        if (data.status === 0) {
            res.json({ status: 0, message: "Error while finding email" });
        }

        if (data.status === 1 && data.data) {
            const obj = {
                id: data.data._id,
                email: data.data.email,
            };

            const token = jwt.sign(obj, config.SECRET_KEY, { expiresIn: config.TOKEN_EXPIRED_TIME })
            // var token = common_helper.sign({ id: register_resp.data._id })


            await common_helper.update(All_Users, { "_id": data.data._id }, { forgotPasswordToken: token })

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
    } catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ status: 0, err: err });
    }
})

router.post('/reset_password', adminAuth.resetPassword, validation_response, async (req, res, next) => {
    try {
        if (req.body.token) {
            jwt.verify(req.body.token, config.SECRET_KEY,
                async (err, decoded) => {
                    if (err) {
                        if (err.name === "TokenExpiredError") {
                            res.status(constants.BAD_REQUEST).json({ status: 0, message: "Link has been expired" });
                        } else {
                            res.status(constants.BAD_REQUEST).json({ status: 0, message: "Invalid token sent" });
                        }
                    } else {
                        const data = await common_helper.findOne(All_Users, { "_id": config.OBJECT_ID(decoded.id), forgotPasswordToken: req.body.token })

                        if (data.data && data.status === 1) {
                            if (decoded.id) {
                                if (passwordValidatorSchema.validate(req.body.password) == true) {
                                    const update_resp = await common_helper.update(All_Users, { "_id": data.data._id }, { password: bcrypt.hashSync(req.body.newPassword, saltRounds), $unset: { forgotPasswordToken: "" } })

                                    if (update_resp.status === 0) {
                                        res.json({
                                            status: 0,
                                            message: "Error occured while update password"
                                        });
                                    } else {
                                        res.status(constants.OK_STATUS).json({ status: 1, message: "Password has been changed" });
                                    }
                                }
                                else {
                                    res.status(constants.BAD_REQUEST).json({ "status": 0, "message": "Please Enter password of atleast 8 characters including 1 Uppercase,1 Lowercase,1 digit,1 special character" })
                                }
                            }
                        } else {
                            res
                                .status(constants.BAD_REQUEST)
                                .json({ status: 0, message: "Link has expired" });
                        }
                    }
                })

        } else {
            res.status(constants.BAD_REQUEST).json({ message: "Token not provided", error: true });
        }
    } catch (err) {
        console.log(err)
        res.status(constants.BAD_REQUEST).json({ status: 0, err: err });
    }
});

module.exports = router;
