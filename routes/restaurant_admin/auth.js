var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken")
var bcrypt = require("bcrypt")
var RestaurantAdmin = require("../../models/restaurantAdmin");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
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
module.exports = router;
