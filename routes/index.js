const express = require("express");
const router = express.Router();

//define methods for routes
const home = require("./home");
const list = require("./filteringList/list");
const auth = require("./auth");
const verify = require("../middleware/auth");
const allergen = require("./admin/allergen");
const dietary = require("./admin/dietary");
const lifestyle = require("./admin/lifestyle");
const ingredient = require("./admin/ingredient");
const menus = require("./admin/menus");
const masterGroup = require("./admin/masterGroup");
const supplier = require("./admin/supplier");
const adminAuth = require("./admin/auth");
const category = require("./admin/category");

//Define routes here f
router.use("/", home);
router.use("/list", list);
router.use("/auth", auth);
//for admin panel
// router.use("/admin/allergen", verify ,allergen);
router.use("/admin/auth", adminAuth);
router.use("/admin/group", masterGroup);
router.use("/admin/supplier", supplier);
router.use("/admin/allergen" ,allergen);
router.use("/admin/dietary", dietary);
router.use("/admin/lifestyle", lifestyle);
router.use("/admin/ingredient", ingredient);
router.use("/admin/menus", menus);
router.use("/admin/category", category);

module.exports = router;
