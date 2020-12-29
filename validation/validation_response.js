const config = require("../config/config");
const constants = require("../config/constants");
const { validationResult } = require('express-validator');

module.exports = function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(constants.VALIDATION_FAILURE_STATUS).json({
            status: 0,
            message: "Validation error",
            error: convertErrorObjectToArray(errors.mapped())
        });
    }
    else {
        next();
    }

}

function convertErrorObjectToArray(errors) {
    let returnArray = [];
    Object.keys(errors).map(error => {
        returnArray.push(errors[error].msg);
    });
    return returnArray;
}
