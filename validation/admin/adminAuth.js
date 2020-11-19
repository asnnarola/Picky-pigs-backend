const { check } = require('express-validator');

module.exports = {
    forgotPassword: [
        check('email')
            .trim()
            .not().isEmpty().withMessage('Email is required')
            .exists().withMessage('Email is required')
            .isLength({ min: 2, max: 100 }).withMessage('Email should be between 2 to 100 characters long'),
    ],
    resetPassword: [
        check("newPassword", "Required password")
            .isLength({ min: 6 })
            .custom((value, { req, loc, path }) => {
                if (value !== req.body.confirmPassword) {
                    // trow error if passwords do not match
                    throw new Error("Passwords don't match");
                } else {
                    return value;
                }
            })
    ],
};
