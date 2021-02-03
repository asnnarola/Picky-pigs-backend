const express = require("express");
const router = express.Router();

//define methods for routes
const verify = require("../../middleware/auth");
const super_adminAuth = require("./auth");
const super_adminManage_restaurant = require("./manage_restaurant");
const super_adminManage_user = require("./manage_user");
const super_adminAllergen = require('./manage_allergen');
const manage_restaurant_features_option = require('./manage_restaurant_features_option');
const super_adminManage_dietary = require('./manage_dietary');
const super_adminManage_lifestyle = require('./manage_lifestyle');
const super_adminManage_cooking_method = require('./manage_cooking_method');
const super_adminManage_cuisine_type = require('./manage_cuisine_type');



/** Super admin */
router.use("/auth", super_adminAuth);
router.use("/manage_allergen", verify.jwtValidation, verify.authorization, super_adminAllergen);
router.use("/manage_restaurant_features_option", verify.jwtValidation, verify.authorization, manage_restaurant_features_option);
router.use("/manage_dietary", verify.jwtValidation, verify.authorization, super_adminManage_dietary);
router.use("/manage_lifestyle", verify.jwtValidation, verify.authorization, super_adminManage_lifestyle);
router.use("/manage_cooking_method", verify.jwtValidation, verify.authorization, super_adminManage_cooking_method);
router.use("/manage_cuisine_type", verify.jwtValidation, verify.authorization, super_adminManage_cuisine_type);

router.use("/manage_restaurant", verify.jwtValidation, verify.authorization, super_adminManage_restaurant);
router.use("/manage_user", verify.jwtValidation, verify.authorization, super_adminManage_user);




module.exports = router;
