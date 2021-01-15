const express = require("express");
const router = express.Router();

//define methods for routes
const list = require("./general/list");
const super_admin_routes = require("./super_admin/super_admin_routes");
const restaurant_admin_routes = require("./restaurant_admin/restaurant_admin_routes");
// const tablet_routes = require("./tablet/tablet_routes");
// const kds_routes = require("./kds/kds_routes");
const front_end_routes = require("./front_end/front_end_routes");
const auth = require("./auth");


//Define routes here f
router.use("/list", list);

/** Authentication */
router.use("/auth", auth);

/** Super admin */
router.use("/super_admin", super_admin_routes);

/** Restaurant Admin */
router.use("/restaurant_admin", restaurant_admin_routes);

/** Tablet Portal */
// router.use("/tablet", tablet_routes);

/** KDS Portal */
// router.use("/kds", kds_routes);

/** Front-end Portal */
router.use("/frontend", front_end_routes);

module.exports = router;
