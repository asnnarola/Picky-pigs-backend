var jwt = require('jsonwebtoken');
var config = require('../config/config');
const constants = require('../config/constants');
const All_Users = require('../models/all_users');
const moment = require('moment');

exports.jwtValidation = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.SECRET_KEY, function (err, decoded) {
            if (err) {
                return res.status(constants.UNAUTHORIZED).json({
                    message: err.message
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(constants.UNAUTHORIZED).json({
            message: 'Unauthorized access'
        });
    }
}

exports.authorization = function (req, res, next) {
    if (req.decoded) {
        if (req.decoded.role == "super_admin" && req.baseUrl.match('/super_admin')) {
            console.log("as a super admin")
            req.loginUser = req.decoded;
            next();
        }
        else if (req.decoded.role == "restaurant_admin" && req.baseUrl.match('/restaurant_admin')) {
            console.log("as a restaurant admin")
            req.loginUser = req.decoded;
            next();
        }
        else if (req.decoded.role == "tablet" && req.baseUrl.match('/tablet')) {
            console.log("as a tablet")
            req.loginUser = req.decoded;
            next();
        }
        else if (req.decoded.role == "user" && req.baseUrl.match('/frontend')) {
            console.log("as a user")
            req.loginUser = req.decoded;
            next();
        } else {
            return res.status(constants.UNAUTHORIZED).json({
                message: 'Unauthorized access ---'
            });
        }
    } else {
        return res.status(constants.UNAUTHORIZED).json({
            message: 'Unauthorized access'
        });
    }
}

exports.subscriptionAuthorization = function (req, res, next) {
    try {
        if (req.loginUser.subscriptionLevel == "freetrial" && (moment(req.loginUser.subscriptionDate).add(3,'month') > moment())) {
            console.log("free trial plan")
        }
        else if (req.loginUser.subscriptionLevel == "standard" && (moment(req.loginUser.subscriptionDate).add(1,'month') > moment())) {
            console.log("standard plan")
        }
        else if (req.loginUser.subscriptionLevel == "premium" && (moment(req.loginUser.subscriptionDate).add(1,'month') > moment())) {
            console.log("premium plan")
        } else {
            console.log("Your subscription was expired")
            return res.status(constants.BAD_REQUEST).json({
                message: "Your subscription was expired"
            });
        }
    } catch (error) {
        console.log("error", error)
        return res.status(constants.BAD_REQUEST).json({
            message: "something want wrong"
        });
    }
}

exports.accessManagement = function (accessId) {
    return async (req, res, next) => {
        try {
            const role = req.loginUser.role;
            let check_permission = await All_Users.findOne({
                _id: new ObjectId(req.loginUser.id),
                permission: { $in: [accessId] }
            })
            if (role == "restaurant_admin" && check_permission !== null && check_permission !== undefined) {
                next();
            } else {
                return res.status(constants.BAD_REQUEST).json({ "message": "You don't have permission" });
            }
        } catch (error) {
            console.log("error ", error)
            return res.status(constants.BAD_REQUEST).json({ "message": "Something want wrong." });
        }
    }
}
