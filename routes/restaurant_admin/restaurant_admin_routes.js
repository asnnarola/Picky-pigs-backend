const express = require("express");
const router = express.Router();

//define methods for routes
const verify = require("../../middleware/auth");
const allergen = require("./allergen");
const dietary = require("./dietary");
const lifestyle = require("./lifestyle");
const ingredient = require("./ingredient");
const menus = require("./menus");
const masterGroup = require("./masterGroup");
const supplier = require("./supplier");
const restaurant_adminAuth = require("./auth");
const category = require("./category");
const subcategory = require("./subcategory");
const dish = require("./dish");
const fileupload = require("./fileupload");
const settings = require("./settings");
const restaurant_adminDashboard = require("./dashboard");


//for admin panel
// router.use("/admin/allergen", verify ,allergen);
router.use("/auth", restaurant_adminAuth);
router.use("/group", masterGroup);
router.use("/supplier", supplier);
router.use("/allergen", allergen);
router.use("/dietary", dietary);
router.use("/lifestyle", lifestyle);
router.use("/ingredient", ingredient);
router.use("/menus", verify.jwtValidation, verify.authorization, menus);
router.use("/category", verify.jwtValidation, verify.authorization, category);
router.use("/subcategory", verify.jwtValidation, verify.authorization, subcategory);
router.use("/dish", verify.jwtValidation, verify.authorization, dish);
router.use("/fileupload", fileupload);
router.use("/settings", verify.jwtValidation, verify.authorization, settings);
router.use("/dashboard", verify.jwtValidation, verify.authorization, restaurant_adminDashboard);

module.exports = router;
