const express = require("express");
const router = express.Router();

//define methods for routes
const home = require("./home");
const list = require("./filteringList/list");
const auth = require("./auth");
const verify = require("../middleware/auth");
const allergen = require("./restaurant_admin/allergen");
const dietary = require("./restaurant_admin/dietary");
const lifestyle = require("./restaurant_admin/lifestyle");
const ingredient = require("./restaurant_admin/ingredient");
const menus = require("./restaurant_admin/menus");
const masterGroup = require("./restaurant_admin/masterGroup");
const supplier = require("./restaurant_admin/supplier");
const adminAuth = require("./restaurant_admin/auth");
const category = require("./restaurant_admin/category");
const subcategory = require("./restaurant_admin/subcategory");
const dish = require("./restaurant_admin/dish");
const fileupload = require("./restaurant_admin/fileupload");
const homaPage = require("./tablet/homaPage");

//Define routes here f
router.use("/", home);
router.use("/list", list);
router.use("/auth", auth);
//for admin panel
// router.use("/admin/allergen", verify ,allergen);
router.use("/restaurant_admin/auth", adminAuth);
router.use("/restaurant_admin/group", masterGroup);
router.use("/restaurant_admin/supplier", supplier);
router.use("/restaurant_admin/allergen" ,allergen);
router.use("/restaurant_admin/dietary", dietary);
router.use("/restaurant_admin/lifestyle", lifestyle);
router.use("/restaurant_admin/ingredient", ingredient);
router.use("/restaurant_admin/menus", verify.jwtValidation, verify.authorization, menus);
router.use("/restaurant_admin/category", verify.jwtValidation, verify.authorization,category);
router.use("/restaurant_admin/subcategory", verify.jwtValidation, verify.authorization, subcategory);
router.use("/restaurant_admin/dish", verify.jwtValidation, verify.authorization, dish);
router.use("/restaurant_admin/fileupload", verify.jwtValidation, verify.authorization, fileupload);



router.use("/tablet/homePage", homaPage);

module.exports = router;
