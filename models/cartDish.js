let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let cartDishSchema = new Schema(
    {
        cartId: {
            type: Schema.Types.ObjectId,
            ref: 'cart'
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        name: { type: String },
        dishId: {
            type: Schema.Types.ObjectId,
            ref: 'dish'
        },
        addAllergen: [{
            type: Schema.Types.ObjectId,
            ref: 'allergen'
        }],
        // addAllergen: [{ type: String }],
        cookingMethod: [{ type: String }],
        ingredients: [{
            name: { type: String },
            recipeCost: { type: Number },
            isAdd: { type: Boolean }
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
