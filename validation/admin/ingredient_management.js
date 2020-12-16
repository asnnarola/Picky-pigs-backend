const { check } = require('express-validator');

module.exports = {
    allergen: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        // check('image')
        //     .trim()
        //     .not().isEmpty().withMessage('Image is required')
        //     .exists().withMessage('Image is required')
    ],
    dietary: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
    ],
    lifestyle: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
    ],
    ingredient: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        check('size')
            .trim()
            .not().isEmpty().withMessage('Size is required')
            .exists().withMessage('Size is required'),
        check('cost')
            .trim()
            .not().isEmpty().withMessage('Cost is required')
            .exists().withMessage('Cost is required'),
            // .isNumber().withMessage('Must be a number'),
        check('supplier')
            .trim()
            .not().isEmpty().withMessage('Supplier is required')
            .exists().withMessage('Supplier is required'),
        check('locationOrigin')
            .trim()
            .not().isEmpty().withMessage('Location Origin is required')
            .exists().withMessage('Location Origin is required'),
        check('transport')
            .trim()
            .not().isEmpty().withMessage('Transport is required')
            .exists().withMessage('Transport is required'),
        check('masterGroup')
            .trim()
            .not().isEmpty().withMessage('Master Group is required')
            .exists().withMessage('Master Group is required'),
      ],
};
