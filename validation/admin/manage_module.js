const { check } = require('express-validator');

module.exports = {
    update_password: [
        check('password')
            .trim()
            .not().isEmpty().withMessage('Password is required')
            .exists().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password should be minimum 8 characters long')
    ],
    create_restaurant: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        check('contactName')
            .trim()
            .not().isEmpty().withMessage('Contact name is requried')
            .exists().withMessage('contact name is required')
            .isLength({ min: 2, max: 100 }).withMessage('contact name should be between 2 to 100 characters long'),
        check('company')
            .trim()
            .not().isEmpty().withMessage('company is requried')
            .exists().withMessage('company is required')
            .isLength({ min: 2, max: 100 }).withMessage('company should be between 2 to 100 characters long'),
        check('phoneNumber')
            .trim()
            .not().isEmpty().withMessage('phoneNumber is requried')
            .exists().withMessage('phoneNumber is required')
            .isLength({ min: 10, max: 10 }).withMessage('phoneNumber should be 10 characters long'),
        check('email')
            .trim()
            .not().isEmpty().withMessage('Email is required')
            .exists().withMessage('Email is required')
            .isLength({ min: 2, max: 100 }).withMessage('Email should be between 2 to 100 characters long'),
        check('package')
            .trim()
            .not().isEmpty().withMessage('Package is required')
            .exists().withMessage('Package is required')
            .isLength({ min: 2, max: 100 }).withMessage('Package should be between 2 to 100 characters long'),
        check('password')
            .trim()
            .not().isEmpty().withMessage('Password is required')
            .exists().withMessage('Password is required')
            .isLength({ min: 2, max: 100 }).withMessage('Password should be between 2 to 100 characters long')

    ]

};
