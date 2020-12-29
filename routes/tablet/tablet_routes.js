const express = require("express");
const router = express.Router();

//define methods for routes
const homePage = require("./homePage");
const tabletDish = require("./dish");
const tabletOrder = require("./order");




/** Tablet Portal */
router.use("/homePage", homePage);
router.use("/dish", tabletDish);
router.use("/order", tabletOrder);




module.exports = router;
