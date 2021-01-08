var express = require('express');
var router = express.Router();
const SuperAdmin = require("../../models/superAdmin");
const Users = require("../../models/users");
const common_helper = require('../../helpers/common');
const constants = require('../../config/constants');

router.post('/create', async (req, res, next) => {
    req.body.emailVerified = true;
    const insert_resp = await common_helper.insert(Users, req.body);

    if (insert_resp.status === 1 && insert_resp.data) {
        res.status(constants.OK_STATUS).json(insert_resp);
    } else {
        res.status(constants.BAD_REQUEST).json(insert_resp);
    }
})

module.exports = router;
