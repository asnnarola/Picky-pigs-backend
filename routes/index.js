const express = require("express");
const router = express.Router();

//define methods for routes
const home = require("./home");
const list = require("./general/list");
const auth = require("./auth");
const verify = require("../middleware/auth");
const allergen = require("./restaurant_admin/allergen");
const dietary = require("./restaurant_admin/dietary");
const lifestyle = require("./restaurant_admin/lifestyle");
const ingredient = require("./restaurant_admin/ingredient");
const menus = require("./restaurant_admin/menus");
const masterGroup = require("./restaurant_admin/masterGroup");
const supplier = require("./restaurant_admin/supplier");
const restaurant_adminAuth = require("./restaurant_admin/auth");
const category = require("./restaurant_admin/category");
const subcategory = require("./restaurant_admin/subcategory");
const dish = require("./restaurant_admin/dish");
const fileupload = require("./restaurant_admin/fileupload");
const settings = require("./restaurant_admin/settings");
const homePage = require("./tablet/homePage");
const tabletDish = require("./tablet/dish");
const tabletOrder = require("./tablet/order");
const super_adminAuth = require("./super_admin/auth");
const super_adminManage_restaurant = require("./super_admin/manage_restaurant");
const super_adminManage_user = require("./super_admin/manage_user");
const kdsOrder = require("./kds/order");
const front_endHomepage = require("./front_end/homepage");
const front_endRestaurant = require("./front_end/restaurant");
const front_endProfile = require("./front_end/profile");


//Define routes here f
router.use("/", home);
router.use("/list", list);
router.use("/auth", auth);

//for admin panel
// router.use("/admin/allergen", verify ,allergen);
router.use("/restaurant_admin/auth", restaurant_adminAuth);
router.use("/restaurant_admin/group", masterGroup);
router.use("/restaurant_admin/supplier", supplier);
router.use("/restaurant_admin/allergen", allergen);
router.use("/restaurant_admin/dietary", dietary);
router.use("/restaurant_admin/lifestyle", lifestyle);
router.use("/restaurant_admin/ingredient", ingredient);
router.use("/restaurant_admin/menus", verify.jwtValidation, verify.authorization, menus);
router.use("/restaurant_admin/category", verify.jwtValidation, verify.authorization, category);
router.use("/restaurant_admin/subcategory", verify.jwtValidation, verify.authorization, subcategory);
router.use("/restaurant_admin/dish", verify.jwtValidation, verify.authorization, dish);
router.use("/restaurant_admin/fileupload", verify.jwtValidation, verify.authorization, fileupload);
router.use("/restaurant_admin/settings", verify.jwtValidation, verify.authorization, settings);


/** Super admin */
router.use("/super_admin/auth", super_adminAuth);
router.use("/super_admin/manage_restaurant", verify.jwtValidation, verify.authorization, super_adminManage_restaurant);
router.use("/super_admin/manage_user", verify.jwtValidation, verify.authorization, super_adminManage_user);


/** Tablet Portal */
router.use("/tablet/homePage", homePage);
router.use("/tablet/dish", tabletDish);
router.use("/tablet/order", tabletOrder);


/** KDS Portal */
router.use("/kds/order", kdsOrder);


/** Front-end Portal */
router.use("/frontend/homePage", front_endHomepage);
router.use("/frontend/restaurant", front_endRestaurant);
router.use("/frontend/profile", verify.jwtValidation, verify.authorization, front_endProfile);


module.exports = router;
