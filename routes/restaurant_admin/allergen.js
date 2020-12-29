var express = require('express');
var router = express.Router();
var allergen = require("../../models/allergen");
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const ingredient_management = require('../../validation/admin/ingredient_management');

//add allergen
router.post('/', ingredient_management.allergen, validation_response, async (req, res, next) => {
    var imageData = await common_helper.upload(req.files['image'], "uploads/allergy");
    let obj = {
        name: req.body.name,
        image: imageData.data[0].path
    }
    var data = await common_helper.insert(allergen, obj);

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});

router.get('/:id', async (req, res, next) => {
    var data = await common_helper.findOne(allergen, { "_id": req.params.id })

    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});
router.get('/', async (req, res, next) => {
    var data = await common_helper.find(allergen);
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else {
        res.status(config.BAD_REQUEST).json(data);
    }
});
router.put('/:id', async (req, res, next) => {
    let imageData, obj;
    if(req.files) {
        imageData  = await common_helper.upload(req.files['image'], "uploads/allergy");
    }
    if (imageData) {
        obj = {
            image: imageData.data[0].path
        }
    }

    var data = await common_helper.update(allergen, { "_id": req.params.id }, { ...obj, ...req.body })
    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});
router.delete('/:id', async (req, res, next) => {
    var data = await common_helper.delete(allergen, { "_id": req.params.id })

    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }
    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

module.exports = router;
