let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let dishSchema = new Schema(
    {
        name: { type: String, required: true },
        makes: { type: Number },
        price: { type: Number },
        grossProfit: { type: Number },
        image: { type: String },
        favorite: { type: Boolean, default: false },
        prepItem: { type: Boolean, default: false },
        new: { type: Boolean, default: false },
        available: { type: Boolean, default: false },
        menuId: [{
            type: Schema.Types.ObjectId,
            ref: 'menus'
        }],
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'category'
        },
        subcategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'subcategory'
        },
        description: { type: String },
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
        instructions: { type: String },
        customisable: { type: Boolean, default: false },
        createNewVersion: { type: Boolean, default: false },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        isDeleted: { type: Number, default: 0 },
        cookingMethodId: {
            type: Schema.Types.ObjectId,
            ref: 'cooking_method'
        },
        itemSection: {
            estimatedCost: { type: Number },
            item: [{
                name: { type: String },
                qty: { type: Number },
                unit: { type: String },
                allergeies: { type: String },
                name: { type: String },
                stokUnit: { type: String },
                recipeCost: { type: Number },
                customisable: { type: Boolean }
            }]
        }
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });




const DishModel = mongoose.model('dish', dishSchema);

module.exports = DishModel;
