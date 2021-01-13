let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let dish_caloriesAndMacrosSchema = new Schema(
    {

        dishId: {
            type: Schema.Types.ObjectId,
            ref: 'dish'
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant'
        },
        isDeleted: { type: Number, default: 0 },
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
    },
    {
        timestamps: true//, adds createdAt and updatedAt fields automatically
        //minimize: false   // will make sure all properties exist, even if null
    });




const Dish_caloriesAndMacrosModel = mongoose.model('dish_caloriesandmacros', dish_caloriesAndMacrosSchema);

module.exports = Dish_caloriesAndMacrosModel;
