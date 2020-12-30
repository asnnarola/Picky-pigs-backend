var express = require('express');
var router = express.Router();
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const masterGroup = require('../../models/masterGroup');

//add
router.post('/',  async (req, res, next) => {
    var data = await common_helper.insert(masterGroup, { name: req.body.name });
    if (data.status === 1 && data.data) {
        res.status(constants.OK_STATUS).json(data);
    } else {
        res.status(constants.BAD_REQUEST).json(data);
    }
});

router.get('/:id', async (req, res, next) => {
    var data = await common_helper.findOne(masterGroup, { "_id": req.params.id })
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
    var data = await common_helper.find(masterGroup);

    if (data.status === 1 && data.data) {
        res.status(constants.OK_STATUS).json(data);
    } else {
        res.status(constants.BAD_REQUEST).json(data);
    }
});
router.put('/:id', async (req, res, next) => {
    var data = await common_helper.update(masterGroup, { "_id": req.params.id }, req.body)
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
    var data = await common_helper.delete(masterGroup, { "_id": req.params.id })

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
