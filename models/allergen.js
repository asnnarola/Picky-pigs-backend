let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let allergenSchema = new Schema({
    name: { type: String, required: true },
    restaurantAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant_admins'
    },
    image: { type: String, default: null },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const AllergenModel = mongoose.model('allergen', allergenSchema);

module.exports = AllergenModel;