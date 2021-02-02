const cron = require('node-cron');
const moment = require('moment');
const UsersModel = require('../models/users');


cron.schedule('*/1 * * * *', async () => {
    try {
        const today = moment().format('YYYY-MM-DD');
        await subscription.find()
            .then(async users => {
                for(let singleUser of users){
                    if (today === moment(singleUser.expiredDate).format('YYYY-MM-DD')) {
                        const subscription_update_resp = await subscription.findByIdAndUpdate(singleUser._id, { subscriptionStatus: "inactive" }, { new: true })
                    }
                }
            })
            .catch(error => {
                console.log("error : ", error)
            })

    } catch (err) {
        console.log("error : ", err)

    }
})