let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let favouriteSchema = new Schema({
    restaurantAdminId: [{
        type: Schema.Types.ObjectId,
        ref: 'all_users'
    }],
    dishesId: [{
        type: Schema.Types.ObjectId,
        ref: 'dish'
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'all_users'
    },
    isDeleted: { type: Number, default: 0 },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const FavouriteModel = mongoose.model('favourite', favouriteSchema);

module.exports = FavouriteModel;