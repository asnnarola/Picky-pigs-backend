const express = require("express");
const router = express.Router();


const kdsOrder = require("./order");



/** KDS Portal */
router.use("/order", kdsOrder);



module.exports = router;
