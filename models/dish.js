let mongoose = require('mongoose');
let Schema = mongoose.Schema;

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
            type: String
        }],
        dietaryId: [{
            type: String
        }],
        lifestyleId: [{
            type: String
        }],
        cookingMethodId: [{
            type: String
        }],
        // allergenId: [{
        //     type: Schema.Types.ObjectId,
        //     ref: 'allergen'
        // }],
        // dietaryId: [{
        //     type: Schema.Types.ObjectId,
        //     ref: 'dietary'
        // }],
        // lifestyleId: [{
        //     type: Schema.Types.ObjectId,
        //     ref: 'lifestyle'
        // }],
        // cookingMethodId: [{
        //     type: Schema.Types.ObjectId,
        //     ref: 'cooking_method'
        // }],
        instructions: { type: String },
        customisable: { type: Boolean, default: false },
        createNewVersion: { type: Boolean, default: false },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        isDeleted: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },     /**active, inactive */
        ingredientSection: {
            estimatedCost: { type: Number },
            total: { type: Number }
        }
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });




const DishModel = mongoose.model('dish', dishSchema);

module.exports = DishModel;
