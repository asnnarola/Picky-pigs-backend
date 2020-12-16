// //Define name of collection
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const collectionName = "ingredient";
// //Define Collection schema
// const collectionSchema = {
//     name: { type: String },
//     size: { type: String, default: 0},
//     cost: { type: Number, default: 0},
//     supplier: {
//         type: Schema.Types.ObjectId,
//         ref: 'supplier'
//     },
//     locationOrigin: { type: String, default: null },
//     transport: { type: String, default: null },
//     masterGroup: {
//         type: Schema.Types.ObjectId,
//         ref: 'masterGroup'
//     },
//     allergenId: [{
//         type: Schema.Types.ObjectId,
//         ref: 'allergen'
//     }],
//     dietaryId: [{
//         type: Schema.Types.ObjectId,
//         ref: 'dietary'
//     }],
//     lifestyleId: [{
//         type: Schema.Types.ObjectId,
//         ref: 'lifestyle'
//     }],
//     isDeleted: { type: Number, default: 0 },
//     createdAt: { type: Date, default: Date.now },
//     modifiedAt: { type: Date, default: Date.now },
// };
// module.exports = require("./index")(collectionSchema, collectionName);


let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let ingredientSchema = new Schema({
    name: { type: String },
    size: { type: String, default: 0 },
    cost: { type: Number, default: 0 },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'supplier'
    },
    locationOrigin: { type: String, default: null },
    transport: { type: String, default: null },
    masterGroup: {
        type: Schema.Types.ObjectId,
        ref: 'masterGroup'
    },
    allergenId: [{
        type: Schema.Types.ObjectId,
        ref: 'allergen'
    }],
    dietaryId: [{
        type: Schema.Types.ObjectId,
        ref: 'dietary'
    }],
    lifestyleId: [{
        type: Schema.Types.ObjectId,
        ref: 'lifestyle'
    }],
    restaurantAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant_admins'
    },
    isDeleted: { type: Number, default: 0 },
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });

const IngredientModel = mongoose.model('ingredient', ingredientSchema);

module.exports = IngredientModel;


