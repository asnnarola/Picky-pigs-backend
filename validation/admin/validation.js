const { check } = require('express-validator');

module.exports = {
    menu: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        // check('day')
        //     .trim()
        //     .not().isEmpty().withMessage('Day is required')
        //     .exists().withMessage('Day is required'),
        check('timeTo')
            .trim()
            .not().isEmpty().withMessage('Timeto is required')
            .exists().withMessage('Timeto is required'),
        check('timeFrom')
            .trim()
            .not().isEmpty().withMessage('Timefrom is required')
            .exists().withMessage('Timefrom is required'),
    ],
    submenu: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        check('styleOfmenu')
            .trim()
            .not().isEmpty().withMessage('styleOfmenu is required')
            .exists().withMessage('styleOfmenu is required')
            .isLength({ min: 2, max: 100 }).withMessage('styleOfmenu should be between 2 to 100 characters long'),
        check('availability')
            .isArray().withMessage('availability is required')
            .not().isEmpty().withMessage('availability is required')
            .exists().withMessage('availability is required'),
        check('timeTo')
            .trim()
            .not().isEmpty().withMessage('Timeto is required')
            .exists().withMessage('Timeto is required'),
        check('parentMenu')
            .trim()
            .not().isEmpty().withMessage('parentMenu is required')
            .exists().withMessage('parentMenu is required'),
        check('timeFrom')
            .trim()
            .not().isEmpty().withMessage('Timefrom is required')
            .exists().withMessage('Timefrom is required'),
    ],
    category: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long')
    ],
    subcategory: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long')
    ],
    dish: [
        check('name')
            .trim()
            .not().isEmpty().withMessage('Name is required')
            .exists().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name should be between 2 to 100 characters long'),
        check('makes')
            .not().isEmpty().withMessage('Makes is required')
            .exists().withMessage('Makes is required')
            .isFloat(),
        check('price')
            .not().isEmpty().withMessage('price is required')
            .exists().withMessage('price is required')
            .isFloat(),
        check('grossProfit')
            .not().isEmpty().withMessage('grossProfit is required')
            .exists().withMessage('grossProfit is required')
            .isFloat(),
        check('image')
            .trim()
            .not().isEmpty().withMessage('image is required')
            .exists().withMessage('image is required'),
        check('menuId')
            .trim()
            .not().isEmpty().withMessage('menu is required')
            .exists().withMessage('menu is required'),
        check('categoryId')
            .trim()
            .not().isEmpty().withMessage('categoryId is required')
            .exists().withMessage('categoryId is required'),
        check('subcategoryId')
            .trim()
            .not().isEmpty().withMessage('subcategoryId is required')
            .exists().withMessage('subcategoryId is required'),
        check('description')
            .trim()
            .not().isEmpty().withMessage('description is required')
            .exists().withMessage('description is required'),
        check('allergenId')
            .trim()
            .not().isEmpty().withMessage('allergenId is required')
            .exists().withMessage('allergenId is required'),
        check('dietaryId')
            .trim()
            .not().isEmpty().withMessage('dietaryId is required')
            .exists().withMessage('dietaryId is required'),
        check('lifestyleId')
            .trim()
            .not().isEmpty().withMessage('lifestyleId is required')
            .exists().withMessage('lifestyleId is required'),
        check('instructions')
            .trim()
            .not().isEmpty().withMessage('instructions is required')
            .exists().withMessage('instructions is required')


    ],
};
