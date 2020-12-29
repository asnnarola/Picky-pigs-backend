const express = require("express");
const router = express.Router();

//define methods for routes
const verify = require("../../middleware/auth");
const super_adminAuth = require("./auth");
const super_adminManage_restaurant = require("./manage_restaurant");
const super_adminManage_user = require("./manage_user");




/** Super admin */
router.use("/auth", super_adminAuth);
router.use("/manage_restaurant", verify.jwtValidation, verify.authorization, super_adminManage_restaurant);
router.use("/manage_user", verify.jwtValidation, verify.authorization, super_adminManage_user);




module.exports = router;
