let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let cartSchema = new Schema(
    {
        waiterName: { type: String },
        comment: { type: String },
        fullName: { type: String },
        itemTotalPrice: { type: Number },
        tableNo: { type: Number },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        // dishes: [
        //     {
        //         name: { type: String },
        //         dishId: {
        //             type: Schema.Types.ObjectId,
        //             ref: 'dish'
        //         },
        //         allergenId: [{
        //             type: Schema.Types.ObjectId,
        //             ref: 'allergen'
        //         }],
        //         items: [{
        //             name: { type: String },
        //             qty: { type: Number },
        //             unit: { type: String },
        //             allergeies: { type: String },
        //             name: { type: String },
        //             stokUnit: { type: String },
        //             recipeCost: { type: Number },
        //             isRemove: { type: Boolean }
        //         }],
        //         dishPrice: { type: Number },
        //         orderQuantity: { type: Number },
        //         tableNo: { type: Number },
        //         covers: { type: Number },
        //         writtenNote: { type: String }
        //     }
        // ],
        isDeleted: { type: Number, default: 0 },
        covers: { type: Number }    /**covers means numberOfPeople on table*/
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const CartModel = mongoose.model('cart', cartSchema);

module.exports = CartModel;
