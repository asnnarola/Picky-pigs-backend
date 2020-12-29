
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    restaurantAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant_admins'
    },
    menuId: {
        type: Schema.Types.ObjectId,
        ref: 'menus'
    },
    isDeleted: { type: Number, default: 0 },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const CategoryModel = mongoose.model('category', categorySchema);

module.exports = CategoryModel;
