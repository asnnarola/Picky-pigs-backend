var jwt = require('jsonwebtoken');
var config = require('../config');

exports.jwtValidation = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.SECRET_KEY, function (err, decoded) {
            if (err) {
                return res.status(config.UNAUTHORIZED).json({
                    message: err.message
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(config.UNAUTHORIZED).json({
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
        else if (req.decoded.role == "user" && req.baseUrl.match('/frontend')) {
            console.log("as a user")
            req.loginUser = req.decoded;
            next();
        } else {
            return res.status(config.UNAUTHORIZED).json({
                message: 'Unauthorized access ---'
            });
        }
    } else {
        return res.status(config.UNAUTHORIZED).json({
            message: 'Unauthorized access'
        });
    }
}

