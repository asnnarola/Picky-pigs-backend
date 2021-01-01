let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let restaurant_detailsSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        openingTimings: {
            isTime24Hours: { type: Boolean },
            isMultiTime: { type: Boolean },
            time: [
                {
                    day: { type: String },
                    timeList: [
                        {
                            startTime: { type: String },
                            // startTimeUnit: { type: String },
                            endTime: { type: String },
                            // endTimeUnit: { type: String }
                        }
                    ]
                }
            ]
        },
        website: {
            websiteUrl: { type: String },
            isAddToProfilePage: { type: Boolean }
        },
        bookings: {
            isAvailable: { type: Boolean },
            isWebsite: { type: Boolean },
            isEmail: { type: Boolean },
            isCall: { type: Boolean },
            websiteUrl: { type: String },
            email: [{ type: String }],
            phoneNumber: [{ type: String }],
        },
        socialMedia: {
            isAvailable: { type: Boolean },
            isFacebook: { type: Boolean },
            isTwitter: { type: Boolean },
            isInstagram: { type: Boolean },
            facebookUrl: { type: String },
            twitterUrl: { type: String },
            instagramUrl: { type: String },
        }
    },
    {
        timestamps: true
    });



const Restaurant_detailsModel = mongoose.model('restaurant_details', restaurant_detailsSchema);

module.exports = Restaurant_detailsModel;
