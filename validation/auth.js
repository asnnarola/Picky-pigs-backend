const { check } = require('express-validator');

module.exports = {
    signup: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        check('email')
            .trim()
            .not().isEmpty().withMessage('Email is required')
            .exists().withMessage('Email is required')
            .isEmail().withMessage('Enter proper Email')
            .isLength({ min: 2, max: 100 }).withMessage('Email should be between 2 to 100 characters long'),
        check("password", "invalid password")
            .isLength({ min: 4 })
            .custom((value, { req, loc, path }) => {
                if (value !== req.body.confirmPassword) {
                    // trow error if passwords do not match
                    throw new Error("Passwords don't match");
                } else {
                    return value;
                }
            })
    ],
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
    login:[
        check('email')
            .trim()
            .not().isEmpty().withMessage('Email is required')
            .exists().withMessage('Email is required')
            .isLength({ min: 2, max: 100 }).withMessage('Email should be between 2 to 100 characters long'),
        check('password')
            .trim()
            .not().isEmpty().withMessage('Password is required')
            .exists().withMessage('Password is required')
            .isLength({ min: 2, max: 100 }).withMessage('Password should be between 2 to 100 characters long'),
    ],
};
