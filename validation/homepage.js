const { check } = require('express-validator');

module.exports = {
    join_us: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        check('message')
            .trim()
            .not().isEmpty().withMessage('message is required')
            .exists().withMessage('message is required'),
        check('email')
            .trim()
            .not().isEmpty().withMessage('Email is required')
            .exists().withMessage('Email is required')
            .isLength({ min: 2, max: 100 }).withMessage('Email should be between 2 to 100 characters long'),
        check('phoneNumber')
            .trim()
            .not().isEmpty().withMessage('phoneNumber is required')
            .exists().withMessage('phoneNumber is required')
            .isLength({ min: 10, max: 10 }).withMessage('phoneNumber should be 10 characters long'),
        check('comapny')
            .trim()
            .not().isEmpty().withMessage('company is required')
            .exists().withMessage('company is required')
            .isLength({ min: 2, max: 100 }).withMessage('company should be between 2 to 100 characters long'),
    ]
};
