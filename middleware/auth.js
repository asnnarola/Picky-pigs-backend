var jwt = require('jsonwebtoken');
var config = require('../config/config');
const constants = require('../config/constants');
const All_Users = require('../models/all_users');

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

exports.accessManagement = function (accessId) {
    return async (req, res, next) => {
        try {
            console.log("accessId : ",accessId)
            const role = req.loginUser.role;
            let check_permission = await All_Users.findOne({
                _id: new ObjectId(req.loginUser.id),
                permission: { $in: [accessId] }
            })
            if (role == "restaurant_admin" && check_permission !== null && check_permission !== undefined) {
                next();
            } else {
                res.status(constants.BAD_REQUEST).json({ "message": "You don't have permission" });
            }
        } catch (error) {
            console.log("error ",error)
            res.status(constants.BAD_REQUEST).json({ "message": "Something want wrong." });
        }
    }
}
