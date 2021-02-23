const cron = require('node-cron');
const moment = require('moment');
const UsersModel = require('../models/users');


cron.schedule('* 1 * * *', async () => {
    try {
        const today = moment().format('YYYY-MM-DD');
        await subscription.find()
            .then(async users => {
                for (let singleUser of users) {
                    if (today === moment(singleUser.expiredDate).format('YYYY-MM-DD')) {
                        const subscription_update_resp = await subscription.findByIdAndUpdate(singleUser._id, { subscriptionStatus: "inactive" }, { new: true })
                    }
                }
            })
            .catch(error => {
                console.log("error : ", error)
            })



        const findUser = await UsersModel.find({ role: "restaurant_admin" }).select('name role createdAt');
        if (findUser.length > 0) {
            for (let singleUser of findUser) {
                //Change date createdAt to expired subscription date
                const userDueDate = moment(singleUser.createdAt).format('YYYY-MM-DD');
                const todayDate = moment(new Date()).format('YYYY-MM-DD');

                if (userDueDate === todayDate) {
                    const updateObj = {
                        isPaid: false
                    }
                    const update_user = await UsersModel.findByIdAndUpdate(singleUser._id, updateObj, { new: true });
                }
            }
        }

    } catch (err) {
        console.log("error : ", err)

    }
})