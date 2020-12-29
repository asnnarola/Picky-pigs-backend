const { check } = require('express-validator');

module.exports = {
    restaurant_info: [
        check('about')
            .trim()
            .not().isEmpty().withMessage('about is required')
            .exists().withMessage('about is required')
            .isLength({ min: 2, max: 100 }).withMessage('about should be between 2 to 100 characters long'),
        
    ],
};
