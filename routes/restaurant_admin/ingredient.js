var express = require('express');
var router = express.Router();
const common_helper = require('../../helpers/common');
const ingredient_helper = require('../../helpers/ingredient');
const config = require('../../config/config');
const constants = require('../../config/constants');
const validation_response = require('../../validation/validation_response');
const ingredient = require('../../models/ingredient');
const ingredient_management = require('../../validation/admin/ingredient_management');

//add ingredient
router.post('/', ingredient_management.ingredient, validation_response, async (req, res, next) => {
  let obj = {
    name: req.body.name,
    size: req.body.size,
    cost: req.body.cost,
    supplier: req.body.supplier,
    locationOrigin: req.body.locationOrigin,
    transport: req.body.transport,
    masterGroup: req.body.masterGroup,
    allergenId: req.body.allergenId,
    dietaryId: req.body.dietaryId,
    lifestyleId: req.body.lifestyleId
  }

  var data = await common_helper.insert(ingredient, obj);
  console.log('data => ', data);
  if (data.status === 1 && data.data) {
    res.status(constants.OK_STATUS).json(data);
  } else {
    res.status(constants.BAD_REQUEST).json(data);
  }
});

router.get('/:id', async (req, res, next) => {
  var data = await common_helper.findOne(ingredient, { "_id": req.params.id })

  if (data.status === 0) {
    res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
  }

  if (data.status === 1 && data.data) {
    res.status(constants.OK_STATUS).json(data);
  } else if (data.data === null) {
    res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
  }
});
router.put('/:id', async (req, res, next) => {

  var data = await common_helper.update(ingredient, { "_id": req.params.id }, req.body)

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
  var data = await common_helper.softDelete(ingredient, { "_id": req.params.id })
  if (data.status === 0) {
    res.status(constants.BAD_REQUEST).json({ ...data, message: "Invalid request !" });
  }

  if (data.status === 1 && data.data) {
    res.status(constants.OK_STATUS).json(data);
  } else if (data.data === null) {
    res.status(constants.BAD_REQUEST).json({ ...data, message: "No data found" });
  }
});

router.post("/filter", async (req, res) => {

  var filter_obj = await common_helper.changeObject(req.body)

  let filtered_data = await ingredient_helper.get_filtered_records(filter_obj);

  if (filtered_data.status === 0) {
    return res.status(constants.BAD_REQUEST).json(filtered_data);
  } else {
    return res.status(constants.OK_STATUS).json(filtered_data);
  }
});


module.exports = router;
