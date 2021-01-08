let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let cartDishSchema = new Schema(
    {
        cartId: {
            type: Schema.Types.ObjectId,
            ref: 'cart'
        },
        restaurantAdminId: {
            type: Schema.Types.ObjectId,
            ref: 'all_users'
        },
        name: { type: String },
        dishId: {
            type: Schema.Types.ObjectId,
            ref: 'dish'
        },
        allergenId: [{
            type: Schema.Types.ObjectId,
            ref: 'allergen'
        }],
        items: [{
            name: { type: String },
            qty: { type: Number },
            unit: { type: String },
            allergeies: { type: String },
            name: { type: String },
            stokUnit: { type: String },
            recipeCost: { type: Number },
            isRemove: { type: Boolean }
        }],
        dishPrice: { type: Number },
        orderQuantity: { type: Number },
        tableNo: { type: Number },
        covers: { type: Number },
        writtenNote: { type: String }
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const CartdishModel = mongoose.model('cart_dish', cartDishSchema);

module.exports = CartdishModel;
