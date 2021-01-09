let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let reviewSchema = new Schema(
    {
        rate: {
            type: Number
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        user_preferenceId: {
            type: Schema.Types.ObjectId,
            ref: 'user_preference'
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