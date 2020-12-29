var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const common_helper = require('../../helpers/common');
const menus_helper = require('../../helpers/menu');
const config = require('../../config/config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const RestaurantAdmin = require('../../models/restaurantAdmin');
const validation = require('../../validation/admin/validation');

router.post('/', async (req, res, next) => {
    try {
        const save_response = await common_helper.update(RestaurantAdmin, { _id: new ObjectId(req.loginUser.id) }, req.body);
        if (save_response.status === 1 && save_response.data) {
            res.status(config.OK_STATUS).json(save_response);
        } else {
            res.status(config.BAD_REQUEST).json(save_response);
        }
    } catch (error) {
        res.status(config.BAD_REQUEST).json({ ...save_response, error: error.messag, message: "Error occured while inserting data" });
    }
});


router.get('/:id', async (req, res, next) => {
    try {
        const find_response = await common_helper.findOne(RestaurantAdmin, { _id: new ObjectId(req.loginUser.id) });
        if (find_response.status === 1 && find_response.data) {
            res.status(config.OK_STATUS).json(find_response);
        } else {
            res.status(config.BAD_REQUEST).json(find_response);
        }
    } catch (error) {
        res.status(config.BAD_REQUEST).json({ ...find_response, error: error.messag, message: "Error occured while finding data" });
    }
});


module.exports = router;
