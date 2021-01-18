var express = require('express');
var router = express.Router();
const common_helper = require('../../helpers/common');
const config = require('../../config/config');
const constants = require('../../config/constants');


router.post('/upload_image', async function (req, res, next) {
    if (req.files != null) {
        var imageData = await common_helper.upload(req.files['image'], "uploads");
        if (imageData.data.length > 0) {
            res.status(constants.OK_STATUS).json(imageData);
        } else {
            res.status(constants.BAD_REQUEST).json({ "message": "File not uploaded" });
        }
    } else {
        res.status(constants.BAD_REQUEST).json({ "message": "Upload proper file" });
    }
});

module.exports = router;