const express = require("express");
const router = express.Router();

//define methods for routes
const verify = require("../../middleware/auth");
const menus = require("./menus");
const category = require("./category");
const subcategory = require("./subcategory");
const dish = require("./dish");
const fileupload = require("./fileupload");
const settings = require("./settings");
const restaurant_adminDashboard = require("./dashboard");


//for admin panel
// router.use("/admin/allergen", verify ,allergen);
router.use("/menus", verify.jwtValidation, verify.authorization, menus);
router.use("/category", verify.jwtValidation, verify.authorization, category);
router.use("/subcategory", verify.jwtValidation, verify.authorization, subcategory);
router.use("/dish", verify.jwtValidation, verify.authorization, dish);
router.use("/fileupload", verify.jwtValidation, fileupload);
router.use("/settings", verify.jwtValidation, verify.authorization, settings);
router.use("/dashboard", verify.jwtValidation, verify.authorization, restaurant_adminDashboard);

module.exports = router;
