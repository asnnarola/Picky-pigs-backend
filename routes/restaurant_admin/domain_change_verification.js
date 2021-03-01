var express = require('express');
var router = express.Router();
const constants = require('../../config/constants');

/**Check token validation for move other domain from frontend */
router.post('/', async (req, res, next) => {
    res.status(constants.OK_STATUS).json({ message: "Token verified successfully" });
});


module.exports = router;
