const express = require("express");
const router = express.Router();


const verify = require("../../middleware/auth");
const front_endHomepage = require("./homepage");
const front_endRestaurant = require("./restaurant");
const front_endProfile = require("./profile");


/** Front-end Portal */
router.use("/homePage", front_endHomepage);
// router.use("/restaurant", front_endRestaurant);
// router.use("/profile", verify.jwtValidation, verify.authorization, front_endProfile);


module.exports = router;
