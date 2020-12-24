let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let dishSchema = new Schema({
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
    restaurantAdminId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant_admins'
    },
    isDeleted: { type: Number, default: 0 },
    cookingMethod: {

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
    },
    caloriesAndMacros: {
        fat: {
            totalFat: { type: Number },
            totalFatUnit: { type: String }, // gm, etc
            items: [{
                name: { type: String },
                weight: { type: Number },
                weightUnit: { type: String }, // gm, etc
                percentage: { type: Number }
            }],
        },
        Cholesterol: {
            name: { type: String },
            weight: { type: Number },
            weightUnit: { type: String }, // gm, etc
            percentage: { type: Number }
        },
        Sodium: {
            name: { type: String },
            weight: { type: Number },
            weightUnit: { type: String }, // gm, etc
            percentage: { type: Number }
        },
        TotalCarbohydrate: {
            name: { type: String },
            totalWeight: { type: Number },
            weightUnit: { type: String }, // gm, etc
            totalPercentage: { type: Number },
            items: [{
                name: { type: String },
                weight: { type: Number },
                weightUnit: { type: String }, // gm, etc
                percentage: { type: Number }
            }],
        },
        Protien: {
            name: { type: String },
            totalWeight: { type: Number },
            weightUnit: { type: String }, // gm, etc
            totalPercentage: { type: Number },
            items: [{
                name: { type: String },
                weight: { type: Number },
                weightUnit: { type: String }, // gm, etc
                percentage: { type: Number }
            }],
        },
        total: { type: Number }
    }
},
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });




const DishModel = mongoose.model('dish', dishSchema);

module.exports = DishModel;
