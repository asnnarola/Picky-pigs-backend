var express = require('express');
var router = express.Router();
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const lifestyle = require('../../models/lifestyle');
const ingredient_management = require('../../validation/admin/ingredient_management');

//add lifestyle
router.post('/', ingredient_management.lifestyle, validation_response,async (req, res, next) => {
    var data = await common_helper.insert(lifestyle, { name: req.body.name });

    if (data.status === 1 && data.data) {
        res.status(constants.OK_STATUS).json(data);
    } else {
        res.status(constants.BAD_REQUEST).json(data);
    }
});

router.get('/:id', async (req, res, next) => {
    var data = await common_helper.findOne(lifestyle, { "_id": req.params.id })

    if (data.status === 0) {
        res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(constants.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});
router.get('/', async (req, res, next) => {
    var data = await common_helper.find(lifestyle);

    if (data.status === 1 && data.data) {
        res.status(constants.OK_STATUS).json(data);
    } else {
        res.status(constants.BAD_REQUEST).json(data);
    }
});
router.put('/:id', async (req, res, next) => {
    var data = await common_helper.update(lifestyle, { "_id": req.params.id },req.body )

   if (data.status === 0) {
        res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(constants.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});
router.delete('/:id', async (req, res, next) => {
    var data = await common_helper.delete(lifestyle, { "_id": req.params.id })

    if (data.status === 0) {
        res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(constants.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

module.exports = router;
