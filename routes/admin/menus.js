var express = require('express');
var router = express.Router();
const common_helper = require('../../helpers/common');
const menus_helper = require('../../helpers/menu');
const config = require('../../config');
const LOGGER = config.LOGGER;
const auth = require('../../validation/auth');
const validation_response = require('../../validation/validation_response');
const menus = require('../../models/menus');
const validation = require('../../validation/admin/validation');

//add menu
router.post('/', validation.menu, validation_response, async (req, res, next) => {
    try {
            let obj = {
                name: req.body.name,
                day: req.body.day,
                time: req.body.time,
                available:req.body.available,
            }
            var data = await common_helper.insert(menus, obj);
            if (data.status === 1 && data.data) {
                res.status(config.OK_STATUS).json(data);
            } else {
                res.status(config.BAD_REQUEST).json(data);
            }
    } catch (error) {
        res.status(config.BAD_REQUEST).json({ ...data, error: error.messag, message: "Error occured while filtering data" });
    }
});

router.get('/:id', async (req, res, next) => {
    var data = await common_helper.findOne(menus, { "_id": req.params.id })

    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});

router.put('/:id', async (req, res, next) => {

    var data = await common_helper.update(menus, { "_id": req.params.id }, req.body)

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
    var data = await common_helper.softDelete(menus, { "_id": req.params.id })
    if (data.status === 0) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
    }

    if (data.status === 1 && data.data) {
        res.status(config.OK_STATUS).json(data);
    } else if (data.data === null) {
        res.status(config.BAD_REQUEST).json({ ...data, message: "No data found" });
    }
});
// listing api with filter/search/sort
router.post("/filter", async (req, res) => {

    var filter_obj = await common_helper.changeObject(req.body)

    let filtered_data = await menus_helper.get_filtered_records(filter_obj);

    if (filtered_data.status === 0) {
        return res.status(config.BAD_REQUEST).json(filtered_data);
    } else {
        return res.status(config.OK_STATUS).json(filtered_data);
    }
});


module.exports = router;
