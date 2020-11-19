const { check } = require('express-validator');

module.exports = {
    menu: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        check('day')
            .trim()
            .not().isEmpty().withMessage('Day is required')
            .exists().withMessage('Day is required'),
        check('time')
            .trim()
            .not().isEmpty().withMessage('Time is required')
            .exists().withMessage('Time is required'),
    ],
    category: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long')
    ],
};
