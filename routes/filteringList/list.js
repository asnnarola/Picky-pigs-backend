var express = require('express');
var router = express.Router();
var allergen = require("../../models/allergen");
var dietary = require("../../models/dietary");
var lifestyle = require("../../models/lifestyle");
const common_helper = require('../../helpers/common');
const config = require('../../config');
const LOGGER = config.LOGGER;


router.get('/allergen', async (req, res, next) => {
    var data = await common_helper.find(allergen);
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});
router.get('/dietary', async (req, res, next) => {
    var data = await common_helper.find(dietary);
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});
router.get('/lifeStyle', async (req, res, next) => {
    var data = await common_helper.find(lifestyle);
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});
// router.get('/', async (req, res, next) => {
//     var data = await common_helper.find(allergen);
//     if (data.status === 1 && data.data) {
//         res.status(config.OK_STATUS).json(data);
//     } else {
//         res.status(config.BAD_REQUEST).json(data);
//     }
// });


module.exports = router;
