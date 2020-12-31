let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let reviewSchema = new Schema(
    {
        rate: {
            type: Number
        },
        restaurantAdminId: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        comment: {
            type: String
        },
        isDeleted: { type: Number, default: 0 },
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const ReviewModel = mongoose.model('review', reviewSchema);

module.exports = ReviewModel;