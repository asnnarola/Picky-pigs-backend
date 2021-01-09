let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let favouriteSchema = new Schema(
    {
        restaurantId: [{
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        }],
        dishesId: [{
            type: Schema.Types.ObjectId,
            ref: 'dish'
        }],
        user_preferenceId: {
            type: Schema.Types.ObjectId,
            ref: 'user_preference'
        },
        isDeleted: { type: Number, default: 0 },
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const FavouriteModel = mongoose.model('favourite', favouriteSchema);

module.exports = FavouriteModel;